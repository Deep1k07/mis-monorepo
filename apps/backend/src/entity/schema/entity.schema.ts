import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Entity {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  busuness_associate: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ required: true, unique: true })
  entity_id: string;

  @Prop({ default: '' })
  old_entity_id: string;

  @Prop({ required: true, unique: true })
  entity_name: string;

  @Prop({ unique: true })
  name_slug: string;

  @Prop({ required: true })
  entity_name_english: string;

  @Prop({ required: true })
  entity_trading_name: string;

  // ✅ Main Site Address
  @Prop([
    {
      street: String,
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: String,
      postal_code: { type: String, default: '' },
    },
  ])
  main_site_address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  }[];

  // ✅ Additional Site Address
  @Prop([
    {
      street: String,
      city: String,
      state: String,
      country: String,
      postal_code: String,
      legal_entity_management: String,
      site_type: String,
      site_category: String,

      separate_legal_entity: {
        legal_entity_name: String,
        address_country: String,
        address_region: String,
        address_city: String,
        address_postal_code: String,
        address_street: String,
        ra_country_id: String,
        jurisdiction_id: String,
        registration_authority_id: String,
        registration_authority_name: String,
        registration_number: String,
      },
    },
  ])
  additional_site_address: any[];

  @Prop({ required: true })
  email: string;

  @Prop()
  website: string;

  @Prop()
  drive_link: string;

  @Prop()
  employess_count: string;

  // ✅ Primary Contact
  @Prop({
    type: {
      name: String,
      designation: String,
      email: String,
      mobile_number: {
        country_code: String,
        number: String,
      },
    },
  })
  primary_contact_person: {
    name: string;
    designation: string;
    email: string;
    mobile_number: {
      country_code: string;
      number: string;
    };
  };

  @Prop({
    enum: ['pending', 'proceed', 'completed'],
    default: 'pending',
  })
  certificateStatus: string;

  @Prop({
    enum: ['pending', 'rejected', 'approved'],
    default: 'pending',
  })
  docStatus: string;

  @Prop({
    enum: ['pending', 'rejected', 'completed'],
    default: 'pending',
  })
  scopeStatus: string;

  @Prop({
    enum: ['pending', 'rejected', 'completed'],
    default: 'pending',
  })
  qualityStatus: string;

  @Prop()
  isDirectClient: boolean;

  @Prop()
  direct_price: number;

  @Prop({
    enum: ['not-verified', 'verified', 'by-pass', 'pending'],
    default: 'pending',
  })
  isEntityEmailVerifiedStatus: string;

  @Prop({ default: null })
  emailVerifiedAt: Date;

  @Prop()
  email_cab_code: string;

  @Prop()
  ra_country: string;

  @Prop()
  ra_jurisdiction: string;

  @Prop()
  ra_authority: string;

  @Prop()
  ra_registration_number: string;

  @Prop({
    enum: ['draft', 'submitted', 'verified', 'approved', 'rejected'],
    default: 'draft',
  })
  status: string;

  @Prop({
    type: {
      termsAccepted: Boolean,
      emailVerificationAccepted: Boolean,
    },
  })
  terms: {
    termsAccepted: boolean;
    emailVerificationAccepted: boolean;
  };
}

export const EntitySchema = SchemaFactory.createForClass(Entity);
