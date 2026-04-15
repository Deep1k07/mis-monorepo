import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Application } from '../../application/schema/application.schema';

export enum SurveillanceStatusEnum {'upcoming', 'pending', 'inprogress', 'completed', 'suspended', 'withdrawn'}
  

export type SurveillanceOneDocument = HydratedDocument<SurveillanceOne>;

@Schema({ timestamps: true })
export class SurveillanceOne extends Application {
  @Prop({ default: Date.now })
  survApplied: Date;

  @Prop({
    enum: SurveillanceStatusEnum,
    default: SurveillanceStatusEnum.upcoming,
  })
  Surveillancestatus: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Application' })
  application_id: Types.ObjectId;
}

export const SurveillanceOneSchema = SchemaFactory.createForClass(SurveillanceOne);
