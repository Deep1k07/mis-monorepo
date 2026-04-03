import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type CertificationStandardDocument =
  HydratedDocument<CertificationStandard>;

export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired'
}

@Schema({ timestamps: true })
export class CertificationStandard {
  @Prop({
    required: true,
    uppercase: true,
    trim: true,
    minlength: 3,
    maxlength: 3,
  })
  mssCode: string;

  @Prop({ required: true })
  schemeName: string;

  @Prop({ required: true, trim: true }) // eg ISO 9001
  standardCode: string;

  @Prop({ required: true, trim: true }) // eg 2015 or 2025
  version: string

  @Prop({
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'CertificationStandard' })
  predecessor: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'CertificationStandard' })
  successor: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' })
  user: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'CertificationBody' })
  certificationBody: Types.ObjectId;
}

export const CertificationStandardSchema = SchemaFactory.createForClass(CertificationStandard);
