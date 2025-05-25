import { UserType } from '@/common/enums/role-type.enum';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Email address used to send the OTP',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The one-time password sent to the user’s email',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  otp: string;

  @ApiProperty({
    description: 'User type for whom the OTP is being verified',
    enum: UserType,
    example: UserType.INDIVIDUAL,
  })
  @IsEnum(UserType)
  @IsNotEmpty()
  userType: UserType;
}
