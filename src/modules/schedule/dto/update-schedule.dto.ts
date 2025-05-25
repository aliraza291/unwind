import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsString, IsNumber, IsOptional } from 'class-validator';
import { CreateScheduleDto } from './create-schedule.dto';
import { DayOfWeek, SlotStatus } from '../entities/schedule.entity';

export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {
  @ApiProperty({
    description: 'Day of the week',
    enum: DayOfWeek,
    required: false,
  })
  @IsOptional()
  @IsEnum(DayOfWeek)
  dayOfWeek?: DayOfWeek;

  @ApiProperty({
    description: 'Start time in HH:MM format',
    example: '09:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({
    description: 'End time in HH:MM format',
    example: '17:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiProperty({
    description: 'Status of the slot',
    enum: SlotStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(SlotStatus)
  status?: SlotStatus;

  @ApiProperty({
    description: 'Fee for audio sessions',
    example: 50.0,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  audioFee?: number;

  @ApiProperty({
    description: 'Fee for video sessions',
    example: 75.0,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  videoFee?: number;

  @ApiProperty({
    description: 'Fee for audio/video sessions',
    example: 100.0,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  audioVideoFee?: number;

  @ApiProperty({
    description: 'Fee for text sessions',
    example: 30.0,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  textFee?: number;
}
