import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body() body: { userId: string; otp: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verifyOtp(body.userId, body.otp);

    if (result.success && result.token?.access_token) {
      res.cookie('access_token', result.token.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });
      return { success: true };
    }

    return result;
  }

  @Post('resend-otp')
  async resendOtp(@Body() body: { userId: string }) {
    return this.authService.resendOtp(body.userId);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: AuthRequest) {
    return req.user;
  }
}
