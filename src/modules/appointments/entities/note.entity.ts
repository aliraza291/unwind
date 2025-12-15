import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import Model from '@/common/entities/base.entity';
import { Appointment } from './appointment.entity';
import { Therapist } from '@/modules/users/entities/therapist.entity';

export enum NoteType {
  SESSION_NOTES = 'Session Notes',
  PRIORITIES = 'Priorities',
  CHALLENGES = 'Challenges',
  SUGGESTED_SESSIONS = 'Suggested Sessions',
  NEXT_APPOINTMENT = 'Next Appointment',
}

@Entity()
export class Note extends Model {
  @Column({
    type: 'enum',
    enum: NoteType,
    default: NoteType.SESSION_NOTES,
  })
  type: NoteType;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => Appointment, (appointment) => appointment.notes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @Column()
  appointmentId: string;

  @ManyToOne(() => Therapist, (therapist) => therapist.notes)
  @JoinColumn({ name: 'createdById' })
  createdBy: Therapist;

  @Column()
  createdById: string;
}
