import { UserType } from '@/common/enums/role-type.enum';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignupTherapistDto {
  @ApiProperty({
    description: 'Email address of the therapist',
    example: 'therapist@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'userName',
    example: 'abc',
  })
  @IsNotEmpty()
  userName: string;

  @ApiProperty({
    description: 'Password for the account. Must be at least 8 characters.',
    example: 'TherapistPass123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    description: 'Phone number of the therapist',
    example: '+1234567890',
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Age of the therapist',
    example: 35,
  })
  @IsNumber()
  @IsNotEmpty()
  age: number;

  @ApiProperty({
    description: 'Gender identity of the therapist',
    example: 'Female',
  })
  @IsString()
  @IsNotEmpty()
  genderIdentity: string;

  @ApiProperty({
    description: 'Nationality of the therapist',
    example: 'Canadian',
  })
  @IsString()
  @IsNotEmpty()
  nationality: string;

  @ApiPropertyOptional({
    description: 'Area of specialization (optional)',
    example: 'Cognitive Behavioral Therapy',
  })
  @IsString()
  @IsOptional()
  specialization?: string;

  @ApiProperty({
    description: 'User type, default is THERAPIST',
    enum: UserType,
    default: UserType.THERAPIST,
  })
  @IsEnum(UserType)
  @IsNotEmpty()
  userType: UserType = UserType.THERAPIST;

  @ApiPropertyOptional({
    description: 'company',
    example: 'companyId',
  })
  @IsString()
  company?: string;
}
