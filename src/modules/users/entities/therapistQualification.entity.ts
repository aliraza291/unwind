import { Column, Entity, ManyToOne } from 'typeorm';
import Model from '../../../common/entities/base.entity';
import { Therapist } from './therapist.entity';

@Entity()
export class TherapistQualification extends Model {
  @Column()
  degreeTitle: string;

  @Column()
  completionYear: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  cgpa: number;

  @Column()
  city: string;

  @Column()
  institute: string;

  @Column({ nullable: true })
  specialization: string;

  @ManyToOne(() => Therapist, (therapist) => therapist.qualifications, {
    onDelete: 'CASCADE',
  })
  therapist: Therapist;
}
