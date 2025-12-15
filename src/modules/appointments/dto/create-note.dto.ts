import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsString } from 'class-validator';
import { NoteType } from '../entities/note.entity';

export class CreateNoteDto {
  @ApiProperty({
    description: 'Type of note',
    enum: NoteType,
    example: NoteType.SESSION_NOTES,
  })
  @IsEnum(NoteType)
  type: NoteType;

  @ApiProperty({ description: 'Content of the note' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: 'ID of the appointment' })
  @IsNotEmpty()
  @IsString()
  appointmentId: string;

  @ApiProperty({ description: 'ID of the therapist who created the note' })
  @IsNotEmpty()
  @IsString()
  createdById: string;
}
