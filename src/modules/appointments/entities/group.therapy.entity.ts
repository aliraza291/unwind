import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import Model from '@/common/entities/base.entity';
import { Therapist } from '@/modules/users/entities/therapist.entity';
import { Individual } from '@/modules/users/entities/individual.entity';

@Entity()
export class GroupTherapy extends Model {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ default: 0 })
  maxParticipants: number;

  @ManyToOne(() => Therapist, (therapist) => therapist.groupTherapies)
  @JoinColumn({ name: 'therapistId' })
  therapist: Therapist;

  @Column()
  therapistId: string;

  @ManyToMany(() => Individual, (individual) => individual.groupTherapySessions)
  @JoinTable({
    name: 'group_therapy_participants',
    joinColumn: { name: 'groupTherapyId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'individualId', referencedColumnName: 'id' },
  })
  participants: Individual[];
}
