import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CountryDocument = HydratedDocument<Country>;

@Schema({ timestamps: true })
export class Country {
    @Prop({
        required: true,
        unique: true,
    })
    name: string;

    @Prop({
        required: true,
        uppercase: true,
        unique: true,
        minlength: 3,
        maxlength: 3,
    })
    code: string;

    @Prop({
        default: 'active',
        enum: ['active', 'inactive'],
    })
    status: string;

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
    })
    user: Types.ObjectId;
}

export const CountrySchema = SchemaFactory.createForClass(Country);