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
  ParseUUIDPipe,
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
import {
  CreateGroupTherapyDto,
  GroupTherapyQueryDto,
  JoinGroupTherapyDto,
  UpdateGroupTherapyDto,
} from './dto/create-group-therepy.dto';

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
  createGroupSession(@Body() createAppointmentDto: CreateAppointmentDto) {
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
  @ApiQuery({
    name: 'therapistId',
    required: false,
    description: 'Filter by therapistId',
  })
  @ApiQuery({
    name: 'clientId',
    required: false,
    description: 'Filter by PatientId',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all appointments',
    type: [Appointment],
  })
  findAllSeesion(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('therapistId') therapistId?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.appointmentsService.findAll({
      page: +page,
      limit: +limit,
      status,
      startDate,
      endDate,
      therapistId,
      clientId,
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
  findOneSession(@Param('id') id: string) {
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
  updateSession(
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
  removeSession(@Param('id') id: string) {
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

  @Post('group-therapy')
  @ApiOperation({ summary: 'Create a new group therapy session' })
  @ApiResponse({
    status: 201,
    description: 'The group therapy session has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Moderator not found.' })
  create(@Body() createGroupTherapyDto: CreateGroupTherapyDto) {
    return this.appointmentsService.creatSession(createGroupTherapyDto);
  }

  @Get('group-therapy')
  @ApiOperation({ summary: 'Get all group therapy sessions' })
  @ApiResponse({
    status: 200,
    description: 'Return all group therapy sessions with pagination.',
  })
  @ApiQuery({
    name: 'topic',
    required: false,
    description: 'Filter by discussion topic',
  })
  @ApiQuery({
    name: 'moderatorId',
    required: false,
    description: 'Filter by moderator ID',
  })
  @ApiQuery({
    name: 'availableOnly',
    required: false,
    description: 'Show only available sessions',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  findAll(@Query() query: GroupTherapyQueryDto) {
    return this.appointmentsService.findAllSession(query);
  }

  @Get('group-therapy/:id')
  @ApiOperation({ summary: 'Get a group therapy session by ID' })
  @ApiParam({ name: 'id', description: 'Group therapy session ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the group therapy session.',
  })
  @ApiResponse({ status: 404, description: 'Group therapy session not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentsService.findOneSession(id);
  }

  @Patch('group-therapy/:id')
  @ApiOperation({ summary: 'Update a group therapy session' })
  @ApiParam({ name: 'id', description: 'Group therapy session ID' })
  @ApiResponse({
    status: 200,
    description: 'The group therapy session has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Group therapy session not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGroupTherapyDto: UpdateGroupTherapyDto,
  ) {
    return this.appointmentsService.updateSession(id, updateGroupTherapyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a group therapy session' })
  @ApiParam({ name: 'id', description: 'Group therapy session ID' })
  @ApiResponse({
    status: 204,
    description: 'The group therapy session has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Group therapy session not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentsService.removeSession(id);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join a group therapy session' })
  @ApiParam({ name: 'id', description: 'Group therapy session ID' })
  @ApiBody({ type: JoinGroupTherapyDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully joined the group therapy session.',
  })
  @ApiResponse({
    status: 404,
    description: 'Group therapy session or individual not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Session is full or individual already joined.',
  })
  @ApiResponse({
    status: 400,
    description: 'Session has already started or passed.',
  })
  joinSession(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() joinGroupTherapyDto: JoinGroupTherapyDto,
  ) {
    return this.appointmentsService.joinSession(id, joinGroupTherapyDto);
  }

  @Delete(':id/leave/:individualId')
  @ApiOperation({ summary: 'Leave a group therapy session' })
  @ApiParam({ name: 'id', description: 'Group therapy session ID' })
  @ApiParam({ name: 'individualId', description: 'Individual ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully left the group therapy session.',
  })
  @ApiResponse({
    status: 404,
    description: 'Group therapy session or individual not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Session has already started or passed.',
  })
  leaveSession(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('individualId', ParseUUIDPipe) individualId: string,
  ) {
    return this.appointmentsService.leaveSession(id, individualId);
  }

  @Get('moderator/:moderatorId')
  @ApiOperation({ summary: 'Get group therapy sessions by moderator' })
  @ApiParam({ name: 'moderatorId', description: 'Moderator (Therapist) ID' })
  @ApiQuery({
    name: 'topic',
    required: false,
    description: 'Filter by discussion topic',
  })
  @ApiQuery({
    name: 'availableOnly',
    required: false,
    description: 'Show only available sessions',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Return group therapy sessions by moderator.',
  })
  getSessionsByModerator(
    @Param('moderatorId', ParseUUIDPipe) moderatorId: string,
    @Query() query: GroupTherapyQueryDto,
  ) {
    return this.appointmentsService.getSessionsByModerator(moderatorId, query);
  }

  @Get('participant/:individualId')
  @ApiOperation({ summary: 'Get group therapy sessions by participant' })
  @ApiParam({
    name: 'individualId',
    description: 'Individual (Participant) ID',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Return group therapy sessions by participant.',
  })
  getSessionsByParticipant(
    @Param('individualId', ParseUUIDPipe) individualId: string,
    @Query() query: GroupTherapyQueryDto,
  ) {
    return this.appointmentsService.getSessionsByParticipant(
      individualId,
      query,
    );
  }
}
