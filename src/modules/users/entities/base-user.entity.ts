import { Column, Entity, ManyToOne } from 'typeorm';
import Model from '../../../common/entities/base.entity';
import { Company } from './company.entity';
import { UserType } from '@/common/enums/role-type.enum';

@Entity()
export class BaseUser extends Model {
  @Column({ nullable: true })
  userName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phoneNumber: string;

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

  // This establishes the relationship with Company
  @ManyToOne(() => Company, (company: any) => company.users, { nullable: true })
  company: Company;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.INDIVIDUAL,
  })
  userType: UserType;
}
