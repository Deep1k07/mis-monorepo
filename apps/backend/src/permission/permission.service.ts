import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Permission, PermissionDocument } from './schema/permission.schema';
import { Model } from 'mongoose';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { escapeRegex } from 'src/utils/escapeRegex';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(Permission.name)
    private permissionModel: Model<PermissionDocument>,
  ) { }

  async getAllPermissions(req: AuthRequest) {
    return this.permissionModel.find().exec();
  }

  async getAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [
        { name: regex },
        { description: regex },
        { category: regex },
      ];
    }

    const [data, total] = await Promise.all([
      this.permissionModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ category: 1, name: 1 }),
      this.permissionModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(body: CreatePermissionDto) {
    const existing = await this.permissionModel.findOne({
      name: body.name.toLowerCase(),
    });
    if (existing) {
      throw new BadRequestException('Permission with this name already exists');
    }
    return this.permissionModel.create(body);
  }

  async update(id: string, body: CreatePermissionDto) {
    const permission = await this.permissionModel.findById(id);
    if (!permission) {
      throw new BadRequestException('Permission not found');
    }

    if (body.name && body.name.toLowerCase() !== permission.name) {
      const existing = await this.permissionModel.findOne({
        name: body.name.toLowerCase(),
        _id: { $ne: id },
      });
      if (existing) {
        throw new BadRequestException(
          'Permission with this name already exists',
        );
      }
    }

    return this.permissionModel.findByIdAndUpdate(
      id,
      { $set: body },
      { returnDocument: 'after' },
    );
  }
}
