import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Permission, PermissionDocument } from './schema/permission.schema';
import { Model } from 'mongoose';

@Injectable()
export class PermissionService {
    constructor(
        @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
    ) { }

    async getAllPermissions() {
        return this.permissionModel.find().exec();
    }
}
