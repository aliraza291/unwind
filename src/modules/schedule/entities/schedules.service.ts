import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, type Repository } from 'typeorm';
import { Schedule, SlotStatus, DayOfWeek } from './schedule.entity';
import { Therapist } from '../../users/entities/therapist.entity';
import { CreateScheduleRangeDto } from '../dto/create-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
    @InjectRepository(Therapist)
    private therapistsRepository: Repository<Therapist>,
  ) {}

  async createScheduleRange(
    createScheduleRangeDto: CreateScheduleRangeDto,
  ): Promise<Schedule[]> {
    // Verify therapist exists
    const therapist = await this.therapistsRepository.findOne({
      where: { id: createScheduleRangeDto.therapistId },
    });

    if (!therapist) {
      throw new NotFoundException(
        `Therapist with ID ${createScheduleRangeDto.therapistId} not found`,
      );
    }

    const {
      startDate,
      endDate,
      daysOfWeek,
      startTime,
      endTime,
      therapistId,
      slotDuration = 30,
      gapBetweenSlots = 0,
      audioFee = 0,
      videoFee = 0,
      audioVideoFee = 0,
      textFee = 0,
    } = createScheduleRangeDto;

    // Convert string dates to Date objects (UTC)
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Validate time format
    if (
      !this.isValidTimeFormat(startTime) ||
      !this.isValidTimeFormat(endTime)
    ) {
      throw new BadRequestException('Invalid time format. Use HH:MM format');
    }

    // Validate slot duration
    if (slotDuration <= 0) {
      throw new BadRequestException('Slot duration must be greater than 0');
    }

    // Generate time slots
    const timeSlots = this.generateTimeSlots(
      startTime,
      endTime,
      slotDuration,
      gapBetweenSlots,
    );

    if (timeSlots.length === 0) {
      throw new BadRequestException(
        'No valid time slots can be generated with the given parameters',
      );
    }

    // Map DayOfWeek enum to JavaScript day numbers (0 = Sunday, 1 = Monday, etc.)
    const dayMapping = {
      [DayOfWeek.SUNDAY]: 0,
      [DayOfWeek.MONDAY]: 1,
      [DayOfWeek.TUESDAY]: 2,
      [DayOfWeek.WEDNESDAY]: 3,
      [DayOfWeek.THURSDAY]: 4,
      [DayOfWeek.FRIDAY]: 5,
      [DayOfWeek.SATURDAY]: 6,
    };

    const selectedDayNumbers = daysOfWeek.map((day) => dayMapping[day]);
    const schedulesToCreate: Partial<Schedule>[] = [];

    // Iterate through each day in the date range
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getUTCDay(); // Use UTC day

      // Check if current day is in the selected days
      if (selectedDayNumbers.includes(dayOfWeek)) {
        const dayOfWeekEnum = Object.keys(dayMapping).find(
          (key) => dayMapping[key as DayOfWeek] === dayOfWeek,
        ) as DayOfWeek;

        // Create slots for each time slot
        for (const slot of timeSlots) {
          // Format current date for comparison (YYYY-MM-DD)
          const currentDateString = currentDate.toISOString().split('T')[0];

          // Check if schedule already exists for this specific date and time slot
          const existingSchedule = await this.schedulesRepository.findOne({
            where: {
              therapistId,
              date: currentDateString, // Check specific date instead of just dayOfWeek
              startTime: slot.startTime,
              endTime: slot.endTime,
            },
          });

          if (!existingSchedule) {
            schedulesToCreate.push({
              dayOfWeek: dayOfWeekEnum,
              date: currentDateString, // Add specific date
              startTime: slot.startTime,
              endTime: slot.endTime,
              status: SlotStatus.AVAILABLE,
              audioFee,
              videoFee,
              audioVideoFee,
              textFee,
              therapistId,
            });
          }
        }
      }

      // Move to next day (UTC)
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    if (schedulesToCreate.length === 0) {
      throw new BadRequestException(
        'No new schedules to create. All time slots may already exist for the selected days.',
      );
    }

    // Create all schedules in bulk
    const schedules = this.schedulesRepository.create(schedulesToCreate);
    const savedSchedules = await this.schedulesRepository.save(schedules);

    return savedSchedules;
  }

  // Helper method to generate time slots
  private generateTimeSlots(
    startTime: string,
    endTime: string,
    slotDuration: number,
    gapBetweenSlots: number,
  ): Array<{ startTime: string; endTime: string }> {
    const slots: Array<{ startTime: string; endTime: string }> = [];

    // Parse start and end times
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    // Convert to minutes from midnight
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (startMinutes >= endMinutes) {
      throw new BadRequestException('Start time must be before end time');
    }

    let currentMinutes = startMinutes;

    while (currentMinutes + slotDuration <= endMinutes) {
      const slotStartTime = this.minutesToTimeString(currentMinutes);
      const slotEndTime = this.minutesToTimeString(
        currentMinutes + slotDuration,
      );

      slots.push({
        startTime: slotStartTime,
        endTime: slotEndTime,
      });

      // Move to next slot (add slot duration + gap)
      currentMinutes += slotDuration + gapBetweenSlots;
    }

    return slots;
  }

  // Helper method to convert minutes to HH:MM format
  private minutesToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // Keep your existing isValidTimeFormat method

  // Helper method to validate time format (HH:MM)
  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  // Helper method to get dates for specific days in a range
  private getDatesForDaysInRange(
    startDate: Date,
    endDate: Date,
    selectedDays: DayOfWeek[],
  ): Date[] {
    const dayMapping = {
      [DayOfWeek.SUNDAY]: 0,
      [DayOfWeek.MONDAY]: 1,
      [DayOfWeek.TUESDAY]: 2,
      [DayOfWeek.WEDNESDAY]: 3,
      [DayOfWeek.THURSDAY]: 4,
      [DayOfWeek.FRIDAY]: 5,
      [DayOfWeek.SATURDAY]: 6,
    };

    const selectedDayNumbers = selectedDays.map((day) => dayMapping[day]);
    const dates: Date[] = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      if (selectedDayNumbers.includes(currentDate.getUTCDay())) {
        dates.push(new Date(currentDate));
      }
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return dates;
  }

  async findByDateRange(
    therapistId: string,
    startDate: string,
    endDate: string,
    status,
  ): Promise<Schedule[]> {
    // Verify therapist exists
    const therapist = await this.therapistsRepository.findOne({
      where: { id: therapistId },
    });

    if (!therapist) {
      throw new NotFoundException(`Therapist with ID ${therapistId} not found`);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Generate all dates in the range
    const datesInRange: string[] = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      datesInRange.push(dateString);
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    const whereCondition: any = {
      therapistId,
      date: In(datesInRange),
    };

    // Add status filter if provided
    if (status) {
      whereCondition.status = status;
    }

    // Use TypeORM's In operator to find schedules for all dates in range
    return this.schedulesRepository.find({
      where: whereCondition,
      order: {
        date: 'ASC',
        startTime: 'ASC',
      },
    });
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
