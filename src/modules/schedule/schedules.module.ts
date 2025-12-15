import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Schedule } from '../schedule/entities/schedule.entity';
import { Therapist } from '../users/entities/therapist.entity';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './entities/schedules.service';

@Module({
  imports: [TypeOrmModule.forFeature([Schedule, Therapist])],
  controllers: [SchedulesController],
  providers: [SchedulesService],
  exports: [SchedulesService],
})
export class ScheduleModule {}
