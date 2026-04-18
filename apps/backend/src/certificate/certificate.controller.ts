import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { S3Service } from './s3.service';

@ApiTags('Certificate')
@ApiCookieAuth()
@Controller('certificate')
export class CertificateController {
  constructor(private readonly s3Service: S3Service) {}

  @Get('presign')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a pre-signed URL for a certificate' })
  @ApiResponse({ status: 200, description: 'Pre-signed URL generated' })
  async getPresignedUrl(@Query('key') key: string) {
    const url = await this.s3Service.getPresignedUrl(key);
    return { url };
  }
}
