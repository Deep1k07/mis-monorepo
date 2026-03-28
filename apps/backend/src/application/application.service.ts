import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Application, ApplicationDocument } from './schema/application.schema';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,
  ) {}

  async create(application: Application): Promise<Application> {
    const createdApplication = new this.applicationModel(application);
    return createdApplication.save();
  }

  async findAll(req: AuthRequest, page: number = 1, limit: number = 10) {
    const { user } = req;

    const filter: FilterQuery<ApplicationDocument> = {};
    if (!user.permissions.includes('application:read:all')) {
      filter.user = user.userId;
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
}
