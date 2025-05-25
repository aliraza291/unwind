import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { Company } from '../users/entities/company.entity';
import { CreateEmployeeDto } from './dto/create.dto';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Company)
    private organization: Repository<Company>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    // Check if employee with this empId or email already exists
    const existingEmployee = await this.employeeRepository.findOne({
      where: [
        { empId: createEmployeeDto.empId },
        { emailId: createEmployeeDto.emailId },
      ],
    });

    if (existingEmployee) {
      throw new ConflictException(
        'Employee with this ID or email already exists',
      );
    }

    // Get organization and check if it has an active subscription
    const organization = await this.organization.findOne({
      where: { id: createEmployeeDto.organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check if organization has reached its license limit

    // Create and save employee
    const employee = this.employeeRepository.create({
      ...createEmployeeDto,
      organization,
    });

    return this.employeeRepository.save(employee);
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeRepository.find({
      relations: ['organization'],
    });
  }

  async findByOrganization(organizationId: string): Promise<Employee[]> {
    return this.employeeRepository.find({
      where: { organization: { id: organizationId } },
      relations: ['organization'],
    });
  }

  async findOne(id: string): Promise<Employee> {
    return this.employeeRepository.findOne({
      where: { id },
      relations: ['organization'],
    });
  }
}
