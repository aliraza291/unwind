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
import { CreateScheduleDto } from './dto/create-schedule.dto';

import { Schedule } from './entities/schedule.entity';
import { JwtAuthGuard } from '../auth/guards/local-auth.guard';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { SchedulesService } from './entities/schedules.service';
import { BulkCreateScheduleDto } from './dto/bulk-create-schedule';

@ApiTags('schedules')
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new schedule slot' })
  @ApiBody({ type: CreateScheduleDto })
  @ApiResponse({
    status: 201,
    description: 'The schedule slot has been successfully created.',
    type: Schedule,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.schedulesService.create(createScheduleDto);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create multiple schedule slots at once' })
  @ApiBody({ type: BulkCreateScheduleDto })
  @ApiResponse({
    status: 201,
    description: 'The schedule slots have been successfully created.',
    type: [Schedule],
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  bulkCreate(@Body() bulkCreateScheduleDto: BulkCreateScheduleDto) {
    return this.schedulesService.bulkCreate(bulkCreateScheduleDto);
  }

  @Get()
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
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

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a schedule slot' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateScheduleDto })
  @ApiResponse({
    status: 200,
    description: 'The schedule slot has been successfully updated.',
    type: Schedule,
  })
  @ApiResponse({ status: 404, description: 'Schedule slot not found.' })
  update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(id, updateScheduleDto);
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
