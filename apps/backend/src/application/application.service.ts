import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Application, ApplicationDocument } from './schema/application.schema';
import { User } from 'src/ba/schema/ba.schema';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@Injectable()
export class ApplicationService {
    constructor(
        @InjectModel(Application.name) private readonly applicationModel: Model<ApplicationDocument>,
    ) { }

    async create(application: Application): Promise<Application> {
        const createdApplication = new this.applicationModel(application);
        return createdApplication.save();
    }

    async findAll(req: AuthRequest): Promise<Application[]> {
        let user = req.user;

        if (user.permissions.includes('application:read:all')) {
            return this.applicationModel.find().exec();
        }
        return this.applicationModel.find({ user: user.userId }).exec();
    }
}
