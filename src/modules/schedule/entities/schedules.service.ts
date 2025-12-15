import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Schedule, SlotStatus } from './schedule.entity';
import { Therapist } from '../../users/entities/therapist.entity';
import type { CreateScheduleDto } from '../dto/create-schedule.dto';
import { UpdateScheduleDto } from '../dto/update-schedule.dto';
import { BulkCreateScheduleDto } from '../dto/bulk-create-schedule';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
    @InjectRepository(Therapist)
    private therapistsRepository: Repository<Therapist>,
  ) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    // Verify therapist exists
    const therapist = await this.therapistsRepository.findOne({
      where: { id: createScheduleDto.therapistId },
    });

    if (!therapist) {
      throw new NotFoundException(
        `Therapist with ID ${createScheduleDto.therapistId} not found`,
      );
    }

    // Check for overlapping schedules
    const overlappingSchedule = await this.schedulesRepository.findOne({
      where: {
        therapistId: createScheduleDto.therapistId,
        dayOfWeek: createScheduleDto.dayOfWeek,
        startTime: createScheduleDto.startTime,
        endTime: createScheduleDto.endTime,
      },
    });

    if (overlappingSchedule) {
      throw new BadRequestException(
        'A schedule with the same time slot already exists',
      );
    }

    const schedule = this.schedulesRepository.create(createScheduleDto);
    return this.schedulesRepository.save(schedule);
  }

  async bulkCreate(
    bulkCreateScheduleDto: BulkCreateScheduleDto,
  ): Promise<Schedule[]> {
    // Verify therapist exists
    const therapist = await this.therapistsRepository.findOne({
      where: { id: bulkCreateScheduleDto.therapistId },
    });

    if (!therapist) {
      throw new NotFoundException(
        `Therapist with ID ${bulkCreateScheduleDto.therapistId} not found`,
      );
    }

    // Create all schedules
    const schedules = bulkCreateScheduleDto.schedules.map((scheduleDto) => {
      return this.schedulesRepository.create({
        ...scheduleDto,
        therapistId: bulkCreateScheduleDto.therapistId,
      });
    });

    return this.schedulesRepository.save(schedules);
  }

  async findAll(filters: {
    therapistId?: string;
    dayOfWeek?: string;
    status?: string;
  }) {
    const query = this.schedulesRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.therapist', 'therapist');

    if (filters.therapistId) {
      query.andWhere('schedule.therapistId = :therapistId', {
        therapistId: filters.therapistId,
      });
    }

    if (filters.dayOfWeek) {
      query.andWhere('schedule.dayOfWeek = :dayOfWeek', {
        dayOfWeek: filters.dayOfWeek,
      });
    }

    if (filters.status) {
      query.andWhere('schedule.status = :status', { status: filters.status });
    }

    return query.getMany();
  }

  async findByTherapist(therapistId: string): Promise<Schedule[]> {
    // Verify therapist exists
    const therapist = await this.therapistsRepository.findOne({
      where: { id: therapistId },
    });

    if (!therapist) {
      throw new NotFoundException(`Therapist with ID ${therapistId} not found`);
    }

    return this.schedulesRepository.find({
      where: { therapistId },
      order: {
        dayOfWeek: 'ASC',
        startTime: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Schedule> {
    const schedule = await this.schedulesRepository.findOne({
      where: { id },
      relations: ['therapist'],
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    return schedule;
  }

  async update(
    id: string,
    updateScheduleDto: UpdateScheduleDto,
  ): Promise<Schedule> {
    const schedule = await this.findOne(id);

    // If updating therapist, verify the therapist exists
    if (
      updateScheduleDto.therapistId &&
      updateScheduleDto.therapistId !== schedule.therapistId
    ) {
      const therapist = await this.therapistsRepository.findOne({
        where: { id: updateScheduleDto.therapistId },
      });

      if (!therapist) {
        throw new NotFoundException(
          `Therapist with ID ${updateScheduleDto.therapistId} not found`,
        );
      }
    }

    Object.assign(schedule, updateScheduleDto);
    return this.schedulesRepository.save(schedule);
  }

  async remove(id: string): Promise<void> {
    const schedule = await this.findOne(id);
    await this.schedulesRepository.remove(schedule);
  }

  async updateStatus(id: string, status: string): Promise<Schedule> {
    const schedule = await this.findOne(id);

    // Validate status
    if (!Object.values(SlotStatus).includes(status as SlotStatus)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    schedule.status = status as SlotStatus;
    return this.schedulesRepository.save(schedule);
  }

  async getConsultancyFees(therapistId: string) {
    // Verify therapist exists
    const therapist = await this.therapistsRepository.findOne({
      where: { id: therapistId },
    });

    if (!therapist) {
      throw new NotFoundException(`Therapist with ID ${therapistId} not found`);
    }

    // Get the latest schedule to extract fees
    const latestSchedule = await this.schedulesRepository.findOne({
      where: { therapistId },
      order: { createdAt: 'DESC' },
    });

    if (!latestSchedule) {
      return {
        audioFee: 0,
        videoFee: 0,
        audioVideoFee: 0,
        textFee: 0,
      };
    }

    return {
      audioFee: latestSchedule.audioFee,
      videoFee: latestSchedule.videoFee,
      audioVideoFee: latestSchedule.audioVideoFee,
      textFee: latestSchedule.textFee,
    };
  }
}
