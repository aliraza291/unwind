import { Column, Entity, OneToMany } from 'typeorm';
import { BaseUser } from './base-user.entity';
import Model from '../../../common/entities/base.entity';
import { UserType } from '@/common/enums/role-type.enum';
import { Employee } from '@/modules/employee/entities/employee.entity';

@Entity()
export class Company extends Model {
  @Column()
  organizationName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  employeeCount: number;

  @Column()
  workModel: string; // remote, hybrid, on-site

  @Column()
  subscriptionPlan: string; // basic, pro, enterprise

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  otp: string;

  @Column({ nullable: true })
  otpExpiry: Date;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true })
  resetPasswordExpiry: Date;

  // This establishes the inverse side of the relationship with users
  @OneToMany(() => BaseUser, (user) => user.company, { cascade: true })
  users: BaseUser[];

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.COMPANY,
  })
  userType: UserType = UserType.COMPANY;

  @OneToMany(() => Employee, (employee) => employee.organization)
  employees: Employee[];
}
