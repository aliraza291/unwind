import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { Company } from '../users/entities/company.entity';
import { Employee } from './entities/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Company])],
  controllers: [EmployeeController],
  providers: [EmployeeService],
})
export class EmployeeModule {}
