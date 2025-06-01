import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Put,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/local-auth.guard';
import { UserType } from '@/common/enums/role-type.enum';
import { TherapistProfileCompletionDto } from './dto/profile-complition.dto';
import { ApiSecurityAuth } from '@/common/decorators/swagger.decorator';
import { Schedule } from '../schedule/entities/schedule.entity';
import { DenyRolesGuard } from '../auth/guards/deny-roles.guard';

@ApiTags('User')
@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiSecurityAuth()
  @UseGuards(JwtAuthGuard)
  @Put('therapist/profile/complete')
  async completeTherapistProfile(
    @Req() req: Request,
    @Body() profileData: TherapistProfileCompletionDto,
  ) {
    const user = (req as any)?.user;

    // Ensure the user is a therapist
    if (user?.userType !== UserType.THERAPIST) {
      throw new ForbiddenException('Only therapists can access this endpoint');
    }

    return this.userService.completeTherapistProfile(user.id, profileData);
  }

  @Get(':userType/:id')
  @ApiSecurityAuth()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiParam({ name: 'userType', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'User Fetched',
  })
  @ApiResponse({ status: 404, description: 'user not found.' })
  findOne(@Param('id') id: string, @Param('userType') userType: UserType) {
    return this.userService.findOneUser(id, userType);
  }

  @Get('get-user-profile')
  @ApiSecurityAuth()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({
    status: 200,
    description: 'User Fetched',
  })
  @ApiResponse({ status: 404, description: 'user not found.' })
  getUserProfile(
    // @Param('id') id: string,
    // @Param('userType') userType: UserType,
    @Request() req,
  ) {
    const userFromToken = req.user;
    return this.userService.getUserProfile(userFromToken);
  }

  @Get('get-all-individual')
  @ApiSecurityAuth()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({
    status: 200,
    description: 'Therapist Fetched',
  })
  @ApiResponse({ status: 404, description: 'user not found.' })
  @ApiResponse({ status: 403, description: 'Access denied for therapist role' })
  getAllIndividual() {
    return this.userService.getAllIndividual();
  }

  @Get('get-all-therapist')
  @ApiSecurityAuth()
  @UseGuards(JwtAuthGuard, new DenyRolesGuard(['therapist']))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({
    status: 200,
    description: 'Therapist Fetched',
  })
  @ApiResponse({ status: 404, description: 'user not found.' })
  @ApiResponse({ status: 403, description: 'Access denied for therapist role' })
  getAllTherapist() {
    return this.userService.getAllTherapist();
  }
}
