import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ApplicationDocument = Application & Document;

//
// 🔹 Common Language Schema (Draft)
//
@Schema({ _id: false })
class DraftLanguage {
  @Prop() s3DraftDocxUrl: string;
  @Prop() s3DraftPdfxUrl: string;
  @Prop() s3DraftAnnexureDocxUrl: string;
  @Prop() s3DraftAnnexurePdfxUrl: string;
}
const DraftLanguageSchema = SchemaFactory.createForClass(DraftLanguage);

//
// 🔹 Common Language Schema (Final)
//
@Schema({ _id: false })
class FinalLanguage {
  @Prop() s3CertificateDocxUrl: string;
  @Prop() s3CertificatePdfxUrl: string;
  @Prop() s3CertificateAnnexureDocxUrl: string;
  @Prop() s3CertificateAnnexurePdfxUrl: string;
}
const FinalLanguageSchema = SchemaFactory.createForClass(FinalLanguage);

//
// 🔹 Applied Draft Certificate
//
@Schema({ timestamps: true })
class AppliedDraftCertificate {
  @Prop({ required: true }) version: string;

  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Prop({ default: 'normal' })
  type: string;

  @Prop({ type: Map, of: DraftLanguageSchema })
  languages: Map<string, DraftLanguage>;
}

//
// 🔹 Applied Final Certificate
//
@Schema({ timestamps: true })
class AppliedFinalCertificate {
  @Prop({ required: true }) version: string;

  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Prop({ default: 'normal' })
  type: string;

  @Prop({ type: Map, of: FinalLanguageSchema })
  languages: Map<string, FinalLanguage>;
}

//
// 🔹 Address Schema
//
@Schema({ _id: false })
class Address {
  @Prop() street: string;
  @Prop({ default: '' }) city: string;
  @Prop({ default: '' }) state: string;
  @Prop() country: string;
  @Prop() postal_code: string;
}

//
// 🔹 Main Application Schema
//
@Schema({ timestamps: true })
export class Application {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' })
  user: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  busuness_associate: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' })
  scope_manager: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' })
  quality_manager: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' })
  appliedBy: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' })
  certificate_manager: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' })
  finance_manager: mongoose.Types.ObjectId;

  @Prop({ required: true })
  cab_code: string;

  @Prop({
    type: [
      {
        code: String,
        name: String,
      },
    ],
  })
  standards: { code: string; name: string }[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Entity' })
  entity: mongoose.Types.ObjectId;

  @Prop({ required: true }) entity_id: string;
  @Prop({ required: true }) entity_name: string;
  @Prop() name_slug: string;
  @Prop() secondary_entity_name: string;
  @Prop({ required: true }) entity_name_english: string;
  @Prop({ required: true }) entity_trading_name: string;

  @Prop({ type: [Address] })
  main_site_address: Address[];

  @Prop({ type: [Address] })
  additional_site_address: Address[];

  @Prop() additional_address: string;

  @Prop({ type: [Address] })
  additional_address_multiple: Address[];

  @Prop({ required: true }) email: string;
  @Prop() website: string;
  @Prop({ required: true }) employess_count: string;
  @Prop({ required: true }) scope: string;
  @Prop() additional_scope: string;

  @Prop({ required: true })
  primary_certificate_language: string;

  @Prop({ default: '' })
  secondary_certificate_language: string;

  @Prop({
    enum: [
      'proceed',
      'completed',
      'hold',
      'withdrawn',
      'suspended',
      'active',
      'expired',
      'lapsed',
      'anulled',
      'inactive',
      'cancelled',
      'hidden',
      'terminate',
    ],
    default: 'proceed',
  })
  certificateStatus: string;

  @Prop({
    enum: ['pending', 'rejected', 'proceed', 'completed'],
    default: 'pending',
  })
  qualityStatus: string;

  @Prop({
    enum: ['applied', 'final'],
    default: 'applied',
  })
  baStatus: string;

  @Prop({
    enum: ['requested', 'notrequested', 'completed'],
    default: 'notrequested',
  })
  manualStatus: string;

  @Prop({
    type: {
      draft: { type: String, default: '' },
      final: { type: String, default: '' },
    },
  })
  manualReason: {
    draft: string;
    final: string;
  };

  @Prop({ default: '' })
  certificate_number: string;

  @Prop({ type: [AppliedDraftCertificate] })
  appliedDraftCertificates: AppliedDraftCertificate[];

  @Prop({ type: [AppliedDraftCertificate] })
  draftCertificate: AppliedDraftCertificate[];

  @Prop({ type: [AppliedDraftCertificate] })
  rejectedCertificate: AppliedDraftCertificate[];

  @Prop({ type: [AppliedFinalCertificate] })
  finalCertificate: AppliedFinalCertificate[];

  @Prop({
    type: [
      {
        url: String,
        status: {
          type: String,
          enum: ['active', 'inactive'],
          default: 'inactive',
        },
        datetime: { type: Date, default: Date.now },
        version: String,
      },
    ],
  })
  s3ManualCertificatePdfUrl: any[];

  @Prop({
    type: [
      {
        url: String,
        status: {
          type: String,
          enum: ['active', 'inactive'],
          default: 'inactive',
        },
        datetime: { type: Date, default: Date.now },
        version: String,
      },
    ],
  })
  s3ManualDraftPdfUrl: any[];

  @Prop({ enum: ['normal', 'urgent', 'most_urgent'], default: 'normal' })
  severity: string;

  @Prop({ enum: ['low', 'medium', 'high'], default: 'low' })
  risk: string;

  @Prop({
    type: {
      initial: { type: String, default: '' },
      annual: { type: String, default: '' },
      recertification: { type: String, default: '' },
    },
  })
  rate_card: {
    initial: string;
    annual: string;
    recertification: string;
  };
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
