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

        // ------------------- ENTITY ID GENERATION -------------------

        if (!body?.isDirectClient && !body?.busuness_associate) {
            throw new BadRequestException("Business Associate is required");
        }

        body.entity_id = await this.getUniqueEntityId(this.entityModel); // generate unique entity id

        body.entity_name = cleanString(body?.entity_name); // clean the entity name

        let nameSlug = createSlug(body.entity_name); // create the slug

        const existingSlug = await this.entityModel.findOne({ name_slug: nameSlug });
        if (existingSlug) {
            body.entity_name = `${body.entity_name}-${body.entity_id}`;
            nameSlug = `${nameSlug}-${body.entity_id}`;
        }

        body.name_slug = nameSlug;

        const newPayload = {
            ...body,
            main_site_address: body?.main_site_address?.map((address: any) => ({
                street: cleanString(address?.street),
                city: cleanString(address?.city),
                country: address?.country,
                postal_code: cleanString(address?.postal_code),
            })),
            additional_site_address: body?.additional_site_address?.map((address: any) => ({
                street: cleanString(address?.street),
                city: cleanString(address?.city),
                country: address?.country,
                postal_code: cleanString(address?.postal_code),
            })),
            isEntityEmailVerifiedStatus: body?.by_pass ? 'by-pass' : 'pending',
            createdBy: req?.user?.userId,
        }

        console.log(newPayload, req?.user?.userId);

        return newPayload;

        // return this.entityModel.create(newPayload);
    }
}
