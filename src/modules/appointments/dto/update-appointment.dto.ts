import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsString,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { CreateAppointmentDto } from './create-appointment.dto';
import { SessionType, AppointmentStatus } from '../entities/appointment.entity';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @ApiProperty({
    description: 'Start time of the appointment',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiProperty({ description: 'End time of the appointment', required: false })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiProperty({
    description: 'Type of session',
    enum: SessionType,
    required: false,
  })
  @IsOptional()
  @IsEnum(SessionType)
  sessionType?: SessionType;

  @ApiProperty({
    description: 'Status of the appointment',
    enum: AppointmentStatus,
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
}
