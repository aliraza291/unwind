import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsController } from './appointments.controller';

import { Appointment } from './entities/appointment.entity';
import { Note } from './entities/note.entity';
import { GroupTherapy } from './entities/group.therapy.entity';
import { Therapist } from '../users/entities/therapist.entity';
import { Individual } from '../users/entities/individual.entity';
import { Schedule } from '../schedule/entities/schedule.entity';
import { AppointmentsService } from './appointments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      Note,
      GroupTherapy,
      Therapist,
      Individual,
      Schedule,
    ]),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
