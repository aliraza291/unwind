import {
  Body,
  Controller,
  ForbiddenException,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/local-auth.guard';
import { UserType } from '@/common/enums/role-type.enum';
import { TherapistProfileCompletionDto } from './dto/profile-complition.dto';
import { ApiSecurityAuth } from '@/common/decorators/swagger.decorator';

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
}
