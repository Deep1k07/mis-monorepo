import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserAccount } from '../auth/schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { escapeRegex } from 'src/utils/escapeRegex';
import { generateAlphanumericCode } from 'src/utils/createEntityId';
import bcrypt from 'bcryptjs';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserAccount.name)
    private userModel: Model<UserAccount>,
  ) { }

  private async getUniqueUserId(): Promise<string> {
    while (true) {
      const id = generateAlphanumericCode(7);
      const found = await this.userModel.exists({ userId: id });
      if (!found) return id;
    }
  }

  async create(req: AuthRequest, body: CreateUserDto) {
    const user = req.user;
    if (!['manage:users', 'user:create'].some((p) => user.permissions.includes(p))) {
      throw new BadRequestException('You do not have permission to create a user');
    }
    const existing = await this.userModel.findOne({ email: body.email.toLowerCase() });
    if (existing) {
      throw new BadRequestException('A user with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);
    const userId = await this.getUniqueUserId();

    return this.userModel.create({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email.toLowerCase(),
      phone: body.phone,
      password: hashedPassword,
      role: body.role,
      userId,
      reportingManager: body.reportingManager || undefined,
      status: body.status || 'active',
      createdBy: req.user.userId,
    });
  }

  async update(req: AuthRequest, id: string, body: UpdateUserDto) {
    const user = req.user;
    if (!['manage:users', 'user:update'].some((p) => user.permissions.includes(p))) {
      throw new BadRequestException('You do not have permission to update a user');
    }
    const users = await this.userModel.findById(id);
    if (!users) {
      throw new BadRequestException('User not found');
    }

    const updateData: any = { ...body };

    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(body.password, salt);
    }

    if (body.email) {
      const existing = await this.userModel.findOne({
        email: body.email.toLowerCase(),
        _id: { $ne: id },
      });
      if (existing) {
        throw new BadRequestException('A user with this email already exists');
      }
      updateData.email = body.email.toLowerCase();
    }

    return this.userModel
      .findByIdAndUpdate(id, { $set: updateData }, { returnDocument: 'after' })
      .populate('role', 'role description status');
  }

  async getAll(
    req: AuthRequest,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    const user = req.user;
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (!['manage:users', 'user:read'].some((p) => user.permissions.includes(p))) {
      throw new BadRequestException('You do not have permission to get users');
    }

    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { userId: regex },
      ];
    }

    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .populate('role', 'role description status')
        .populate('reportingManager', 'firstName lastName email userId')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.userModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(req: AuthRequest, id: string) {
    const user = await this.userModel
      .findById(id)
      .populate('role', 'role description status')
      .populate('reportingManager', 'firstName lastName email userId');

    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }
}
