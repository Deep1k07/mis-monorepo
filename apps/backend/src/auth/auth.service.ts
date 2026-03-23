import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoginDto } from './dto/user.dto';
import { UserAccount, UserAccountSchema } from './schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { authenticator } from '@otplib/v12-adapter';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserAccount.name)
    private userModel: Model<UserAccount>,
    private jwtService: JwtService,
  ) {}
  async login(body: LoginDto) {
    const user = await this.userModel
      .findOne({ email: body.email })
      .select('+password')
      .select('+twoFA.secret');
    // .populate({
    //     path: 'role',
    //     populate: {
    //         path: 'permissions',
    //         match: { status: 'active' },
    //     },
    // });

    if (!user) {
      throw new NotFoundException('Invalid Credentials :(');
    }
    const isPasswordCorrect = await bcrypt.compare(
      body.password,
      user?.password,
    );
    if (!isPasswordCorrect)
      throw new NotFoundException('Invalid Credentials :(');
    if (
      user?.status === 'inactive' ||
      user?.status === 'suspended' ||
      user?.status === 'rejected'
    ) {
      throw new BadRequestException(
        'Your account has been deactivated, please contact with administrator.',
      );
    }

    // Two-Factor Authentication (2FA)
    if (user?.twoFA?.enabled) {
      if (!body.code) {
        return {
          success: false,
          twoFa: true,
          msg: 'Two-factor authentication is enabled. Please verify your code.',
        };
      }

      const verified = authenticator.check(body.code, user.twoFA.secret);
      if (!verified) throw new NotFoundException('Invalid 2FA code');
    }

    let token = await this.generateToken(user);

    return {
      success: true,
      token,
    };
  }

  async generateToken(user: any) {
    const payload = {
      userId: user._id,
      email: user.email,
      // add permissions if needed
    };

    return {
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: '1d',
      }),
    };
  }
}
