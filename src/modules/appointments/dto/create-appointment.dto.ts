import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsString,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { SessionType, AppointmentStatus } from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'Start time of the appointment' })
  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: 'End time of the appointment' })
  @IsNotEmpty()
  @IsDateString()
  endTime: string;

  @ApiProperty({
    description: 'Type of session',
    enum: SessionType,
    example: SessionType.AUDIO_VIDEO,
  })
  @IsEnum(SessionType)
  sessionType: SessionType;

  @ApiProperty({
    description: 'Status of the appointment',
    enum: AppointmentStatus,
    example: AppointmentStatus.UPCOMING,
    required: false,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiProperty({
    description: 'Duration of the appointment in minutes',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({ description: 'Summary of the appointment', required: false })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({ description: 'ID of the therapist' })
  @IsNotEmpty()
  @IsString()
  therapistId: string;

  @ApiProperty({ description: 'ID of the patient' })
  @IsNotEmpty()
  @IsString()
  patientId: string;

  @ApiProperty({
    description: 'Consultancy fee for this appointment',
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  consultancyFee?: number;
}
