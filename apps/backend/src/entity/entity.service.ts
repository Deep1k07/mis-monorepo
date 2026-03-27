import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Entity } from './schema/entity.schema';
import { cleanString } from 'src/utils/cleanString';
import { createSlug } from 'src/utils/createNameSlug';
import { CreateEntityDto } from './dto/entity.dto';
import { generateAlphanumericCode } from 'src/utils/createEntityId';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@Injectable()
export class EntityService {
  constructor(@InjectModel(Entity.name) private entityModel: Model<Entity>) { }
  async getUniqueEntityId(entityModel: Model<Entity>): Promise<string> {
    while (true) {
      const id = generateAlphanumericCode();

      const found = await entityModel.exists({ entity_id: id });
      if (!found) return id;
    }
  }

  async create(body: CreateEntityDto, req: AuthRequest) {
    if (!body?.isDirectClient && !body?.busuness_associate) {
      throw new BadRequestException('Business Associate is required');
    }

    if (body?.isDirectClient && !body?.direct_price) {
      throw new BadRequestException('Direct Price is required');
    }

    // ------------------- ENTITY ID GENERATION -------------------
    const entityId = await this.getUniqueEntityId(this.entityModel);

    let entityName = cleanString(body.entity_name);

    let nameSlug = createSlug(entityName);

    const existingSlug = await this.entityModel.findOne({
      name_slug: nameSlug,
    });
    if (existingSlug) {
      entityName = `${entityName}-${entityId}`;
      nameSlug = `${nameSlug}-${entityId}`;
    }

    const { direct_price, entity_name, entity_id, name_slug, ...restBody } = body;

    const newPayload = {
      ...restBody,
      entity_id: entityId,
      entity_name: entityName,
      name_slug: nameSlug,
      ...(direct_price != null ? { direct_price } : {}),
      main_site_address: restBody?.main_site_address?.map((address: any) => ({
        street: cleanString(address?.street),
        city: cleanString(address?.city),
        country: address?.country,
        postal_code: cleanString(address?.postal_code),
      })),
      additional_site_address: restBody?.additional_site_address?.map(
        (address: any) => ({
          street: cleanString(address?.street),
          city: cleanString(address?.city),
          country: address?.country,
          postal_code: cleanString(address?.postal_code),
        }),
      ),
      isEntityEmailVerifiedStatus: restBody?.by_pass ? 'by-pass' : 'pending',
      createdBy: req?.user?.userId,
    };

    return this.entityModel.create(newPayload);
  }

  async getById(id: string) {
    const entity = await this.entityModel
      .findOne({ entity_id: id })
      .populate('busuness_associate', 'username email status phone userId');
    if (!entity) {
      throw new BadRequestException('Entity not found');
    }
    return entity;
  }

  async getAll(
    req: AuthRequest,
    page: number = 1,
    limit: number = 10,
    busuness_associate?: string,
  ) {
    const permissions = req.user.permissions || [];
    const skip = (page - 1) * limit;

    const filter: any = permissions.includes('entity:read:all')
      ? {}
      : { $or: [{ user: req.user.userId }, { createdBy: req.user.userId }] };

    if (busuness_associate) {
      filter.busuness_associate = busuness_associate;
    }


    // console.log("hkbfsjkdf", filter)

    const [data, total] = await Promise.all([
      this.entityModel.find(filter).populate('busuness_associate', 'username').skip(skip).limit(limit).sort({ createdAt: -1 }),
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
