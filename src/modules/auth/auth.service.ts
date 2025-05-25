import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { BaseUser } from '../users/entities/base-user.entity';
import { Individual } from '../users/entities/individual.entity';
import { Therapist } from '../users/entities/therapist.entity';
import { Company } from '../users/entities/company.entity';
import { OtpService } from './services/otp.service';
import { SignupIndividualDto } from './dto/signup-individual.dto';
import { SignupTherapistDto } from './dto/signup-therapist.dto';
import { SignupCompanyDto } from './dto/signup-company.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserType } from '@/common/enums/role-type.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(BaseUser)
    private baseUserRepository: Repository<BaseUser>,
    @InjectRepository(Individual)
    private individualRepository: Repository<Individual>,
    @InjectRepository(Therapist)
    private therapistRepository: Repository<Therapist>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private jwtService: JwtService,
    private otpService: OtpService,
  ) {}

  async signupIndividual(data: SignupIndividualDto) {
    // Check if user already exists
    const existingUser = await this.individualRepository.findOne({
      where: { email: data.email },
    });
    const individual = new Individual();
    if (existingUser && !existingUser.isEmailVerified) {
      const { otp, expiry } = this.otpService.generateOtp();
      individual.otp = otp;
      individual.otpExpiry = expiry;
      individual.email = data.email;

      await this.individualRepository.save(existingUser);

      // Send OTP email
      await this.otpService.sendOtpByEmail(individual.email, otp);
      throw new BadRequestException(
        'Your account is not verified yet please check your email',
      );
    }
    if (existingUser) {
      throw new BadRequestException('User already exists with this email');
    }

    // Create new individual

    individual.email = data.email;
    individual.userName = data.userName;
    individual.password = await bcrypt.hash(data.password, 10);
    individual.phoneNumber = data.phoneNumber;
    individual.age = data.age;
    individual.genderIdentity = data.genderIdentity;
    individual.therapistPreference = data.therapistPreference;
    individual.reasonForTherapy = data.reasonForTherapy;
    individual.userType = UserType.INDIVIDUAL;

    // If company ID is provided, link to company
    if (data.companyId) {
      const company = await this.companyRepository.findOne({
        where: { id: data.companyId },
      });
      if (!company) {
        throw new NotFoundException('Company not found');
      }
      individual.company = company;
    }

    // Generate OTP for email verification
    const { otp, expiry } = this.otpService.generateOtp();
    individual.otp = otp;
    individual.otpExpiry = expiry;

    await this.individualRepository.save(individual);

    // Send OTP email
    await this.otpService.sendOtpByEmail(individual.email, otp);

    return {
      message:
        'Individual account created successfully. Please verify your email.',
      userId: individual.id,
      userType: individual.userType,
    };
  }

  async signupTherapist(data: SignupTherapistDto) {
    // Check if user already exists
    const existingUser = await this.therapistRepository.findOne({
      where: { email: data.email },
    });
    const therapist = new Therapist();
    if (existingUser && !existingUser.isEmailVerified) {
      const { otp, expiry } = this.otpService.generateOtp();
      existingUser.otp = otp;
      existingUser.otpExpiry = expiry;

      await this.therapistRepository.save(existingUser);

      // Send OTP email
      await this.otpService.sendOtpByEmail(existingUser.email, otp);
      throw new BadRequestException(
        'Your account is not verified yet please check your email',
      );
    }
    if (existingUser) {
      throw new BadRequestException('User already exists with this email');
    }

    // Create new therapist
    therapist.email = data.email;
    therapist.userName = data.userName;
    therapist.password = await bcrypt.hash(data.password, 10);
    therapist.phoneNumber = data.phoneNumber;
    therapist.age = data.age;
    therapist.genderIdentity = data.genderIdentity;
    therapist.nationality = data.nationality;
    therapist.specialization = data.specialization;
    therapist.userType = UserType.THERAPIST;
    therapist.company = { id: data.company } as Company;
    // Generate OTP for email verification
    const { otp, expiry } = this.otpService.generateOtp();
    therapist.otp = otp;
    therapist.otpExpiry = expiry;

    await this.therapistRepository.save(therapist);

    // Send OTP email
    await this.otpService.sendOtpByEmail(therapist.email, otp);

    return {
      message:
        'Therapist account created successfully. Please verify your email.',
      userId: therapist.id,
      userType: therapist.userType,
    };
  }

  async signupCompany(data: SignupCompanyDto) {
    // Check if company already exists
    const existingCompany = await this.companyRepository.findOne({
      where: { email: data.email },
    });
    const company = new Company();
    if (existingCompany && !existingCompany.isEmailVerified) {
      const { otp, expiry } = this.otpService.generateOtp();
      existingCompany.otp = otp;
      existingCompany.otpExpiry = expiry;

      await this.companyRepository.save(existingCompany);

      // Send OTP email
      await this.otpService.sendOtpByEmail(existingCompany.email, otp);
      throw new BadRequestException(
        'Your account is not verified yet please check your email',
      );
    }
    if (existingCompany) {
      throw new BadRequestException('Company already exists with this email');
    }

    // Create new company

    company.organizationName = data.organizationName;
    company.email = data.email;
    company.passwordHash = await bcrypt.hash(data.password, 10);
    company.employeeCount = data.employeeCount;
    company.workModel = data.workModel;
    company.subscriptionPlan = data.subscriptionPlan;
    company.userType = UserType.COMPANY;

    // Generate OTP for email verification
    const { otp, expiry } = this.otpService.generateOtp();
    company.otp = otp;
    company.otpExpiry = expiry;

    await this.companyRepository.save(company);

    // Send OTP email
    await this.otpService.sendOtpByEmail(company.email, otp);

    return {
      status: HttpStatus.OK,
      data: {
        message:
          'Company account created successfully. Please verify your email.',
      },
    };
  }

  async verifyOtp(data: VerifyOtpDto) {
    const now = new Date();

    if (data.userType === UserType.COMPANY) {
      const company = await this.companyRepository.findOne({
        where: { email: data.email },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      if (company.otp !== data.otp) {
        throw new BadRequestException('Invalid OTP');
      }

      if (company.otpExpiry < now) {
        throw new BadRequestException('OTP expired');
      }

      company.isEmailVerified = true;
      company.otp = null;
      company.otpExpiry = null;

      await this.companyRepository.save(company);

      return {
        message: 'Email verified successfully',
        userType: UserType.COMPANY,
      };
    } else {
      let user = null;

      if (data.userType === UserType.INDIVIDUAL) {
        user = await this.individualRepository.findOne({
          where: { email: data.email },
        });
      } else {
        user = await this.therapistRepository.findOne({
          where: { email: data.email },
        });
      }

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.otp !== data.otp) {
        throw new BadRequestException('Invalid OTP');
      }

      if (user.otpExpiry < now) {
        throw new BadRequestException('OTP expired');
      }

      user.isEmailVerified = true;
      user.otp = null;
      user.otpExpiry = null;

      if (data.userType === UserType.INDIVIDUAL) {
        await this.individualRepository.save(user);
      } else {
        await this.therapistRepository.save(user);
      }

      return {
        message: 'Email verified successfully',
        userType: user.userType,
      };
    }
  }

  async login(data: LoginDto) {
    // First check if it's a company login
    const company = await this.companyRepository.findOne({
      where: { email: data.email },
    });

    if (company) {
      if (!company.isEmailVerified) {
        throw new UnauthorizedException('Organization are not verified yet');
      }
      const isPasswordValid = await bcrypt.compare(
        data.password,
        company.passwordHash,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!company.isEmailVerified) {
        throw new UnauthorizedException('Email not verified');
      }

      // Generate JWT token
      const token = this.jwtService.sign({
        id: company.id,
        email: company.email,
        userType: UserType.COMPANY,
      });

      return {
        token,
        user: {
          id: company.id,
          email: company.email,
          userType: UserType.COMPANY,
          organizationName: company.organizationName,
          isEmailVerified: company.isEmailVerified,
        },
      };
    }
    let user = null;
    // If not a company, check for users (individual or therapist)
    user = await this.therapistRepository.findOne({
      where: { email: data.email },
      relations: ['company'],
    });
    if (!user) {
      user = await this.individualRepository.findOne({
        where: { email: data.email },
        relations: ['company'],
      });
    }
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user && !user.isEmailVerified) {
      const { otp, expiry } = this.otpService.generateOtp();
      user.otp = otp;
      user.otpExpiry = expiry;
      if (user.userType === UserType.INDIVIDUAL) {
        await this.individualRepository.save(user);
      } else {
        await this.therapistRepository.save(user);
      }

      // Send OTP email
      await this.otpService.sendOtpByEmail(user.email, otp);
      const statusCode = HttpStatus.BAD_REQUEST; // or any other status dynamically
      const message =
        'Your account is not verified yet please check your email';

      throw new BadRequestException({
        statusCode,
        message,
        error: 'Bad Request', // You can also generate this dynamically based on status code if needed
        userType: user?.userType,
        email: user?.email,
      });
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    // Get company if it exists
    let companyData = null;
    if (user.company) {
      companyData = {
        id: user.company.id,
        organizationName: user.company.organizationName,
      };
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      userType: user.userType,
      companyId: user.company?.id,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        company: companyData,
        isEmailVerified: user.isEmailVerified,
        profileCompletionStep: user.profileCompletionStep,
        userName: user.userName,
        genderIdentity: user.genderIdentity,
        age: user.age,
        isProfileComplete: user?.isProfileComplete,
      },
    };
  }

  async forgotPassword(email: string) {
    // Check if it's a company
    const company = await this.companyRepository.findOne({ where: { email } });

    if (company) {
      // Generate reset token
      const resetToken = crypto.randomBytes(20).toString('hex');
      const resetExpiry = new Date(Date.now() + 3600000); // 1 hour

      company.resetPasswordToken = resetToken;
      company.resetPasswordExpiry = resetExpiry;

      await this.companyRepository.save(company);

      // TODO: Send reset password email with token

      return {
        message: 'Password reset email sent',
        userType: UserType.COMPANY,
      };
    }

    // Check if it's a user (individual or therapist)
    const user = await this.baseUserRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetExpiry;

    await this.baseUserRepository.save(user);

    // TODO: Send reset password email with token

    return {
      message: 'Password reset email sent',
      userType: user.userType,
    };
  }

  async resetPassword(data: ResetPasswordDto) {
    const now = new Date();

    // Check if it's a company
    const company = await this.companyRepository.findOne({
      where: { resetPasswordToken: data.token },
    });

    if (company) {
      if (!company.resetPasswordExpiry || company.resetPasswordExpiry < now) {
        throw new BadRequestException('Reset token expired');
      }

      company.passwordHash = await bcrypt.hash(data.newPassword, 10);
      company.resetPasswordToken = null;
      company.resetPasswordExpiry = null;

      await this.companyRepository.save(company);

      return {
        message: 'Password updated successfully',
        userType: UserType.COMPANY,
      };
    }

    // Check if it's a user (individual or therapist)
    const user = await this.baseUserRepository.findOne({
      where: { resetPasswordToken: data.token },
    });

    if (!user) {
      throw new BadRequestException('Invalid reset token');
    }

    if (!user.resetPasswordExpiry || user.resetPasswordExpiry < now) {
      throw new BadRequestException('Reset token expired');
    }

    user.password = await bcrypt.hash(data.newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;

    await this.baseUserRepository.save(user);

    return {
      message: 'Password updated successfully',
      userType: user.userType,
    };
  }
}
