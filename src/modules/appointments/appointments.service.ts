import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import {
  Appointment,
  AppointmentStatus,
  SessionType,
} from './entities/appointment.entity';
import { Note } from './entities/note.entity';
import {
  Schedule,
  SlotStatus,
  DayOfWeek,
} from '../schedule/entities/schedule.entity';
import { Therapist } from '../users/entities/therapist.entity';
import { Individual } from '../users/entities/individual.entity';

import type { UpdateAppointmentDto } from './dto/update-appointment.dto';
import type { CreateNoteDto } from './dto/create-note.dto';
import type { CreateAppointmentDto } from './dto/create-appointment.dto';
import { GroupTherapy } from './entities/group.therapy.entity';
import {
  CreateGroupTherapyDto,
  GroupTherapyQueryDto,
  JoinGroupTherapyDto,
  UpdateGroupTherapyDto,
} from './dto/create-group-therepy.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Note)
    private notesRepository: Repository<Note>,
    @InjectRepository(Therapist)
    private therapistsRepository: Repository<Therapist>,
    @InjectRepository(Individual)
    private individualsRepository: Repository<Individual>,
    @InjectRepository(Schedule)
    readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(GroupTherapy)
    private groupTherapyRepository: Repository<GroupTherapy>,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    // Verify therapist exists
    const therapist = await this.therapistsRepository.findOne({
      where: { id: createAppointmentDto.therapistId },
    });

    if (!therapist) {
      throw new NotFoundException(
        `Therapist with ID ${createAppointmentDto.therapistId} not found`,
      );
    }

    // Verify patient exists
    const patient = await this.individualsRepository.findOne({
      where: { id: createAppointmentDto.patientId },
    });

    if (!patient) {
      throw new NotFoundException(
        `Patient with ID ${createAppointmentDto.patientId} not found`,
      );
    }

    // Get consultancy fee if not provided
    let consultancyFee = createAppointmentDto.consultancyFee;

    if (!consultancyFee) {
      // Find the latest schedule for this therapist to get the fee
      const latestSchedule = await this.scheduleRepository.findOne({
        where: { therapistId: createAppointmentDto.therapistId },
        order: { createdAt: 'DESC' },
      });

      if (latestSchedule) {
        switch (createAppointmentDto.sessionType) {
          case SessionType.AUDIO:
            consultancyFee = Number(latestSchedule.audioFee);
            break;
          case SessionType.VIDEO:
            consultancyFee = Number(latestSchedule.videoFee);
            break;
          case SessionType.AUDIO_VIDEO:
            consultancyFee = Number(latestSchedule.audioVideoFee);
            break;
          case SessionType.TEXT:
            consultancyFee = Number(latestSchedule.textFee);
            break;
          default:
            consultancyFee = 0;
        }
      }
    }

    // Create appointment
    const appointment = new Appointment();
    appointment.startTime = new Date(createAppointmentDto.startTime);
    appointment.endTime = new Date(createAppointmentDto.endTime);
    appointment.sessionType = createAppointmentDto.sessionType;
    appointment.status =
      createAppointmentDto.status || AppointmentStatus.UPCOMING;
    appointment.therapistId = createAppointmentDto.therapistId;
    appointment.patientId = createAppointmentDto.patientId;
    appointment.consultancyFee = consultancyFee || 0;

    if (createAppointmentDto.duration) {
      appointment.duration = createAppointmentDto.duration;
    }

    if (createAppointmentDto.summary) {
      appointment.summary = createAppointmentDto.summary;
    }

    // Update schedule slot status to booked
    const startTime = new Date(createAppointmentDto.startTime);
    const dayIndex = startTime.getDay();
    const dayOfWeekMap: Record<number, DayOfWeek> = {
      0: DayOfWeek.SUNDAY,
      1: DayOfWeek.MONDAY,
      2: DayOfWeek.TUESDAY,
      3: DayOfWeek.WEDNESDAY,
      4: DayOfWeek.THURSDAY,
      5: DayOfWeek.FRIDAY,
      6: DayOfWeek.SATURDAY,
    };
    const dayOfWeek = dayOfWeekMap[dayIndex];

    const scheduleTime = `${startTime.getHours().toString().padStart(2, '0')}:${startTime
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    // Find matching schedule slot
    const scheduleSlot = await this.scheduleRepository.findOne({
      where: {
        therapistId: createAppointmentDto.therapistId,
        dayOfWeek,
        startTime: scheduleTime,
      },
    });

    if (scheduleSlot) {
      scheduleSlot.status = SlotStatus.BOOKED;
      await this.scheduleRepository.save(scheduleSlot);
    }

    return this.appointmentsRepository.save(appointment);
  }

  async findAll(options: {
    page: number;
    limit: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    therapistId?: string;
    clientId?: string;
  }) {
    const queryBuilder = this.appointmentsRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.therapist', 'therapist')
      .leftJoinAndSelect('appointment.patient', 'patient');

    if (options.status) {
      queryBuilder.andWhere('appointment.status = :status', {
        status: options.status,
      });
    }
    if (options.therapistId) {
      queryBuilder.andWhere('therapist.id:id', {
        id: options.therapistId,
      });
    }
    if (options.clientId) {
      queryBuilder.andWhere('patient.id:id', {
        id: options.clientId,
      });
    }
    if (options.startDate) {
      const startDate = new Date(options.startDate);
      startDate.setHours(0, 0, 0, 0);
      queryBuilder.andWhere('appointment.startTime >= :startDate', {
        startDate,
      });
    }

    if (options.endDate) {
      const endDate = new Date(options.endDate);
      endDate.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('appointment.endTime <= :endDate', { endDate });
    }

    const [appointments, total] = await queryBuilder
      .skip((options.page - 1) * options.limit)
      .take(options.limit)
      .orderBy('appointment.startTime', 'ASC')
      .getManyAndCount();

    return {
      data: appointments,
      meta: {
        total,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil(total / options.limit),
      },
    };
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['therapist', 'patient', 'notes', 'notes.createdBy'],
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);

    // Update fields
    if (updateAppointmentDto.startTime) {
      appointment.startTime = new Date(updateAppointmentDto.startTime);
    }

    if (updateAppointmentDto.endTime) {
      appointment.endTime = new Date(updateAppointmentDto.endTime);
    }

    // Update other fields
    if (updateAppointmentDto.sessionType !== undefined) {
      appointment.sessionType = updateAppointmentDto.sessionType;
    }

    if (updateAppointmentDto.status !== undefined) {
      appointment.status = updateAppointmentDto.status;
    }

    if (updateAppointmentDto.duration !== undefined) {
      appointment.duration = updateAppointmentDto.duration;
    }

    if (updateAppointmentDto.summary !== undefined) {
      appointment.summary = updateAppointmentDto.summary;
    }

    if (updateAppointmentDto.consultancyFee !== undefined) {
      appointment.consultancyFee = updateAppointmentDto.consultancyFee;
    }

    return this.appointmentsRepository.save(appointment);
  }

  async remove(id: string): Promise<void> {
    const appointment = await this.findOne(id);

    // Update schedule slot status back to available
    const dayIndex = appointment.startTime.getDay();
    const dayOfWeekMap: Record<number, DayOfWeek> = {
      0: DayOfWeek.SUNDAY,
      1: DayOfWeek.MONDAY,
      2: DayOfWeek.TUESDAY,
      3: DayOfWeek.WEDNESDAY,
      4: DayOfWeek.THURSDAY,
      5: DayOfWeek.FRIDAY,
      6: DayOfWeek.SATURDAY,
    };
    const dayOfWeek = dayOfWeekMap[dayIndex];

    const scheduleTime = `${appointment.startTime.getHours().toString().padStart(2, '0')}:${appointment.startTime
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    // Find matching schedule slot
    const scheduleSlot = await this.scheduleRepository.findOne({
      where: {
        therapistId: appointment.therapistId,
        dayOfWeek,
        startTime: scheduleTime,
      },
    });

    if (scheduleSlot) {
      scheduleSlot.status = SlotStatus.AVAILABLE;
      await this.scheduleRepository.save(scheduleSlot);
    }

    await this.appointmentsRepository.remove(appointment);
  }

  async cancelAppointment(id: string): Promise<Appointment> {
    const appointment = await this.findOne(id);

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed appointment');
    }

    appointment.status = AppointmentStatus.CANCELLED;

    // Update schedule slot status back to available
    const dayIndex = appointment.startTime.getDay();
    const dayOfWeekMap: Record<number, DayOfWeek> = {
      0: DayOfWeek.SUNDAY,
      1: DayOfWeek.MONDAY,
      2: DayOfWeek.TUESDAY,
      3: DayOfWeek.WEDNESDAY,
      4: DayOfWeek.THURSDAY,
      5: DayOfWeek.FRIDAY,
      6: DayOfWeek.SATURDAY,
    };
    const dayOfWeek = dayOfWeekMap[dayIndex];

    const scheduleTime = `${appointment.startTime.getHours().toString().padStart(2, '0')}:${appointment.startTime
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    // Find matching schedule slot
    const scheduleSlot = await this.scheduleRepository.findOne({
      where: {
        therapistId: appointment.therapistId,
        dayOfWeek,
        startTime: scheduleTime,
      },
    });

    if (scheduleSlot) {
      scheduleSlot.status = SlotStatus.AVAILABLE;
      await this.scheduleRepository.save(scheduleSlot);
    }

    return this.appointmentsRepository.save(appointment);
  }

  async rescheduleAppointment(
    id: string,
    rescheduleData: { startTime: string; endTime: string },
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException(
        'Cannot reschedule a completed appointment',
      );
    }

    // Update old schedule slot status back to available
    const oldDayIndex = appointment.startTime.getDay();
    const dayOfWeekMap: Record<number, DayOfWeek> = {
      0: DayOfWeek.SUNDAY,
      1: DayOfWeek.MONDAY,
      2: DayOfWeek.TUESDAY,
      3: DayOfWeek.WEDNESDAY,
      4: DayOfWeek.THURSDAY,
      5: DayOfWeek.FRIDAY,
      6: DayOfWeek.SATURDAY,
    };
    const oldDayOfWeek = dayOfWeekMap[oldDayIndex];

    const oldScheduleTime = `${appointment.startTime.getHours().toString().padStart(2, '0')}:${appointment.startTime
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    // Find matching old schedule slot
    const oldScheduleSlot = await this.scheduleRepository.findOne({
      where: {
        therapistId: appointment.therapistId,
        dayOfWeek: oldDayOfWeek,
        startTime: oldScheduleTime,
      },
    });

    if (oldScheduleSlot) {
      oldScheduleSlot.status = SlotStatus.AVAILABLE;
      await this.scheduleRepository.save(oldScheduleSlot);
    }

    // Update appointment
    appointment.startTime = new Date(rescheduleData.startTime);
    appointment.endTime = new Date(rescheduleData.endTime);
    appointment.status = AppointmentStatus.RESCHEDULED;

    // Update new schedule slot status to booked
    const newStartTime = new Date(rescheduleData.startTime);
    const newDayIndex = newStartTime.getDay();
    const newDayOfWeek = dayOfWeekMap[newDayIndex];

    const newScheduleTime = `${newStartTime.getHours().toString().padStart(2, '0')}:${newStartTime
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    // Find matching new schedule slot
    const newScheduleSlot = await this.scheduleRepository.findOne({
      where: {
        therapistId: appointment.therapistId,
        dayOfWeek: newDayOfWeek,
        startTime: newScheduleTime,
      },
    });

    if (newScheduleSlot) {
      newScheduleSlot.status = SlotStatus.BOOKED;
      await this.scheduleRepository.save(newScheduleSlot);
    }

    return this.appointmentsRepository.save(appointment);
  }

  async completeAppointment(id: string): Promise<Appointment> {
    const appointment = await this.findOne(id);

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Cannot complete a cancelled appointment');
    }

    appointment.status = AppointmentStatus.COMPLETED;
    return this.appointmentsRepository.save(appointment);
  }

  async addNote(id: string, createNoteDto: CreateNoteDto) {
    const appointment = await this.findOne(id);

    // Verify therapist exists
    const therapist = await this.therapistsRepository.findOne({
      where: { id: createNoteDto.createdById },
    });

    if (!therapist) {
      throw new NotFoundException(
        `Therapist with ID ${createNoteDto.createdById} not found`,
      );
    }

    const note = this.notesRepository.create({
      ...createNoteDto,
      appointment,
      createdBy: therapist,
    });

    return this.notesRepository.save(note);
  }

  async getNotes(id: string) {
    const appointment = await this.findOne(id);

    const notes = await this.notesRepository.find({
      where: { appointment: { id: appointment.id } },
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });

    return notes;
  }

  async getAppointmentSummary(
    userId?: string,
    userType?: 'therapist' | 'patient',
  ) {
    let totalAppointmentsQuery =
      this.appointmentsRepository.createQueryBuilder('appointment');
    let audioVideoSessionsQuery =
      this.appointmentsRepository.createQueryBuilder('appointment');
    let groupTherapiesQuery = this.appointmentsRepository
      .createQueryBuilder('groupTherapy')
      .from('group_therapy', 'groupTherapy');
    let testSessionsQuery =
      this.appointmentsRepository.createQueryBuilder('appointment');

    // Apply user filters if provided
    if (userId && userType) {
      if (userType === 'therapist') {
        totalAppointmentsQuery = totalAppointmentsQuery.where(
          'appointment.therapistId = :userId',
          { userId },
        );
        audioVideoSessionsQuery = audioVideoSessionsQuery.where(
          'appointment.therapistId = :userId',
          { userId },
        );
        groupTherapiesQuery = groupTherapiesQuery.where(
          'groupTherapy.therapistId = :userId',
          { userId },
        );
        testSessionsQuery = testSessionsQuery.where(
          'appointment.therapistId = :userId',
          { userId },
        );
      } else if (userType === 'patient') {
        totalAppointmentsQuery = totalAppointmentsQuery.where(
          'appointment.patientId = :userId',
          { userId },
        );
        audioVideoSessionsQuery = audioVideoSessionsQuery.where(
          'appointment.patientId = :userId',
          { userId },
        );
        // For group therapies, we need to check the participants
        groupTherapiesQuery = groupTherapiesQuery
          .innerJoin(
            'group_therapy_participants',
            'gtp',
            'gtp.groupTherapyId = groupTherapy.id',
          )
          .where('gtp.individualId = :userId', { userId });
        testSessionsQuery = testSessionsQuery.where(
          'appointment.patientId = :userId',
          { userId },
        );
      }
    }

    // Add session type filters
    audioVideoSessionsQuery = audioVideoSessionsQuery.andWhere(
      'appointment.sessionType IN (:...types)',
      {
        types: ['Audio', 'Video', 'Audio/Video'],
      },
    );

    testSessionsQuery = testSessionsQuery.andWhere(
      'appointment.sessionType = :type',
      { type: 'Test' },
    );

    // Get counts
    const totalAppointments = await totalAppointmentsQuery.getCount();
    const audioVideoSessions = await audioVideoSessionsQuery.getCount();
    const groupTherapies = await groupTherapiesQuery.getCount();
    const testSessions = await testSessionsQuery.getCount();

    // Calculate total earnings if therapist
    let totalEarnings = 0;
    if (userType === 'therapist' && userId) {
      const completedAppointments = await this.appointmentsRepository.find({
        where: {
          therapistId: userId,
          status: AppointmentStatus.COMPLETED,
        },
      });

      totalEarnings = completedAppointments.reduce(
        (sum, appointment) => sum + Number(appointment.consultancyFee || 0),
        0,
      );
    }

    return {
      totalAppointments,
      audioVideoSessions,
      groupTherapies,
      testSessions,
      totalEarnings,
    };
  }

  async getWeeklySchedule(
    userId: string,
    userType: 'therapist' | 'patient',
    startDateStr?: string,
  ) {
    // Determine start and end dates for the week
    let startDate: Date;
    if (startDateStr) {
      startDate = new Date(startDateStr);
    } else {
      startDate = new Date();
      // Set to the beginning of the current week (Sunday)
      const day = startDate.getDay();
      startDate.setDate(startDate.getDate() - day);
    }

    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    // Build query based on user type
    let query = this.appointmentsRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.therapist', 'therapist')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .where('appointment.startTime >= :startDate', { startDate })
      .andWhere('appointment.endTime <= :endDate', { endDate });

    if (userType === 'therapist') {
      query = query.andWhere('appointment.therapistId = :userId', { userId });
    } else if (userType === 'patient') {
      query = query.andWhere('appointment.patientId = :userId', { userId });
    }

    const appointments = await query
      .orderBy('appointment.startTime', 'ASC')
      .getMany();

    // Group appointments by day
    const weeklySchedule = {};

    // Initialize days of the week
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      const dateStr = day.toISOString().split('T')[0];
      weeklySchedule[dateStr] = [];
    }

    // Add appointments to their respective days
    appointments.forEach((appointment) => {
      const dateStr = appointment.startTime.toISOString().split('T')[0];
      if (weeklySchedule[dateStr]) {
        weeklySchedule[dateStr].push(appointment);
      }
    });

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      schedule: weeklySchedule,
    };
  }

  async creatSession(
    createGroupTherapyDto: CreateGroupTherapyDto,
  ): Promise<GroupTherapy> {
    // Verify moderator exists
    const moderator = await this.therapistsRepository.findOne({
      where: { id: createGroupTherapyDto.moderatorId },
    });

    if (!moderator) {
      throw new NotFoundException('Moderator not found');
    }

    // Check if the date is in the future
    if (new Date(createGroupTherapyDto.date) <= new Date()) {
      throw new BadRequestException('Session date must be in the future');
    }

    const groupTherapy = this.groupTherapyRepository.create({
      ...createGroupTherapyDto,
      moderator,
    });

    return await this.groupTherapyRepository.save(groupTherapy);
  }

  async findAllSession(query: GroupTherapyQueryDto) {
    const { topic, moderatorId, availableOnly, page = 1, limit = 10 } = query;

    const queryBuilder = this.groupTherapyRepository
      .createQueryBuilder('groupTherapy')
      .leftJoinAndSelect('groupTherapy.moderator', 'moderator')
      .leftJoinAndSelect('groupTherapy.participants', 'participants')
      .orderBy('groupTherapy.date', 'ASC');

    if (topic) {
      queryBuilder.andWhere('groupTherapy.discussionTopic = :topic', { topic });
    }

    if (moderatorId) {
      queryBuilder.andWhere('groupTherapy.moderatorId = :moderatorId', {
        moderatorId,
      });
    }

    if (availableOnly) {
      queryBuilder.andWhere(
        'COALESCE(array_length(ARRAY(SELECT 1 FROM group_therapy_participants WHERE "groupTherapyId" = groupTherapy.id), 1), 0) < groupTherapy.participantCapacity',
      );
    }

    // Only show future sessions
    queryBuilder.andWhere('groupTherapy.date > :now', { now: new Date() });

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneSession(id: string): Promise<GroupTherapy> {
    const groupTherapy = await this.groupTherapyRepository.findOne({
      where: { id },
      relations: ['moderator', 'participants'],
    });

    if (!groupTherapy) {
      throw new NotFoundException('Group therapy session not found');
    }

    return groupTherapy;
  }

  async updateSession(
    id: string,
    updateGroupTherapyDto: UpdateGroupTherapyDto,
  ): Promise<GroupTherapy> {
    const groupTherapy = await this.groupTherapyRepository.findOne({
      where: { id: id },
    });

    // If updating moderator, verify new moderator exists
    if (updateGroupTherapyDto.moderatorId) {
      const moderator = await this.therapistsRepository.findOne({
        where: { id: updateGroupTherapyDto.moderatorId },
      });

      if (!moderator) {
        throw new NotFoundException('Moderator not found');
      }
    }

    // Check if the new date is in the future
    if (
      updateGroupTherapyDto.date &&
      new Date(updateGroupTherapyDto.date) <= new Date()
    ) {
      throw new BadRequestException('Session date must be in the future');
    }

    // If reducing capacity, check if current participants exceed new capacity
    if (updateGroupTherapyDto.participantCapacity) {
      const currentParticipantCount = groupTherapy.participants?.length || 0;
      if (updateGroupTherapyDto.participantCapacity < currentParticipantCount) {
        throw new BadRequestException(
          `Cannot reduce capacity below current participant count (${currentParticipantCount})`,
        );
      }
    }

    Object.assign(groupTherapy, updateGroupTherapyDto);
    return await this.groupTherapyRepository.save(groupTherapy);
  }

  async removeSession(id: string): Promise<void> {
    const groupTherapy = await this.groupTherapyRepository.findOne({
      where: { id: id },
    });
    await this.groupTherapyRepository.remove(groupTherapy);
  }

  async joinSession(
    id: string,
    joinGroupTherapyDto: JoinGroupTherapyDto,
  ): Promise<GroupTherapy> {
    const groupTherapy = await this.groupTherapyRepository.findOne({
      where: { id: id },
    });

    // Check if session is full
    if (groupTherapy.isFull) {
      throw new ConflictException('Group therapy session is full');
    }

    // Check if session date has passed
    if (new Date(groupTherapy.date) <= new Date()) {
      throw new BadRequestException(
        'Cannot join a session that has already started or passed',
      );
    }

    // Verify individual exists
    const individual = await this.individualsRepository.findOne({
      where: { id: joinGroupTherapyDto.individualId },
    });

    if (!individual) {
      throw new NotFoundException('Individual not found');
    }

    // Check if individual is already in the session
    const isAlreadyParticipant = groupTherapy.participants.some(
      (participant) => participant.id === joinGroupTherapyDto.individualId,
    );

    if (isAlreadyParticipant) {
      throw new ConflictException(
        'Individual is already a participant in this session',
      );
    }

    // Add participant
    groupTherapy.participants.push(individual);
    return await this.groupTherapyRepository.save(groupTherapy);
  }

  async leaveSession(id: string, individualId: string): Promise<GroupTherapy> {
    const groupTherapy = await this.groupTherapyRepository.findOne({
      where: { id: id },
    });

    // Check if session date has passed
    if (new Date(groupTherapy.date) <= new Date()) {
      throw new BadRequestException(
        'Cannot leave a session that has already started or passed',
      );
    }

    // Check if individual is a participant
    const participantIndex = groupTherapy.participants.findIndex(
      (participant) => participant.id === individualId,
    );

    if (participantIndex === -1) {
      throw new NotFoundException(
        'Individual is not a participant in this session',
      );
    }

    // Remove participant
    groupTherapy.participants.splice(participantIndex, 1);
    return await this.groupTherapyRepository.save(groupTherapy);
  }

  async getSessionsByModerator(
    moderatorId: string,
    query: GroupTherapyQueryDto,
  ) {
    return this.groupTherapyRepository.find({
      ...query,
      where: { moderatorId },
    });
  }

  async getSessionsByParticipant(
    individualId: string,
    query: GroupTherapyQueryDto,
  ) {
    const { page = 1, limit = 10 } = query;

    const queryBuilder = this.groupTherapyRepository
      .createQueryBuilder('groupTherapy')
      .leftJoinAndSelect('groupTherapy.moderator', 'moderator')
      .leftJoinAndSelect('groupTherapy.participants', 'participants')
      .where('participants.id = :individualId', { individualId })
      .orderBy('groupTherapy.date', 'ASC');

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
