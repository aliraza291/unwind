import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupIndividualDto } from './dto/signup-individual.dto';
import { SignupTherapistDto } from './dto/signup-therapist.dto';
import { SignupCompanyDto } from './dto/signup-company.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new individual user
   */
  @Post('signup/individual')
  @HttpCode(HttpStatus.CREATED)
  signupIndividual(@Body() signupIndividualDto: SignupIndividualDto) {
    return this.authService.signupIndividual(signupIndividualDto);
  }

  /**
   * Register a new therapist user
   */
  @Post('signup/therapist')
  @HttpCode(HttpStatus.CREATED)
  async signupTherapist(@Body() signupTherapistDto: SignupTherapistDto) {
    return await this.authService.signupTherapist(signupTherapistDto);
  }

  /**
   * Register a new company
   */
  @Post('signup/company')
  @HttpCode(HttpStatus.CREATED)
  async signupCompany(@Body() signupCompanyDto: SignupCompanyDto) {
    return await this.authService.signupCompany(signupCompanyDto);
  }

  /**
   * Verify email with OTP
   */
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  /**
   * Resend verification OTP
   */
  /**
   * Login for all user types
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Request password reset
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() forgotPasswordDto: { email: string }) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  /**
   * Reset password with token
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
