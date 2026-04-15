import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type ApplicationDocument = HydratedDocument<Application>;

export enum certificateStatusEnum {
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
}

export enum scopeStatusEnum {
  'pending',
  'rejected',
  'transfer',
  'completed',
}

export enum qualityStatusEnum {
  'pending',
  'rejected',
  'proceed',
  'completed',
}

@Schema({ _id: false })
class AppliedDraftCertificateLanguages {
  @Prop() s3DraftDocxUrl: string;
  @Prop() s3DraftPdfxUrl: string;
  @Prop() s3DraftAnnexureDocxUrl: string;
  @Prop() s3DraftAnnexurePdfxUrl: string;
}
const AppliedDraftCertificateLanguagesSchema = SchemaFactory.createForClass(
  AppliedDraftCertificateLanguages,
);

@Schema({ timestamps: true })
export class AppliedDraftCertificate {
  @Prop({ required: true }) version: string;
  @Prop({ enum: ['active', 'inactive'], default: 'active' }) status: string;
  @Prop({ default: 'normal' }) type: string;

  @Prop({
    type: Map,
    of: AppliedDraftCertificateLanguagesSchema,
  })
  languages: Map<string, AppliedDraftCertificateLanguages>;
}

export const AppliedDraftCertificateSchema = SchemaFactory.createForClass(
  AppliedDraftCertificate,
);

@Schema({ _id: false })
class AppliedFinalCertificateLanguages {
  @Prop() s3CertificateDocxUrl: string;
  @Prop() s3CertificatePdfxUrl: string;
  @Prop() s3CertificateAnnexureDocxUrl: string;
  @Prop() s3CertificateAnnexurePdfxUrl: string;
}
const AppliedFinalCertificateLanguagesSchema = SchemaFactory.createForClass(
  AppliedFinalCertificateLanguages,
);

@Schema({ timestamps: true })
export class AppliedFinalCertificate {
  @Prop({ required: true }) version: string;
  @Prop({ enum: ['active', 'inactive'], default: 'active' }) status: string;
  @Prop({ default: 'normal' }) type: string;

  @Prop({
    type: Map,
    of: AppliedFinalCertificateLanguagesSchema,
  })
  languages: Map<string, AppliedFinalCertificateLanguages>;
}

export const AppliedFinalCertificateSchema = SchemaFactory.createForClass(
  AppliedFinalCertificate,
);

@Schema({ timestamps: true })
export class Application {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' })
  user: Types.ObjectId;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  business_associate: Types.ObjectId;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' })
  scope_manager: Types.ObjectId;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' })
  quality_manager: Types.ObjectId;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' })
  appliedBy: Types.ObjectId;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' })
  certificate_manager: Types.ObjectId;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' })
  finance_manager: Types.ObjectId;

  @Prop({ required: true }) cab_code: string;

  @Prop([
    {
      code: { type: String, required: true },
      name: { type: String, required: true },
    },
  ])
  standards: { code: string; name: string }[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Entity', required: true })
  entity: Types.ObjectId;

  @Prop({ required: true })
  entity_id: string;

  @Prop({ required: true })
  entity_name: string;

  @Prop({ required: true })
  entity_name_english: string;

  @Prop({ required: true })
  entity_trading_name: string;

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

  @Prop([
    {
      street: String,
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: String,
      postal_code: String,
    },
  ])
  additional_site_address: any[]; 

  @Prop([
    {
      street: String,
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: String,
      postal_code: String,
    },
  ])
  additional_address_multiple: any[]; 

  @Prop() secondary_entity_name: string;

  @Prop() employess_count: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' })
  bulkUploadedBy: Types.ObjectId;

  @Prop() additional_address: string;


  @Prop() website: string;
  @Prop({ required: true }) scope: string;
  @Prop() additional_scope: string;
  @Prop() drive_link: string;
  @Prop() isEntityEmailVerified: boolean;

  @Prop({ required: true }) primary_certificate_language: string;
  @Prop({ default: '' }) secondary_certificate_language: string;
  @Prop({ default: '' }) iaf_code: string;

  @Prop({ type: { version: String, date: Date } }) soa: {
    version: string;
    date: Date;
  };

  @Prop({ type: { version: String, date: Date } }) samp: {
    version: string;
    date: Date;
  };

  @Prop({ default: '' }) flag: string;
  @Prop({ default: 0 }) isScopeModified: number;
  @Prop() isScopeApproved: boolean;
  @Prop({ default: true }) isBaManagerApproved: boolean;

  @Prop({
    enum: certificateStatusEnum,
    default: certificateStatusEnum.proceed,
  })
  certificateStatus: string;

  @Prop({
    enum: scopeStatusEnum,
    default: scopeStatusEnum.pending,
  })
  scopeStatus: string;

  @Prop({
    enum: qualityStatusEnum,
    default: qualityStatusEnum.pending,
  })
  qualityStatus: string;

  @Prop({ enum: ['applied', 'final'], default: 'applied' }) baStatus: string;
  @Prop({ enum: ['applied', 'final'], default: 'applied' })
  baManagerStatus: string;
  @Prop({ enum: ['applied', 'final'], default: 'applied' })
  clientStatus: string;

  @Prop({ enum: ['pending', 'rejected', 'completed'], default: 'pending' })
  tallyStatus: string;

  @Prop({
    enum: ['pending', 'applied', 'approved', 'rejected'],
    default: 'pending',
  })
  revisionStatus: string;

  @Prop({
    enum: ['requested', 'notrequested', 'completed'],
    default: 'notrequested',
  })
  manualStatus: string;

  @Prop({
    enum: ['requested', 'notrequested', 'completed'],
    default: 'notrequested',
  })
  manualStatusCert: string;

  @Prop({
    type: {
      draft: { type: String, default: '' },
      final: { type: String, default: '' },
    },
  })
  manualReason: { draft: string; final: string };

  @Prop({ default: '' }) certificate_number: string;
  @Prop({ default: '' }) old_certificate_number: string;

  @Prop() initial_issue: string;
  @Prop() current_issue: string;
  @Prop() valid_until: string;
  @Prop() first_surveillance: string;
  @Prop() second_surveillance: string;
  @Prop() recertification_due: string;
  @Prop() revision_no: string;
  @Prop() revision_date: string;
  @Prop() issue_no: string;
  @Prop() finalCreatedAt: Date;
  @Prop() finalUpdatedAt: Date;

  @Prop({ default: Date.now }) s3DraftDate: Date;
  @Prop({ default: Date.now }) tallyDate: Date;

  @Prop({ type: [AppliedDraftCertificateSchema] })
  appliedDraftCertificates: AppliedDraftCertificate[];

  @Prop({ type: [AppliedDraftCertificateSchema] })
  draftCertificate: AppliedDraftCertificate[];

  @Prop({ type: [AppliedDraftCertificateSchema] })
  rejectedCertificate: AppliedDraftCertificate[];

  @Prop({ type: [AppliedFinalCertificateSchema] })
  finalCertificate: AppliedFinalCertificate[];

  @Prop({ default: '' }) quality_comment: string;
  @Prop({ default: '' }) ba_comment: string;
  @Prop({ default: '' }) ba_manager_comment: string;
  @Prop({ default: '' }) client_comment: string;
  @Prop({ default: '' }) scope_comment: string;
  @Prop({ default: '' }) certificate_comment: string;
  @Prop({ default: '' }) anulled_comment: string;
  @Prop({ default: '' }) anulled_date: Date;

  @Prop({ default: '' }) audit1: string;
  @Prop({ default: '' }) audit2: string;
  @Prop({ default: '' }) auditor_leader_name: string;
  @Prop({ default: '' }) report_number: string;
  @Prop({ default: '' }) last_audit_day_on_site: string;
  @Prop({ default: '' }) certificate_decision_date: string;

  @Prop([
    {
      url: { type: String, required: true },
      status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive',
      },
      datetime: { type: Date, default: Date.now },
      version: { type: String, required: true },
    },
  ])
  s3ManualCertificatePdfUrl: any[];

  @Prop([
    {
      url: { type: String, required: true },
      status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive',
      },
      datetime: { type: Date, default: Date.now },
      version: { type: String, required: true },
    },
  ])
  s3ManualDraftPdfUrl: any[];

  @Prop() certification_type: string;

  @Prop({ enum: ['normal', 'urgent', 'most_urgent'], default: 'normal' })
  severity: string;

  @Prop({ default: false }) annexure: boolean;
  @Prop({ required: true }) duration: string;
  @Prop({ default: '' }) charges: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Conversion' })
  usdConversion: mongoose.Schema.Types.ObjectId;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Revision' }])
  revisions: mongoose.Schema.Types.ObjectId[];

  @Prop({ default: '' }) gst: string;
  @Prop({ default: '' }) currency: string;

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

  @Prop({ default: '' }) prev_cb_name: string;
  @Prop({ default: '' }) prev_ab_name: string;

  @Prop({
    enum: ['initial', 'transfer', 'recertification', 'surveillance'],
    default: 'initial',
  })
  type: string;

  @Prop({
    type: {
      first: {
        ref: { type: mongoose.Schema.Types.ObjectId, ref: 'SurveillanceOne' },
        status: {
          type: String,
          enum: ['upcoming', 'pending', 'inprogress', 'completed'],
        },
        charges: { type: String, default: '' },
      },
      second: {
        ref: { type: mongoose.Schema.Types.ObjectId, ref: 'SurveillanceTwo' },
        status: {
          type: String,
          enum: ['upcoming', 'pending', 'inprogress', 'completed'],
        },
        charges: { type: String, default: '' },
      },
    },
  })
  surveillanceStatus: any;

  @Prop({
    type: {
      ref: { type: mongoose.Schema.Types.ObjectId, ref: 'Recertification' },
      status: {
        type: String,
        enum: ['upcoming', 'pending', 'inprogress', 'completed'],
      },
      charges: { type: String, default: '' },
    },
  })
  recertificationStatus: any;

  @Prop({ default: null }) policyconfirmity: boolean;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
