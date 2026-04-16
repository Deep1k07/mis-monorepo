import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  SurveillanceOne,
  SurveillanceOneDocument,
  SurveillanceStatusEnum,
} from './schema/surveillanceOne.schema';
import {
  SurveillanceTwo,
  SurveillanceTwoDocument,
} from './schema/surveillanceTwo.schema';
import { SurveillanceType } from './dto/surveillance.dto';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { escapeRegex } from 'src/utils/escapeRegex';

@Injectable()
export class SurveillanceService {
  constructor(
    @InjectModel(SurveillanceOne.name)
    private readonly surveillanceOneModel: Model<SurveillanceOneDocument>,
    @InjectModel(SurveillanceTwo.name)
    private readonly surveillanceTwoModel: Model<SurveillanceTwoDocument>,
  ) {}

  private getModel(type: SurveillanceType) {
    return type === SurveillanceType.SECOND
      ? this.surveillanceTwoModel
      : this.surveillanceOneModel;
  }

  private getDueDateField(type: SurveillanceType) {
    return type === SurveillanceType.SECOND
      ? 'second_surveillance'
      : 'first_surveillance';
  }

  async findAll(
    req: AuthRequest,
    type: SurveillanceType,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    cabCode?: string,
    ba?: string,
  ) {
    const { user } = req;
    const model = this.getModel(type);
    const dueDateField = this.getDueDateField(type);

    const filter: any = {};
    if (!user.permissions.includes('surveillance:read:applied')) {
      filter.user = new Types.ObjectId(user.userId);
      // filter.Surveillancestatus = {
      //   $in: ['upcoming', 'pending', 'suspended', 'withdrawn'],
      // };
    }
    if (status) {
      filter.Surveillancestatus = status;
    }
    if (cabCode) {
      filter.cab_code = cabCode;
    }
    if (ba && Types.ObjectId.isValid(ba)) {
      filter.business_associate = new Types.ObjectId(ba);
    }
    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [
        { entity_name: regex },
        { entity_id: regex },
        { cab_code: regex },
        { 'standards.code': regex },
      ];
    }

    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      { $match: filter },
      { $sort: { createdAt: -1 as const } },
    ];

    const [data, countResult] = await Promise.all([
      model.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'business_associate',
            foreignField: '_id',
            as: 'business_associate',
          },
        },
        {
          $unwind: {
            path: '$business_associate',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            entity_id: 1,
            entity_name: 1,
            cab_code: 1,
            standards: 1,
            Surveillancestatus: 1,
            survApplied: 1,
            application_id: 1,
            createdAt: 1,
            first_surveillance: 1,
            second_surveillance: 1,
            due_date: `$${dueDateField}`,
            'business_associate._id': 1,
            'business_associate.username': 1,
          },
        },
      ]),
      model.aggregate([...pipeline, { $count: 'total' }]),
    ]);

    const now = Date.now();
    const enriched = data.map((row: any) => {
      const due = row.due_date ? new Date(row.due_date).getTime() : null;
      const remainingDays =
        due !== null ? Math.ceil((due - now) / (1000 * 60 * 60 * 24)) : null;
      return { ...row, remainingDays };
    });

    const total = countResult[0]?.total ?? 0;

    return {
      data: enriched,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(type: SurveillanceType, id: string) {
    const model = this.getModel(type);
    const surveillance = await model
      .findById(id)
      .populate({
        path: 'entity',
        select: 'email website employess_count isDirectClient',
      })
      .populate('business_associate', 'username email')
      .populate('appliedBy', 'firstName lastName email')
      .populate('scope_manager', 'firstName lastName email')
      .populate('quality_manager', 'firstName lastName email')
      .populate('certificate_manager', 'firstName lastName email')
      .populate('finance_manager', 'firstName lastName email')
      .exec();

    if (!surveillance) {
      throw new NotFoundException('Surveillance record not found');
    }
    return surveillance;
  }

  async applySurveillance(req: AuthRequest, type: SurveillanceType, id: string) {
    const user = req.user;
    const model = this.getModel(type);
    const surveillance = await model.findById(id);
    if (!surveillance) {
      throw new NotFoundException('Surveillance record not found');
    }

    const blocked = [
      SurveillanceStatusEnum.completed,
      SurveillanceStatusEnum.suspended,
      SurveillanceStatusEnum.withdrawn,
    ];
    if (blocked.includes(surveillance.Surveillancestatus as any)) {
      throw new BadRequestException(
        `Cannot apply when surveillance status is "${surveillance.Surveillancestatus}"`,
      );
    }

    const updated = await model
      .findByIdAndUpdate(
        id,
        {
          $set: {
            Surveillancestatus: SurveillanceStatusEnum.inprogress,
            appliedBy: new Types.ObjectId(user?.userId),
            survApplied: new Date(Date.now()),
          },
        },
        { returnDocument: 'after' },
      )
      .exec();

    return updated;
  }
}
