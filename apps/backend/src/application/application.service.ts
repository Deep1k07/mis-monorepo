import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Application, ApplicationDocument } from './schema/application.schema';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,
  ) { }

  async create(data: Record<string, any>) {
    const createdApplication = new this.applicationModel(data);
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
      filter.user = new Types.ObjectId(user.userId);
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$and = [
        ...(filter.$and || []),
        {
          $or: [
            { 'entity.entity_name': regex },
            { 'entity.entity_id': regex },
            { cab_code: regex },
            { 'standards.code': regex },
          ],
        },
      ];
    }

    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      {
        $lookup: {
          from: 'entities',
          localField: 'entity',
          foreignField: '_id',
          as: 'entity',
        },
      },
      { $unwind: { path: '$entity', preserveNullAndEmptyArrays: true } },
      { $match: filter },
      { $sort: { createdAt: -1 as const } },
    ];

    const [data, countResult] = await Promise.all([
      this.applicationModel.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'entity.busuness_associate',
            foreignField: '_id',
            as: 'entity.busuness_associate',
          },
        },
        {
          $unwind: {
            path: '$entity.busuness_associate',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            cab_code: 1,
            standards: 1,
            certificateStatus: 1,
            qualityStatus: 1,
            scopeStatus: 1,
            baStatus: 1,
            createdAt: 1,
            'entity._id': 1,
            'entity.entity_id': 1,
            'entity.entity_name': 1,
            'entity.busuness_associate._id': 1,
            'entity.busuness_associate.username': 1,
          },
        },
      ]),
      this.applicationModel.aggregate([
        ...pipeline,
        { $count: 'total' },
      ]),
    ]);

    const total = countResult[0]?.total ?? 0;

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
      .populate({
        path: 'entity',
        select: 'entity_id entity_name entity_name_english entity_trading_name busuness_associate email website employess_count main_site_address additional_site_address',
        populate: {
          path: 'busuness_associate',
          select: 'username email',
        },
      })
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
