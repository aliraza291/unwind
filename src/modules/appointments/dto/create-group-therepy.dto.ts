import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDate,
  IsPositive,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GroupTherapyTopic } from '../entities/group.therapy.entity';

export class CreateGroupTherapyDto {
  @ApiProperty({ description: 'Title of the group therapy session' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Number of sessions', minimum: 1, maximum: 50 })
  @IsNumber()
  @Min(1)
  @Max(50)
  numberOfSessions: number;

  @ApiProperty({
    enum: GroupTherapyTopic,
    description: 'Discussion topic for the group therapy',
  })
  @IsEnum(GroupTherapyTopic)
  discussionTopic: GroupTherapyTopic;

  @ApiPropertyOptional({ description: 'About the session description' })
  @IsOptional()
  @IsString()
  aboutTheSession?: string;

  @ApiProperty({ description: 'Date and time of the session' })
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiProperty({ description: 'Session price', minimum: 0 })
  @IsNumber()
  @IsPositive()
  sessionPrice: number;

  @ApiProperty({ description: 'Maximum participant capacity', minimum: 1 })
  @IsNumber()
  @Min(1)
  @Max(20)
  participantCapacity: number;

  @ApiProperty({ description: 'Moderator (Therapist) ID' })
  @IsUUID()
  moderatorId: string;
}

export class UpdateGroupTherapyDto {
  @ApiPropertyOptional({ description: 'Title of the group therapy session' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Number of sessions',
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  numberOfSessions?: number;

  @ApiPropertyOptional({
    enum: GroupTherapyTopic,
    description: 'Discussion topic for the group therapy',
  })
  @IsOptional()
  @IsEnum(GroupTherapyTopic)
  discussionTopic?: GroupTherapyTopic;

  @ApiPropertyOptional({ description: 'About the session description' })
  @IsOptional()
  @IsString()
  aboutTheSession?: string;

  @ApiPropertyOptional({ description: 'Date and time of the session' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;

  @ApiPropertyOptional({ description: 'Session price', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  sessionPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum participant capacity',
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  participantCapacity?: number;

  @ApiPropertyOptional({ description: 'Moderator (Therapist) ID' })
  @IsOptional()
  @IsUUID()
  moderatorId?: string;
}

export class JoinGroupTherapyDto {
  @ApiProperty({ description: 'Individual ID who wants to join' })
  @IsUUID()
  individualId: string;
}

export class GroupTherapyQueryDto {
  @ApiPropertyOptional({ description: 'Filter by discussion topic' })
  @IsOptional()
  @IsEnum(GroupTherapyTopic)
  topic?: GroupTherapyTopic;

  @ApiPropertyOptional({ description: 'Filter by moderator ID' })
  @IsOptional()
  @IsUUID()
  moderatorId?: string;

  @ApiPropertyOptional({
    description: 'Show only available sessions (not full)',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  availableOnly?: boolean;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
