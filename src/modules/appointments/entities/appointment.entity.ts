import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import Model from '@/common/entities/base.entity';
import { Therapist } from '@/modules/users/entities/therapist.entity';
import { Individual } from '@/modules/users/entities/individual.entity';
import { Note } from './note.entity';

export enum SessionType {
  AUDIO = 'Audio',
  VIDEO = 'Video',
  AUDIO_VIDEO = 'Audio/Video',
  TEXT = 'Text',
  TEST = 'Test',
}

export enum AppointmentStatus {
  UPCOMING = 'Upcoming',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  RESCHEDULED = 'Rescheduled',
}

@Entity()
export class Appointment extends Model {
  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: SessionType,
    default: SessionType.AUDIO_VIDEO,
  })
  sessionType: SessionType;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.UPCOMING,
  })
  status: AppointmentStatus;

  @Column({ nullable: true })
  duration: number;

  @Column({ nullable: true })
  summary: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  consultancyFee: number;

  @ManyToOne(() => Therapist, (therapist) => therapist.therapistAppointments)
  @JoinColumn({ name: 'therapistId' })
  therapist: Therapist;

  @Column()
  therapistId: string;

  @ManyToOne(() => Individual, (individual) => individual.patientAppointments)
  @JoinColumn({ name: 'patientId' })
  patient: Individual;

  @Column()
  patientId: string;

  @OneToMany(() => Note, (note) => note.appointment, { cascade: true })
  notes: Note[];
}
