import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class OtpService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // ✅ STARTTLS uses false
      auth: {
        user: 'alirazajutt5412@gmail.com',
        pass: 'yskh xlcz oeky aiki',
      },
    });
  }

  generateOtp(): { otp: string; expiry: Date } {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    return { otp, expiry };
  }

  async sendOtpByEmail(email: string, otp: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: email,
      subject: 'Email Verification OTP',
      text: `Your verification code is: ${otp}. It will expire in 15 minutes.`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
