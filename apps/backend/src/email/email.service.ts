import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Resend } from 'resend';
import { EntityEmailDto } from './dto/email.dto';

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

  @OnEvent('user:login')
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

  //Entity email
  @OnEvent('entity:created')
  async sendMailForEntity(payload: EntityEmailDto) {
    const { to, type, entityData } = payload;
    const domain = {
      TCU: 'info@tnvmail.com',
      TSI: 'info@tnvmail.com',
      GAU: 'info@guardianmail.org',
      GAI: 'info@guardianmail.org',
    };
    let subject = '';
    let htmlContent = '';
    const guardian = ['GAU', 'GAI'];
    const domainEmail =
      this.configService.getOrThrow<string>('NODE_ENV') === 'production'
        ? domain[entityData?.email_cab_code]
        : this.configService.getOrThrow<string>('EMAIL_DEV');
    const isGuardian = guardian?.includes(entityData?.email_cab_code);
    const isTnv = entityData?.email_cab_code === 'TCU';

    if (type === 'create_entity') {
      subject = `Verification for ${entityData?.entity_name}`;
      htmlContent = `
      <div style="background-color: #F4F4F4; max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
        <div style="background-color: #FFFFFF; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="border-bottom: 3px solid #2C5AA0; padding-bottom: 20px; margin-bottom: 25px;">
            <h1 style="color: #2C5AA0; font-size: 24px; font-weight: bold; margin: 0;">${isGuardian ? 'Guardian Assessment Pvt. Ltd.' : isTnv ? 'TNV Group of Companies' : entityData?.email_cab_code === 'TVC' ? 'TNV VERISURE PRIVATE LIMITED' : 'TNV System Certification Pvt. Ltd.'}</h1>
          </div>
          <div style="font-size: 18px; margin-bottom: 20px; color: #2C5AA0;">
            Dear ${entityData?.entity_name || ''},
          </div>
          <div style="margin-bottom: 25px;">
            <p>Thank you for signing up with ${isGuardian ? 'Guardian Assessment Pvt. Ltd.' : isTnv ? 'TNV Group of Companies' : entityData?.email_cab_code === 'TVC' ? 'TNV VERISURE PRIVATE LIMITED' : 'TNV System Certification Pvt. Ltd.'} for the ISO Audit and Certification requirements of your organization. We are excited to have <strong>${entityData?.entity_name || ''}</strong> join us.</p>
            <p>Creation of the entity in our system is subject to Email Authentication. To complete your registration and activate your account, please verify your email address by clicking on the link below:</p>
            <div style="text-align: center;">
              <a href="${entityData?.verification_url || '#'}" style="display: inline-block; background-color: #2C5AA0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; transition: background-color 0.3s;">Verify Your Account</a>
            </div>
            <p>By verifying your account, you also confirm your acceptance of our Terms and Conditions.</p>
            <div style="background-color: #E3F2FD; padding: 15px; border-left: 4px solid #2C5AA0; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0;"><strong>What happens next?</strong><br>
              Once verified, your application shall be eligible for the selection of the standard and application processing, and you will be able to access your dedicated client portal and utilize our services.</p>
            </div>
            <p>Please note that this email address will be used for all future communications related to your account.</p>
            <p>If you have any questions or require assistance, please do not hesitate to contact us.</p>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p>Sincerely,</p>
            <div style="font-weight: bold; margin-bottom: 5px;">${entityData?.contact_person || ''}</div>
            <div style="font-size: 14px; color: #666; font-style: italic;">
              ${isGuardian ? 'Guardian Assessment Pvt. Ltd.' : isTnv ? 'TNV Group of Companies' : entityData?.email_cab_code === 'TVC' ? 'TNV VERISURE PRIVATE LIMITED' : 'TNV System Certification Pvt. Ltd.'}<br>
            </div>
          </div>
        </div>
      </div>
    `;
    } else if (type === 'apply_cert') {
      subject = `Certificate applied for ${entityData?.entity_name}`;
      htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
        <h2 style="color: #2E86C1;">Application Details</h2>
        <p><strong>Entity Name:</strong> ${entityData?.entity_name}</p>
        <p><strong>Address:</strong> ${entityData?.address}</p>
        <p><strong>Address:</strong> ${entityData?.standard}</p>
        <p style="margin-top: 30px; font-size: 0.9em; color: #888;">
          If you did not expect this email, please ignore it.
        </p>
      </div>
    `;
    }

    const { data, error } = await this.resend.emails.send({
      from: domainEmail,
      to: to,
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      this.logger.error(`Failed to send OTP email: ${error.message}`);
      return;
    }

    this.logger.log(`OTP email sent to ${to}, id: ${data?.id}`);
  }
}
