import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import Model from '@/common/entities/base.entity';
import { Therapist } from '@/modules/users/entities/therapist.entity';

export enum DayOfWeek {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
  SUNDAY = 'Sunday',
}

export enum SlotStatus {
  AVAILABLE = 'Available',
  BOOKED = 'Booked',
  SELECTED = 'Selected',
}

@Entity()
export class Schedule extends Model {
  @Column({
    type: 'enum',
    enum: DayOfWeek,
  })
  dayOfWeek: DayOfWeek;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({
    type: 'enum',
    enum: SlotStatus,
    default: SlotStatus.AVAILABLE,
  })
  status: SlotStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  audioFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  videoFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  audioVideoFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  textFee: number;

  @ManyToOne(() => Therapist, (therapist) => therapist.scheduleSlots)
  @JoinColumn({ name: 'therapistId' })
  therapist: Therapist;

  @Column()
  therapistId: string;
}
