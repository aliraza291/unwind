import { Company } from '@/modules/users/entities/company.entity';
import { Entity, Column, ManyToOne } from 'typeorm';
import Model from '../../../common/entities/base.entity';
@Entity()
export class Employee extends Model {
  @Column({ unique: true })
  empId: string;

  @Column()
  name: string;

  @Column()
  designation: string;

  @Column({ unique: true })
  emailId: string;

  @ManyToOne(() => Company, (com) => com.employees)
  organization: Company;
}
