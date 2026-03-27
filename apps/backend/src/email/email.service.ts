import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private logger = new Logger(EmailService.name);

  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.resend = new Resend(
      this.configService.getOrThrow<string>('RESEND_API_KEY'),
    );
  }

  @OnEvent('user-login')
  async handleUserLogin(payload: { email: string; userId: string }) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.cacheManager.set(`otp:${payload.userId}`, otp, 600000); // 10 min in ms

    this.logger.log(`OTP for ${payload.email}: ${otp}`);

    const { data, error } = await this.resend.emails.send({
      from: this.configService.getOrThrow<string>('EMAIL_DEV'),
      to: payload.email,
      subject: 'Your Login OTP',
      html: `<p>Your OTP code is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p>`,
    });

    if (error) {
      this.logger.error(`Failed to send OTP email: ${error.message}`);
      return;
    }

    this.logger.log(`OTP email sent to ${payload.email}, id: ${data?.id}`);
  }

  async verifyOtp(userId: string, otp: string): Promise<boolean> {
    const cachedOtp = await this.cacheManager.get<string>(`otp:${userId}`);
    if (!cachedOtp || cachedOtp !== otp) return false;
    await this.cacheManager.del(`otp:${userId}`);
    return true;
  }
}
