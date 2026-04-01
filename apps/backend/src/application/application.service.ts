import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Application, ApplicationDocument } from './schema/application.schema';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,
  ) { }

  async create(application: Application): Promise<Application> {
    const createdApplication = new this.applicationModel(application);
    return createdApplication.save();
  }

  async findAll(
    req: AuthRequest,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    const { user } = req;

    const filter: any = {};
    if (!user.permissions.includes('application:read:all')) {
      filter.user = user.userId;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$and = [
        ...(filter.$and || []),
        {
          $or: [
            { entity_name: regex },
            { entity_id: regex },
            { cab_code: regex },
            { 'standards.code': regex },
          ],
        },
      ];
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.applicationModel
        .find(filter)
        .populate('busuness_associate', 'username email userId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.applicationModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    const application = await this.applicationModel
      .findById(id)
      .populate('busuness_associate', 'username email userId')
      .populate('appliedBy', 'firstName lastName email')
      .exec();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async update(id: string, updateData: Partial<Application>) {
    const application = await this.applicationModel
      .findByIdAndUpdate(id, { $set: updateData }, { returnDocument: 'after' })
      .populate('busuness_associate', 'username email userId')
      .exec();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }
}
