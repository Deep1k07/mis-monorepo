import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { UserAccount, UserAccountDocument } from '../schema/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectModel(UserAccount.name)
    private userAccountModel: Model<UserAccountDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      if (!payload) {
        throw new UnauthorizedException('Invalid token');
      }
      const user = await this.userAccountModel
        .findById(payload.userId)
        .populate({
          path: 'role',
          populate: {
            path: 'permissions',
            match: { status: 'active' },
          },
        });
      const permissions: string[] = Array.isArray(
        (user?.role as any)?.permissions,
      )
        ? (user?.role as any)?.permissions?.map((p: any) => p.name)
        : [];

      // attach user to request
      let userPayload = {
        userId: user?._id?.toString(),
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        role: (user?.role as any)?.role,
        permissions: permissions,
      };
      request.user = userPayload;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | null {
    // Try extracting from cookies first
    if (request.cookies && request.cookies.access_token) {
      return request.cookies.access_token;
    }

    // Fallback to Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
