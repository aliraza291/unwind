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

export enum GroupTherapyTopic {
  DEPRESSION = 'Depression',
  ANXIETY = 'Anxiety',
  ADHD = 'ADHD',
  SLEEP_DISORDER = 'Sleep Disorder',
  BIPOLAR_DISORDER = 'Bipolar Disorder',
}

@Entity()
export class GroupTherapy extends Model {
  @Column()
  title: string;

  @Column()
  numberOfSessions: number;

  @Column({
    type: 'enum',
    enum: GroupTherapyTopic,
  })
  discussionTopic: GroupTherapyTopic;

  @Column({ type: 'text', nullable: true })
  aboutTheSession: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  sessionPrice: number;

  @Column({ default: 0 })
  participantCapacity: number;

  @ManyToOne(() => Therapist, (therapist) => therapist.groupTherapies)
  @JoinColumn({ name: 'moderatorId' })
  moderator: Therapist;

  @Column()
  moderatorId: string;

  @ManyToMany(() => Individual, (individual) => individual.groupTherapySessions)
  @JoinTable({
    name: 'group_therapy_participants',
    joinColumn: { name: 'groupTherapyId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'individualId', referencedColumnName: 'id' },
  })
  participants: Individual[];

  // Virtual property to get current participant count
  get currentParticipantCount(): number {
    return this.participants ? this.participants.length : 0;
  }

  // Check if group is full
  get isFull(): boolean {
    return this.currentParticipantCount >= this.participantCapacity;
  }
}
