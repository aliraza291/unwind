import { Column, Entity, ManyToOne } from 'typeorm';
import Model from '../../../common/entities/base.entity';
import { Therapist } from './therapist.entity';

@Entity()
export class TherapistEmployment extends Model {
  @Column()
  jobTitle: string;

  @Column()
  employer: string;

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endDate: Date;

  @ManyToOne(() => Therapist, (therapist) => therapist.employmentHistory, {
    onDelete: 'CASCADE',
  })
  therapist: Therapist;
}
