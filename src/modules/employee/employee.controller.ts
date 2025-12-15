import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create.dto';
import { Employee } from './entities/employee.entity';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto,
  ): Promise<Employee> {
    return this.employeeService.create(createEmployeeDto);
  }

  @Get()
  async findAll(
    @Query('organizationId') organizationId?: string,
  ): Promise<Employee[]> {
    if (organizationId) {
      return this.employeeService.findByOrganization(organizationId);
    }
    return this.employeeService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Employee> {
    return this.employeeService.findOne(id);
  }
}
