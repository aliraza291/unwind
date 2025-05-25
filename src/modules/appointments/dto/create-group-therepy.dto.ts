import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsDateString,
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateGroupTherapyDto {
  @ApiProperty({ description: 'Name of the group therapy session' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the group therapy session',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Start time of the group therapy session' })
  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: 'End time of the group therapy session' })
  @IsNotEmpty()
  @IsDateString()
  endTime: string;

  @ApiProperty({
    description: 'Maximum number of participants allowed',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  maxParticipants?: number;

  @ApiProperty({ description: 'ID of the therapist leading the session' })
  @IsNotEmpty()
  @IsString()
  therapistId: string;

  @ApiProperty({
    description: 'IDs of the participants',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  participantIds?: string[];
}
