import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserRole, UserRoleDocument } from './schema/role.schema';
import { Model } from 'mongoose';
import { CreateRoleDto } from './dto/create-role.dto';
import { escapeRegex } from 'src/utils/escapeRegex';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(UserRole.name) private userRoleModel: Model<UserRoleDocument>,
  ) {}

  async getAllRoles() {
    return this.userRoleModel.find().exec();
  }

  async getAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ role: regex }, { description: regex }];
    }

    const [data, total] = await Promise.all([
      this.userRoleModel
        .find(filter)
        .populate('permissions', 'name description category status')
        .populate('reportingRole', 'role')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.userRoleModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(body: CreateRoleDto, req: AuthRequest) {
    const existing = await this.userRoleModel.findOne({ role: body.role });
    if (existing) {
      throw new BadRequestException('Role with this name already exists');
    }

    return this.userRoleModel.create({
      ...body,
      createdBy: req.user.userId,
    });
  }

  async update(id: string, body: CreateRoleDto) {
    const role = await this.userRoleModel.findById(id);
    if (!role) {
      throw new BadRequestException('Role not found');
    }

    if (body.role && body.role !== role.role) {
      const existing = await this.userRoleModel.findOne({
        role: body.role,
        _id: { $ne: id },
      });
      if (existing) {
        throw new BadRequestException('Role with this name already exists');
      }
    }

    return this.userRoleModel
      .findByIdAndUpdate(id, { $set: body }, { returnDocument: 'after' })
      .populate('permissions', 'name description category status');
  }
}
