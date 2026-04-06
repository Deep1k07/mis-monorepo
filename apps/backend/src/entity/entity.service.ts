import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Entity } from './schema/entity.schema';
import { Application } from '../application/schema/application.schema';
import { cleanString } from 'src/utils/cleanString';
import { escapeRegex } from 'src/utils/escapeRegex';
import { createSlug } from 'src/utils/createNameSlug';
import { CreateEntityDto } from './dto/entity.dto';
import { generateAlphanumericCode } from 'src/utils/createEntityId';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EntityService {
  constructor(
    @InjectModel(Entity.name) private entityModel: Model<Entity>,
    @InjectModel(Application.name) private applicationModel: Model<Application>,
    private eventEmitter: EventEmitter2,
  ) { }
  async getUniqueEntityId(entityModel: Model<Entity>): Promise<string> {
    while (true) {
      const id = generateAlphanumericCode();

      const found = await entityModel.exists({ entity_id: id });
      if (!found) return id;
    }
  }

  async create(body: CreateEntityDto, req: AuthRequest) {
    if (!body?.isDirectClient && !body?.business_associate) {
      throw new BadRequestException('Business Associate is required');
    }

    if (body?.isDirectClient && !body?.direct_price) {
      throw new BadRequestException('Direct Price is required');
    }

    // ------------------- ENTITY ID GENERATION -------------------
    const entityId = await this.getUniqueEntityId(this.entityModel);

    let entityName = body.entity_name;
    let nameSlug = createSlug(entityName);

    const existingSlug = await this.entityModel.findOne({
      name_slug: nameSlug,
    });
    if (existingSlug) {
      entityName = `${entityName}-${entityId}`;
      nameSlug = `${nameSlug}-${entityId}`;
    }

    const { direct_price, entity_name, entity_id, name_slug, ...restBody } =
      body;

    const newPayload = {
      ...restBody,
      entity_id: entityId,
      entity_name: entityName,
      name_slug: nameSlug,
      ...(direct_price != null ? { direct_price: Number(direct_price) } : {}),
      isEntityEmailVerifiedStatus: restBody?.by_pass ? 'by-pass' : 'pending',
      createdBy: req?.user?.userId,
    };

    this.eventEmitter.emit('entity:created', {
      to: newPayload.email,
      type: 'create_entity',
      entityData: newPayload,
    });

    return this.entityModel.create(newPayload);
  }

  async update(entityId: string, body: CreateEntityDto, req: AuthRequest) {
    const entity = await this.entityModel.findOne({ entity_id: entityId });
    if (!entity) {
      throw new BadRequestException('Entity not found');
    }

    if (!body?.isDirectClient && !body?.business_associate) {
      throw new BadRequestException('Business Associate is required');
    }

    if (body?.isDirectClient && !body?.direct_price) {
      throw new BadRequestException('Direct Price is required');
    }

    const {
      entity_id,
      name_slug,
      isEntityEmailVerifiedStatus,
      ...updateData
    } = body;

    if (body.entity_name) {
      updateData.entity_name = cleanString(body.entity_name);

      let newSlug = createSlug(updateData.entity_name);
      const existingSlug = await this.entityModel.findOne({
        name_slug: newSlug,
        entity_id: { $ne: entityId },
      });
      if (existingSlug) {
        newSlug = `${newSlug}-${entityId}`;
      }
      (updateData as any).name_slug = newSlug;
    }

    if (updateData.main_site_address) {
      updateData.main_site_address = updateData.main_site_address
    }

    if (updateData.additional_site_address) {
      updateData.additional_site_address = updateData.additional_site_address
    }
    return this.entityModel.findOneAndUpdate(
      { entity_id: entityId },
      { $set: updateData },
      { returnDocument: 'after' },
    );
  }

  async getById(id: string) {
    const entity = await this.entityModel
      .findOne({ entity_id: id })
      .populate({
        path: 'business_associate',
        select: 'username email status phone userId cabCode cab',
        populate: {
          path: 'cab',
          select: 'cab',
        },
      });
    if (!entity) {
      throw new BadRequestException('Entity not found');
    }

    const applications = await this.applicationModel
      .find({ entity_id: id })
      .select('certificate_number cab_code standards current_issue valid_until certificateStatus scopeStatus qualityStatus')
      .sort({ createdAt: -1 })
      .exec();

    return { ...entity.toObject(), applications };
  }

  async getAll(
    req: AuthRequest,
    page: number = 1,
    limit: number = 10,
    business_associate?: string,
    search?: string,
  ) {
    const permissions = req.user.permissions || [];
    const skip = (page - 1) * limit;

    const filter: any = permissions.includes('entity:read:all')
      ? {}
      : { $or: [{ user: req.user.userId }, { createdBy: req.user.userId }] };

    if (business_associate) {
      filter.business_associate = business_associate;
    }

    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      filter.$and = [
        ...(filter.$and || []),
        {
          $or: [
            { entity_name: regex },
            { entity_id: regex },
            { email: regex },
            { entity_trading_name: regex },
          ],
        },
      ];
    }

    const [data, total] = await Promise.all([
      this.entityModel
        .find(filter)
        .populate('business_associate', 'username')
        .populate('createdBy', 'username')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.entityModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
