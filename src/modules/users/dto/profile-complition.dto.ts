import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QualificationDto {
  @ApiProperty({ example: 'BS Psychology' })
  @IsNotEmpty()
  @IsString()
  degreeTitle: string;

  @ApiProperty({ example: "05-18-2025" })
  @IsNotEmpty()
  @IsString()
  completionYear: string;

  @ApiPropertyOptional({ example: 3.7 })
  @IsOptional()
  @IsNumber()
  cgpa?: number;

  @ApiProperty({ example: 'Lahore' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ example: 'University of Lahore' })
  @IsNotEmpty()
  @IsString()
  institute: string;

  @ApiPropertyOptional({ example: 'Clinical Psychology' })
  @IsOptional()
  @IsString()
  specialization?: string;
}

export class EmploymentHistoryDto {
  @ApiProperty({ example: 'Therapist' })
  @IsNotEmpty()
  @IsString()
  jobTitle: string;

  @ApiProperty({ example: 'ABC Mental Health Center' })
  @IsNotEmpty()
  @IsString()
  employer: string;

  @ApiProperty({ example: '2022-01-01' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class TherapistProfileCompletionDto {
  @ApiProperty({ example: 'Dr.' })
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty({ example: ['Anxiety', 'Depression'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  expertise: string[];

  @ApiProperty({ example: '35202-1234567-1' })
  @IsOptional()
  @IsString()
  cnic: string;

  @ApiProperty({ example: 'Started my journey with...' })
  @IsOptional()
  @IsString()
  careerJourney: string;

  @ApiPropertyOptional({ example: 'https://example.com/profile.jpg' })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiProperty({ type: [QualificationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QualificationDto)
  @IsOptional()
  qualifications: QualificationDto[];

  @ApiProperty({ type: [EmploymentHistoryDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EmploymentHistoryDto)
  employmentHistory: EmploymentHistoryDto[];
}
