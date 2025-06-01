import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEnum,
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsDateString,
} from 'class-validator';
import { DayOfWeek } from '../entities/schedule.entity';

export class CreateScheduleRangeDto {
  @ApiProperty({
    description: 'Start date of the range in UTC',
    example: '2024-09-01T00:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date of the range in UTC',
    example: '2024-09-30T23:59:59.999Z',
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Selected days of the week',
    enum: DayOfWeek,
    isArray: true,
    example: [DayOfWeek.MONDAY, DayOfWeek.FRIDAY, DayOfWeek.TUESDAY],
  })
  @IsArray()
  @IsEnum(DayOfWeek, { each: true })
  daysOfWeek: DayOfWeek[];

  @ApiProperty({ description: 'Start time in HH:MM format', example: '09:00' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty({ description: 'End time in HH:MM format', example: '17:00' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  endTime: string;

  @ApiProperty({ description: 'ID of the therapist' })
  @IsNotEmpty()
  @IsString()
  therapistId: string;

  @ApiProperty({ example: 1000, required: false })
  @IsOptional()
  @IsNumber()
  audioFee?: number;

  @ApiProperty({ example: 800, required: false })
  @IsOptional()
  @IsNumber()
  videoFee?: number;

  @ApiProperty({ example: 1500, required: false })
  @IsOptional()
  @IsNumber()
  audioVideoFee?: number;

  @ApiProperty({ example: 500, required: false })
  @IsOptional()
  @IsNumber()
  textFee?: number;
}
