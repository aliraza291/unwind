import { UserType } from '@/common/enums/role-type.enum';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignupIndividualDto {
  @ApiProperty({
    description: 'Email address of the individual user',
    example: 'user@example.com',
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
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    description: 'Phone number of the individual',
    example: '+1234567890',
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Age of the individual',
    example: 28,
  })
  @IsNumber()
  @IsNotEmpty()
  age: number;

  @ApiProperty({
    description: 'Gender identity of the individual',
    example: 'Non-binary',
  })
  @IsString()
  @IsNotEmpty()
  genderIdentity: string;

  @ApiProperty({
    description: 'Preference for therapist (e.g., Male, Female, No Preference)',
    example: ['Male', 'No Preference'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  therapistPreference: string[];

  @ApiProperty({
    description: 'Reason(s) the individual is seeking therapy',
    example: ['Stress', 'Anxiety'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  reasonForTherapy: string[];

  @ApiPropertyOptional({
    description: 'ID of the company if the individual is associated with one',
    example: 'company-uuid-123',
  })
  @IsString()
  @IsOptional()
  companyId?: string;

  @ApiProperty({
    description: 'User type, default is INDIVIDUAL',
    enum: UserType,
    default: UserType.INDIVIDUAL,
  })
  @IsEnum(UserType)
  @IsNotEmpty()
  userType: UserType = UserType.INDIVIDUAL;
}
