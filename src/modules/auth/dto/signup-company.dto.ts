import { UserType } from '@/common/enums/role-type.enum';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupCompanyDto {
  @ApiProperty({
    description: 'Name of the organization',
    example: 'Tech Solutions Inc.',
  })
  @IsString()
  @IsNotEmpty()
  organizationName: string;

  @ApiProperty({
    description: 'Email address of the company admin',
    example: 'admin@techsolutions.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password for the account. Must be at least 8 characters.',
    example: 'StrongPassword123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Number of employees in the organization',
    example: 50,
  })
  @IsNumber()
  @IsNotEmpty()
  employeeCount: number;

  @ApiProperty({
    description:
      'Type of work model used in the organization (e.g., Remote, Hybrid, Onsite)',
    example: 'Remote',
  })
  @IsString()
  @IsNotEmpty()
  workModel: string;

  @ApiProperty({
    description: 'Chosen subscription plan for the organization',
    example: 'Pro',
  })
  @IsString()
  @IsNotEmpty()
  subscriptionPlan: string;

  @ApiProperty({
    description: 'User type, default is COMPANY',
    enum: UserType,
    default: UserType.COMPANY,
  })
  @IsEnum(UserType)
  @IsNotEmpty()
  userType: UserType = UserType.COMPANY;
}
