import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CertificationBodyDocument = HydratedDocument<CertificationBody>;

export enum CertificationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Schema({ timestamps: true })
export class CertificationBody {
  @Prop({
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 3,
    uppercase: true, // auto converts to uppercase
  })
  cabCode: string;

  @Prop({
    required: true,
    minlength: 4,
    maxlength: 5,
    uppercase: true,
  })
  cbCode: string;

  @Prop({ required: true })
  cbName: string;

  @Prop({
    required: true,
    minlength: 3,
    maxlength: 3,
    uppercase: true,
  })
  abCode: string;

  @Prop({ required: true })
  abName: string;

  @Prop({
    enum: CertificationStatus,
    default: CertificationStatus.ACTIVE,
  })
  status: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'UserAccount' })
  user: Types.ObjectId;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Country' }],
    default: [],
  })
  cabJurisdictions: Types.ObjectId[];
}

export const CertificationBodySchema =
  SchemaFactory.createForClass(CertificationBody);
