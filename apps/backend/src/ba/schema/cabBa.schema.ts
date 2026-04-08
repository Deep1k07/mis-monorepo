import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CabBADocument = HydratedDocument<CabBA>;

@Schema({ _id: false })
class RateCard {
  @Prop({
    default: 'pending',
    enum: ['active', 'inactive', 'pending', 'rejected'],
  })
  status: string;

  @Prop() initial: string;
  @Prop() annual: string;
  @Prop() recertification: string;
  @Prop() startDate: string;
  @Prop() endDate: string;
  @Prop() comments: string;
}

@Schema({ _id: false })
class Standards {
  @Prop({ default: 0 }) version: number;

  @Prop({
    default: 'active',
    enum: ['active', 'inactive'],
  })
  status: string;

  @Prop({ required: true }) name: string;
  @Prop({ required: true }) code: string;

  @Prop({ type: [RateCard] })
  rateCard: RateCard[];
}

@Schema({ timestamps: true })
export class CB {
  @Prop() cabCode: string;
  @Prop() cbCode: string;
  @Prop() abCode: string;

  @Prop({
    default: 'active',
    enum: ['active', 'inactive'],
  })
  status: string;

  @Prop({ type: [Standards] })
  standards: Standards[];
}

export const CBSchema = SchemaFactory.createForClass(CB);

@Schema({ _id: false })
class Address {
  @Prop() street: string;
  @Prop() city: string;
  @Prop() state: string;
  @Prop() country: string;
  @Prop() postal_code: string;
}

@Schema({ timestamps: true })
export class CabBA {
  @Prop({ required: true })
  contact_name: string;

  @Prop()
  phone: string;

  @Prop({ required: true })
  registration_authority: string;

  @Prop({ required: true, unique: true })
  registration_number: string;

  @Prop({ default: '' })
  registration_date: string;

  @Prop({ default: '' })
  website: string;

  @Prop({ type: Address })
  address: Address;

  @Prop()
  currency: string;

  @Prop()
  gst: string;

  @Prop()
  certificateLanguage: string;

  @Prop()
  otherCertificateLanguage: string;

  @Prop({ type: [CBSchema] })
  cab: CB[];

  @Prop({ type: Types.ObjectId, ref: 'RAcountry' })
  racountry: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'RAJurisdiction' })
  rajurisdiction: Types.ObjectId;

  // raauthority intentionally not included (same as original)
}

export const CabBASchema = SchemaFactory.createForClass(CabBA);
