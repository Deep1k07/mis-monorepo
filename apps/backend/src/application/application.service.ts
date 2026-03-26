import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Application, ApplicationDocument } from './schema/application.schema';

@Injectable()
export class ApplicationService {
    constructor(
        @InjectModel(Application.name) private readonly applicationModel: Model<ApplicationDocument>,
    ) { }

    async create(application: Application): Promise<Application> {
        const createdApplication = new this.applicationModel(application);
        return createdApplication.save();
    }

    async findAll(): Promise<Application[]> {
        return this.applicationModel.find().exec();
    }
}
