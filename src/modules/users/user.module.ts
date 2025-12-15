import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Therapist } from '../users/entities/therapist.entity';

import { TherapistEmployment } from './entities/therapistEmployement.entity';
import { TherapistQualification } from './entities/therapistQualification.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TherapistQualification,
      Therapist,
      TherapistEmployment,
    ]),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
