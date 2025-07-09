import { Column, Entity, OneToMany } from 'typeorm';
import { BaseUser } from './base-user.entity';
import { TherapistQualification } from './therapistQualification.entity';
import { TherapistEmployment } from './therapistEmployement.entity';
import { Appointment } from '@/modules/appointments/entities/appointment.entity';
import { GroupTherapy } from '@/modules/appointments/entities/group.therapy.entity';
import { Note } from '@/modules/appointments/entities/note.entity';
import { Schedule } from '@/modules/schedule/entities/schedule.entity';

@Entity()
export class Therapist extends BaseUser {
  @Column()
  age: number;

  @Column()
  genderIdentity: string;

  @Column()
  nationality: string;

  @Column({ default: true })
  isVerified: boolean;

  @Column({ nullable: true })
  specialization: string;

  @Column({ nullable: true })
  title: string;

  @Column('text', { array: true, nullable: true })
  expertise: string[];

  @Column({ nullable: true })
  cnic: string;

  @Column({ type: 'text', nullable: true })
  careerJourney: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ default: 'personal-info' }) // Or whatever your first step is
  profileCompletionStep:
    | 'personal-info'
    | 'qualifications'
    | 'employment'
    | 'complete';

  @Column({ default: false })
  isProfileComplete: boolean;

  @OneToMany(
    () => TherapistQualification,
    (qualification) => qualification.therapist,
    {
      cascade: true,
    },
  )
  qualifications: TherapistQualification[];

  @OneToMany(() => TherapistEmployment, (employment) => employment.therapist, {
    cascade: true,
  })
  employmentHistory: TherapistEmployment[];

  @OneToMany(() => Appointment, (appointment) => appointment.therapist)
  therapistAppointments: Appointment[];

  @OneToMany(() => GroupTherapy, (groupTherapy) => groupTherapy.moderator)
  groupTherapies: GroupTherapy[];

  @OneToMany(() => Note, (note) => note.createdBy)
  notes: Note[];

  @OneToMany(() => Schedule, (schedule) => schedule.therapist)
  scheduleSlots: Schedule[];
}
