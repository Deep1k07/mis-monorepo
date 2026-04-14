import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Application, ApplicationDocument } from './schema/application.schema';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { Entity } from 'src/entity/schema/entity.schema';
import {
  CreateApplicationDto,
  StandardDto,
  UpdateApplicationDto,
  UpdateFinalApplicationDto,
} from './dto/application.dto';
import { CertificationBody } from 'src/certificationbody/schema/certificationBody.schema';
import { escapeRegex } from 'src/utils/escapeRegex';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DRAFT_APPROVED_EVENT } from 'src/certificate/certificate.listener';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,
    @InjectModel(Entity.name) private readonly entityModel: Model<Entity>,
    @InjectModel(CertificationBody.name)
    private readonly certificationBodyModel: Model<CertificationBody>,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async create(data: CreateApplicationDto, req: AuthRequest) {
    const user = req.user;
    // console.log("data>>>", data)
    const cabPromise = this.certificationBodyModel
      .findOne({ cabCode: data.cab_code })
      .populate('cabJurisdictions', 'code name');
    const entityPromise = this.entityModel.findById(data.entity).lean();
    const existingApplicationPromise = this.applicationModel.aggregate([
      {
        $match: {
          $and: [
            { entity: data.entity },
            { cab_code: data.cab_code },
            {
              certificateStatus: {
                $nin: ['suspended', 'withdrawn', 'terminate'],
              },
            },
          ],
        },
      },
    ]);

    const [entity, existingApplication, cabData] = await Promise.all([
      entityPromise,
      existingApplicationPromise,
      cabPromise,
    ]);

    if (!entity) {
      throw new NotFoundException('Entity not found');
    }

    // ===================== CAB JURISDICTION CHECK =====================
    const selectedCountries: string[] = [];
    if (
      Array.isArray(entity?.main_site_address) &&
      entity.main_site_address.length > 0
    ) {
      selectedCountries.push(entity.main_site_address[0].country);
    }
    if (Array.isArray(entity?.additional_site_address)) {
      entity.additional_site_address.forEach((addr) => {
        if (addr?.country) selectedCountries.push(addr.country);
      });
    }

    let cabFlag = true;
    for (const country of selectedCountries) {
      const isAllowed = cabData?.cabJurisdictions?.some(
        (jur: any) => jur?.code === country,
      );
      if (isAllowed) {
        cabFlag = false;
        break;
      }
    }
    // Original jurisdiction check as fallback
    if (cabFlag) {
      cabData?.cabJurisdictions?.forEach((val: any) => {
        if (val?.code === entity?.main_site_address[0]?.country) {
          cabFlag = false;
        }
      });
    }

    if (cabFlag) {
      throw new BadRequestException(
        `Can not apply for Certificate because Entity does not fall within ${data?.cab_code}'s jurisdiction.`,
      );
    }

    let stadardLookup = {};
    data?.standards.forEach((val) => {
      stadardLookup = { ...stadardLookup, [val.code]: val };
    });

    let flag = false;
    if (existingApplication?.length > 0) {
      existingApplication.forEach((val) => {
        val?.standards.forEach((ele: StandardDto) => {
          if (stadardLookup[ele.code]) {
            if (!data?.secondary_certificate_language) {
              flag = true;
            } else if (
              val?.secondary_certificate_language ===
              data?.secondary_certificate_language
            ) {
              flag = true;
            }
          }
        });
      });
    }
    if (flag) {
      throw new BadRequestException(
        `You have already applied for ${data?.standards[0]?.code} certificate with provided languages.`,
      );
    }

    const payload = {
      ...data,
      user: user?.userId,
      appliedBy: user?.userId,
    };

    const createdApplication = await this.applicationModel.create(payload);
    return createdApplication;
  }

  async findAll(
    req: AuthRequest,
    page: number = 1,
    limit: number = 10,
    search?: string,
    cabCode?: string,
  ) {
    const { user } = req;

    const filter: any = {};
    if (!user.permissions.includes('application:read:all')) {
      filter.user = new Types.ObjectId(user.userId);
    }

    if (cabCode) {
      filter.cab_code = cabCode;
    }

    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
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
            localField: 'entity.business_associate',
            foreignField: '_id',
            as: 'entity.business_associate',
          },
        },
        {
          $unwind: {
            path: '$entity.business_associate',
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
            'entity.business_associate._id': 1,
            'entity.business_associate.username': 1,
          },
        },
      ]),
      this.applicationModel.aggregate([...pipeline, { $count: 'total' }]),
    ]);

    const total = countResult[0]?.total ?? 0;

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findDraft(
    _req: AuthRequest,
    page: number = 1,
    limit: number = 10,
    search?: string,
    scopeStatus?: string,
  ) {
    const allowedStatuses = ['pending', 'rejected', 'completed'];
    const statusFilter =
      scopeStatus && allowedStatuses.includes(scopeStatus)
        ? scopeStatus
        : { $in: ['pending'] };

    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      {
        $match: {
          scopeStatus: statusFilter,
          certificateStatus: 'proceed',
          isBaManagerApproved: true,
        },
      },
      {
        $lookup: {
          from: 'entities',
          localField: 'entity',
          foreignField: '_id',
          as: 'entity',
        },
      },
      { $unwind: { path: '$entity', preserveNullAndEmptyArrays: true } },
      ...(search
        ? [
          {
            $match: {
              $or: [
                {
                  'entity.entity_name': new RegExp(escapeRegex(search), 'i'),
                },
                { 'entity.entity_id': new RegExp(escapeRegex(search), 'i') },
                { cab_code: new RegExp(escapeRegex(search), 'i') },
                { 'standards.code': new RegExp(escapeRegex(search), 'i') },
              ],
            },
          },
        ]
        : []),
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
            localField: 'entity.business_associate',
            foreignField: '_id',
            as: 'entity.business_associate',
          },
        },
        {
          $unwind: {
            path: '$entity.business_associate',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            cab_code: 1,
            standards: 1,
            scope: 1,
            certificateStatus: 1,
            scopeStatus: 1,
            audit1: 1,
            audit2: 1,
            iaf_code: 1,
            createdAt: 1,
            'entity._id': 1,
            'entity.entity_id': 1,
            'entity.entity_name': 1,
            'entity.isDirectClient': 1,
            'entity.business_associate._id': 1,
            'entity.business_associate.username': 1,
          },
        },
      ]),
      this.applicationModel.aggregate([...pipeline, { $count: 'total' }]),
    ]);

    const total = countResult[0]?.total ?? 0;

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findFinal(
    req: AuthRequest,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    const user = req.user;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (user.permissions.includes('application:read:final')) { // for quality manager
      filter.qualityStatus = 'pending',
        filter.certificateStatus = 'proceed'
      filter.baManagerStatus = 'applied'
    } else {
      filter.user = new Types.ObjectId(user.userId);
      filter.certificateStatus = { $nin: ['hold', 'terminate'] }
    }

    const pipeline: any[] = [
      {
        $match: {
          ...filter,
          scopeStatus: 'completed',
        },
      },
      {
        $lookup: {
          from: 'entities',
          localField: 'entity',
          foreignField: '_id',
          as: 'entity',
        },
      },
      { $unwind: { path: '$entity', preserveNullAndEmptyArrays: true } },
      ...(search
        ? [
          {
            $match: {
              $or: [
                {
                  'entity.entity_name': new RegExp(escapeRegex(search), 'i'),
                },
                { 'entity.entity_id': new RegExp(escapeRegex(search), 'i') },
                { cab_code: new RegExp(escapeRegex(search), 'i') },
                { 'standards.code': new RegExp(escapeRegex(search), 'i') },
              ],
            },
          },
        ]
        : []),
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
            localField: 'entity.business_associate',
            foreignField: '_id',
            as: 'entity.business_associate',
          },
        },
        {
          $unwind: {
            path: '$entity.business_associate',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            cab_code: 1,
            standards: 1,
            scope: 1,
            scopeStatus: 1,
            qualityStatus: 1,
            certificateStatus: 1,
            audit1: 1,
            audit2: 1,
            iaf_code: 1,
            createdAt: 1,
            'entity._id': 1,
            'entity.entity_id': 1,
            'entity.entity_name': 1,
            'entity.isDirectClient': 1,
            'entity.business_associate._id': 1,
            'entity.business_associate.username': 1,
          },
        },
      ]),
      this.applicationModel.aggregate([...pipeline, { $count: 'total' }]),
    ]);

    const total = countResult[0]?.total ?? 0;

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateFinal(
    req: AuthRequest,
    id: string,
    data: UpdateFinalApplicationDto,
  ) {
    const { action, comment, audit1, audit2, iaf_code } = data;
    const update: any = { quality_manager: req.user.userId };

    if (action === 'approve') {
      update.qualityStatus = 'completed';
      update.certificateStatus = 'completed';
      if (audit1 !== undefined) update.audit1 = audit1;
      if (audit2 !== undefined) update.audit2 = audit2;
      if (iaf_code !== undefined) update.iaf_code = iaf_code;
    } else {
      update.qualityStatus = 'rejected';
    }

    if (comment) update.quality_comment = comment;

    const application = await this.applicationModel
      .findByIdAndUpdate(id, { $set: update }, { returnDocument: 'after' })
      .exec();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async toggleBaManagerStatus(id: string) {
    const application = await this.applicationModel.findById(id);
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const blockedStatuses = [
      'hold',
      'active',
      'completed',
      'suspended',
      'withdrawn',
      'pending',
      'rejected',
      'transfer',
    ];

    if (blockedStatuses.includes(application.certificateStatus)) {
      throw new BadRequestException(
        `Cannot apply for final when certificate status is "${application.certificateStatus}"`,
      );
    }

    const newStatus =
      application.baManagerStatus === 'final' ? 'applied' : 'final';

    const updated = await this.applicationModel
      .findByIdAndUpdate(
        id,
        { $set: { baManagerStatus: newStatus } },
        { returnDocument: 'after' },
      )
      .exec();

    return updated;
  }

  async findById(id: string) {
    const application = await this.applicationModel
      .findById(id)
      .populate({
        path: 'entity',
        select:
          'entity_id entity_name entity_name_english entity_trading_name business_associate email website employess_count main_site_address additional_site_address isDirectClient',
        populate: {
          path: 'business_associate',
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

  async update(req: AuthRequest, id: string, updateData: UpdateApplicationDto) {
    const user = req.user;

    const application = await this.applicationModel
      .findByIdAndUpdate(
        id,
        { $set: { ...updateData, scope_manager: user.userId } },
        { returnDocument: 'after' },
      )
      .populate('business_associate', 'username email userId')
      .exec();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Trigger certificate generation when draft application is approved
    if (updateData.scopeStatus === 'completed') {
      this.eventEmitter.emit(DRAFT_APPROVED_EVENT, {
        applicationId: id,
      });
    }

    return application;
  }
}
