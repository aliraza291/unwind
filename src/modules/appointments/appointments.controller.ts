import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { Appointment } from './entities/appointment.entity';
import { JwtAuthGuard } from '../auth/guards/local-auth.guard';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiBody({ type: CreateAppointmentDto })
  @ApiResponse({
    status: 201,
    description: 'The appointment has been successfully created.',
    type: Appointment,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all appointments' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by appointment status',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter by start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter by end date (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all appointments',
    type: [Appointment],
  })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.appointmentsService.findAll({
      page: +page,
      limit: +limit,
      status,
      startDate,
      endDate,
    });
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get appointment summary statistics' })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID (therapist or patient)',
  })
  @ApiQuery({
    name: 'userType',
    required: false,
    enum: ['therapist', 'patient'],
    description: 'Specify user type',
  })
  @ApiResponse({
    status: 200,
    description: 'Return appointment summary statistics',
  })
  getAppointmentSummary(
    @Query('userId') userId?: string,
    @Query('userType') userType?: 'therapist' | 'patient',
  ) {
    return this.appointmentsService.getAppointmentSummary(userId, userType);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an appointment by id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Return the appointment',
    type: Appointment,
  })
  @ApiResponse({ status: 404, description: 'Appointment not found.' })
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an appointment' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateAppointmentDto })
  @ApiResponse({
    status: 200,
    description: 'The appointment has been successfully updated.',
    type: Appointment,
  })
  @ApiResponse({ status: 404, description: 'Appointment not found.' })
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an appointment' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'The appointment has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found.' })
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel an appointment' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'The appointment has been successfully cancelled.',
    type: Appointment,
  })
  @ApiResponse({ status: 404, description: 'Appointment not found.' })
  cancelAppointment(@Param('id') id: string) {
    return this.appointmentsService.cancelAppointment(id);
  }

  @Post(':id/reschedule')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reschedule an appointment' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        startTime: { type: 'string', format: 'date-time' },
        endTime: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The appointment has been successfully rescheduled.',
    type: Appointment,
  })
  @ApiResponse({ status: 404, description: 'Appointment not found.' })
  rescheduleAppointment(
    @Param('id') id: string,
    @Body() rescheduleData: { startTime: string; endTime: string },
  ) {
    return this.appointmentsService.rescheduleAppointment(id, rescheduleData);
  }

  @Post(':id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark an appointment as completed' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'The appointment has been successfully marked as completed.',
    type: Appointment,
  })
  @ApiResponse({ status: 404, description: 'Appointment not found.' })
  completeAppointment(@Param('id') id: string) {
    return this.appointmentsService.completeAppointment(id);
  }

  @Post(':id/notes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a note to an appointment' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: CreateNoteDto })
  @ApiResponse({
    status: 201,
    description: 'The note has been successfully added.',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found.' })
  addNote(@Param('id') id: string, @Body() createNoteDto: CreateNoteDto) {
    return this.appointmentsService.addNote(id, createNoteDto);
  }

  @Get(':id/notes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all notes for an appointment' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Return all notes for the appointment',
  })
  getNotes(@Param('id') id: string) {
    return this.appointmentsService.getNotes(id);
  }

  @Get('weekly-schedule/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get weekly schedule for a user' })
  @ApiParam({ name: 'userId', type: 'string' })
  @ApiQuery({
    name: 'userType',
    required: true,
    enum: ['therapist', 'patient'],
    description: 'Specify user type',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date of the week (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return weekly schedule',
  })
  getWeeklySchedule(
    @Param('userId') userId: string,
    @Query('userType') userType: 'therapist' | 'patient',
    @Query('startDate') startDate?: string,
  ) {
    return this.appointmentsService.getWeeklySchedule(
      userId,
      userType,
      startDate,
    );
  }
}
