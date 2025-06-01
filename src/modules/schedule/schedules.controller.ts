import {
  Controller,
  Get,
  Post,
  Body,
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
import { Schedule, SlotStatus } from './entities/schedule.entity';
import { JwtAuthGuard } from '../auth/guards/local-auth.guard';
import { SchedulesService } from './entities/schedules.service';
import { CreateScheduleRangeDto } from './dto/create-schedule.dto';

@ApiTags('schedules')
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post('range')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create schedule slots for specific days within a date range',
    description:
      'Creates schedule slots for selected days of the week within a specified UTC date range',
  })
  @ApiBody({ type: CreateScheduleRangeDto })
  @ApiResponse({
    status: 201,
    description:
      'The schedule slots have been successfully created for the date range.',
    type: [Schedule],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid date range or time format.',
  })
  @ApiResponse({ status: 404, description: 'Therapist not found.' })
  createScheduleRange(@Body() createScheduleRangeDto: CreateScheduleRangeDto) {
    return this.schedulesService.createScheduleRange(createScheduleRangeDto);
  }

  @Get('therapist/:therapistId/date-range')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get schedule slots for a therapist within a date range',
  })
  @ApiParam({ name: 'therapistId', type: 'string' })
  @ApiQuery({
    name: 'startDate',
    type: 'string',
    description: 'Start date in UTC (ISO 8601)',
  })
  @ApiQuery({
    name: 'endDate',
    type: 'string',
    description: 'End date in UTC (ISO 8601)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Return schedule slots for the therapist within the date range',
    type: [Schedule],
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: SlotStatus, // ✅ Use enum here to document possible values
    type: String, // ✅ Valid type
    description: 'Status of the slot',
  })
  findByDateRange(
    @Param('therapistId') therapistId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('status') status?: SlotStatus,
  ) {
    return this.schedulesService.findByDateRange(
      therapistId,
      startDate,
      endDate,
      status
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all schedule slots' })
  @ApiQuery({ name: 'therapistId', required: false, type: String })
  @ApiQuery({ name: 'dayOfWeek', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Return all schedule slots',
    type: [Schedule],
  })
  findAll(
    @Query('therapistId') therapistId?: string,
    @Query('dayOfWeek') dayOfWeek?: string,
    @Query('status') status?: string,
  ) {
    return this.schedulesService.findAll({ therapistId, dayOfWeek, status });
  }

  @Get('therapist/:therapistId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all schedule slots for a therapist' })
  @ApiParam({ name: 'therapistId', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Return all schedule slots for the therapist',
    type: [Schedule],
  })
  findByTherapist(@Param('therapistId') therapistId: string) {
    return this.schedulesService.findByTherapist(therapistId);
  }

  @Get('fees/:therapistId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get consultancy fees for a therapist' })
  @ApiParam({ name: 'therapistId', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Return consultancy fees for the therapist',
  })
  getConsultancyFees(@Param('therapistId') therapistId: string) {
    return this.schedulesService.getConsultancyFees(therapistId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a schedule slot by id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Return the schedule slot',
    type: Schedule,
  })
  @ApiResponse({ status: 404, description: 'Schedule slot not found.' })
  findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a schedule slot' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'The schedule slot has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Schedule slot not found.' })
  remove(@Param('id') id: string) {
    return this.schedulesService.remove(id);
  }

  @Post('update-status/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the status of a schedule slot' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['Available', 'Booked', 'Selected'] },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The schedule slot status has been successfully updated.',
    type: Schedule,
  })
  @ApiResponse({ status: 404, description: 'Schedule slot not found.' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: { status: string },
  ) {
    return this.schedulesService.updateStatus(id, updateStatusDto.status);
  }
}
