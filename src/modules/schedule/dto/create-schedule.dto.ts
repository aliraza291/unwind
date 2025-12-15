import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEnum,
  IsString,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsArray,
} from 'class-validator';
import { DayOfWeek } from '../entities/schedule.entity';

export class CreateScheduleDto {
  @ApiProperty({
    description: 'Day of the week',
    enum: DayOfWeek,
    example: DayOfWeek.MONDAY,
  })
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiProperty({ description: 'Start time in HH:MM format', example: '09:00' })
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty({ description: 'End time in HH:MM format', example: '17:00' })
  @IsNotEmpty()
  @IsString()
  endTime: string;

  @ApiProperty({
    description: 'Whether this time slot is available',
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ description: 'ID of the therapist' })
  @IsNotEmpty()
  @IsString()
  therapistId: string;

  @ApiProperty({ example: 1000 })
  @IsOptional()
  @IsNumber()
  audioFee?: number;

  @ApiProperty({ example: 800 })
  @IsOptional()
  @IsNumber()
  videoFee?: number;

  @ApiProperty({ example: 1500 })
  @IsOptional()
  @IsNumber()
  audioVideoFee?: number;

  @ApiProperty({ example: 500 })
  @IsOptional()
  @IsNumber()
  textFee?: number;

  @ApiProperty({
    description: 'Available slots in HH:mm format',
    example: ['09:00', '10:00', '11:00'],
  })
  @IsArray()
  @IsString({ each: true })
  availableSlots: string[];

  @ApiProperty({
    description: 'Booked slots in HH:mm format',
    example: ['10:00'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bookedSlots?: string[];
}
