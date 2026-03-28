import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CertificationStandardDocument = HydratedDocument<CertificationStandard>;

export enum Status {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

@Schema({ timestamps: true })
export class CertificationStandard {

    @Prop({
        required: true,
        uppercase: true,
        minlength: 3,
        maxlength: 3,
    })
    mssCode: string;

    @Prop({ required: true })
    schemeName: string;

    @Prop({ required: true })
    standardCode: string;

    @Prop({
        enum: Status,
        default: Status.ACTIVE,
    })
    status: Status;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    user: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'CertificationBody' })
    certificationBody: Types.ObjectId;
}

export const CertificationStandardSchema =
    SchemaFactory.createForClass(CertificationStandard);