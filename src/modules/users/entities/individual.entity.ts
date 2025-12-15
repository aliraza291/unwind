import { Column, Entity, OneToMany, ManyToMany } from 'typeorm';
import { BaseUser } from './base-user.entity';
import { Appointment } from '@/modules/appointments/entities/appointment.entity';
import { GroupTherapy } from '@/modules/appointments/entities/group.therapy.entity';

@Entity()
export class Individual extends BaseUser {
  @Column()
  age: number;

  @Column()
  genderIdentity: string;

  @Column('text', { array: true, nullable: true })
  therapistPreference: string[];

  @Column('text', { array: true, nullable: true })
  reasonForTherapy: string[];

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  patientAppointments: Appointment[];

  @ManyToMany(() => GroupTherapy, (groupTherapy) => groupTherapy.participants)
  groupTherapySessions: GroupTherapy[];
}
