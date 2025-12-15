import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateScheduleDto } from './create-schedule.dto';

export class BulkCreateScheduleDto {
  @ApiProperty({ description: 'ID of the therapist' })
  @IsNotEmpty()
  @IsString()
  therapistId: string;

  @ApiProperty({
    description: 'Array of schedule slots to create',
    type: [CreateScheduleDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateScheduleDto)
  schedules: CreateScheduleDto[];
}
