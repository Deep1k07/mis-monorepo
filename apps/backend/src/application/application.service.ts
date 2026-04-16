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
import {
  DRAFT_APPROVED_EVENT,
  FINAL_APPROVED_EVENT,
} from 'src/certificate/certificate.listener';

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
      business_associate: entity.business_associate,
      entity_id: entity.entity_id,
      entity_name: entity.entity_name,
      entity_name_english: entity.entity_name_english,
      entity_trading_name: entity.entity_trading_name,
      main_site_address: entity.main_site_address,
      additional_site_address: data.additional_site_address ?? [],
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
    ba?: string,
    country?: string,
  ) {
    const { user } = req;

    const filter: any = {};
    if (!user.permissions.includes('application:read:all')) {
      filter.user = new Types.ObjectId(user.userId);
    }

    if (cabCode) {
      filter.cab_code = cabCode;
    }

    if (ba && Types.ObjectId.isValid(ba)) {
      filter.business_associate = new Types.ObjectId(ba);
    }

    if (country) {
      filter['main_site_address.0.country'] = country;
    }

    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
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

    const pipeline: any[] = [
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
            cab_code: 1,
            standards: 1,
            certificateStatus: 1,
            qualityStatus: 1,
            scopeStatus: 1,
            baStatus: 1,
            createdAt: 1,
            audit1: 1,
            audit2: 1,
            initial_issue: 1,
            current_issue: 1,
            certificate_number: 1,
            valid_until: 1,
            first_surveillance: 1,
            second_surveillance: 1,
            entity: 1,
            entity_id: 1,
            entity_name: 1,
            'business_associate._id': 1,
            'business_associate.username': 1,
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

    const filter: any = {};
    if(scopeStatus){
      filter.scopeStatus = statusFilter;
    }else{
      filter.scopeStatus = 'pending'
      filter.certificateStatus = 'proceed';
      filter.isBaManagerApproved = true;
    }

    const pipeline: any[] = [
      {
        $match: {
          ...filter,
          ...(search
            ? {
                $or: [
                  { entity_name: new RegExp(escapeRegex(search), 'i') },
                  { entity_id: new RegExp(escapeRegex(search), 'i') },
                  { cab_code: new RegExp(escapeRegex(search), 'i') },
                  { 'standards.code': new RegExp(escapeRegex(search), 'i') },
                ],
              }
            : {}),
        },
      },
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
          $lookup: {
            from: 'entities',
            localField: 'entity',
            foreignField: '_id',
            as: 'entityRef',
          },
        },
        { $unwind: { path: '$entityRef', preserveNullAndEmptyArrays: true } },
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
            entity: 1,
            entity_id: 1,
            entity_name: 1,
            isDirectClient: '$entityRef.isDirectClient',
            'business_associate._id': 1,
            'business_associate.username': 1,
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

  async applyForFinal(id: string) {
    const application = await this.applicationModel.findById(id);
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const blockedScopeStatus = [
      'pending', 
      'rejected'
    ]

    if(blockedScopeStatus.includes(application.scopeStatus)){
      throw new BadRequestException(
        `Cannot apply for final when scope status is "${application.scopeStatus}"`,
      );
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
          'email website employess_count isDirectClient',
      })
      .populate('business_associate', 'username email')
      .populate('appliedBy', 'firstName lastName email')
      .exec();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  // update application and generate draft
  async updateAndGenerateDraft(req: AuthRequest, id: string, updateData: UpdateApplicationDto) {
    const user = req.user;

    const existing = await this.applicationModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException('Application not found');
    }

    if (existing.scopeStatus === 'completed') {
      throw new BadRequestException(
        'Scope is already approved; application can no longer be edited or re-approved.',
      );
    }

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

    async findFinal(
    req: AuthRequest,
    page: number = 1,
    limit: number = 10,
    search?: string,
    qualityStatus?: string,
  ) {
    const user = req.user;
    const skip = (page - 1) * limit;

    const allowedQualityStatuses = ['pending', 'completed', 'rejected'];
    const qualityStatusFilter =
      qualityStatus && allowedQualityStatuses.includes(qualityStatus)
        ? qualityStatus
        : undefined;

    const filter: any = {};
    if (user.permissions.includes('application:read:final')) { // for quality manager
      filter.certificateStatus = 'proceed'
      filter.qualityStatus = 'pending'
      filter.$or = [
        { baManagerStatus: 'final' },
        { clientStatus: 'final' }
      ]
      if(qualityStatusFilter){
        filter.qualityStatus = qualityStatusFilter ?? 'pending';
        delete filter.certificateStatus;
        // delete filter.baManagerStatus;
      }
    } else {
      filter.user = new Types.ObjectId(user.userId);
      filter.certificateStatus = { $nin: ['hold', 'terminate'] }
      filter.$or = [
        { baManagerStatus: 'final' },
        { clientStatus: 'final' }
      ]
      if (qualityStatusFilter) {
        filter.qualityStatus = qualityStatusFilter;
      }
    }

    const pipeline: any[] = [
      {
        $match: {
          ...filter,
          scopeStatus: 'completed',
          ...(search
            ? {
                $or: [
                  { entity_name: new RegExp(escapeRegex(search), 'i') },
                  { entity_id: new RegExp(escapeRegex(search), 'i') },
                  { cab_code: new RegExp(escapeRegex(search), 'i') },
                  { 'standards.code': new RegExp(escapeRegex(search), 'i') },
                ],
              }
            : {}),
        },
      },
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
          $lookup: {
            from: 'entities',
            localField: 'entity',
            foreignField: '_id',
            as: 'entityRef',
          },
        },
        { $unwind: { path: '$entityRef', preserveNullAndEmptyArrays: true } },
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
            entity: 1,
            entity_id: 1,
            entity_name: 1,
            isDirectClient: '$entityRef.isDirectClient',
            'business_associate._id': 1,
            'business_associate.username': 1,
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

  // update final and generate final certificate
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
      update.baManagerStatus = 'final'
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

    if (action === 'approve') {
      this.eventEmitter.emit(FINAL_APPROVED_EVENT, { applicationId: id });
    }

    return application;
  }
}
