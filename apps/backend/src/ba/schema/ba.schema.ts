import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type UserDocument = User & Document;

//
// 🔹 Converted From Lead Sub-schema
//
@Schema({ _id: false })
class ConvertedFromLead {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null })
  leadId: mongoose.Types.ObjectId;

  @Prop({ type: Date, default: null })
  convertedAt: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  convertedBy: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  leadMangerId: mongoose.Types.ObjectId;
}

//
// 🔹 Country Sub-schema
//
@Schema({ _id: false })
class Country {
  @Prop({ type: [String] })
  cab: string[];

  @Prop()
  ref: string;
}

//
// 🔹 Two Factor Auth Sub-schema
//
@Schema({ _id: false })
class TwoFA {
  @Prop({ default: false })
  enabled: boolean;

  @Prop()
  tempSecret: string;

  @Prop()
  secret: string;
}

//
// 🔹 Main User Schema
//
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({
    maxlength: 4,
    minlength: 4,
    default: null,
    set: (v: string) => v?.toUpperCase(),
  })
  userId: string;

  @Prop({
    default: null,
    set: (v: string) => v?.toLowerCase(),
  })
  email: string;

  @Prop({ default: null })
  phone: string;

  @Prop()
  role: string;

  @Prop()
  image: string;

  @Prop({ select: false })
  password: string;

  @Prop({
    enum: ['active', 'inactive', 'pending', 'rejected', 'suspended'],
    default: 'active',
  })
  status: string;

  @Prop({
    enum: ['approved', 'pending', 'uploaded', 'rejected'],
    default: 'pending',
  })
  mouStatus: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'CabBA' })
  cab: mongoose.Types.ObjectId;

  @Prop({
    type: [String],
    enum: ['India', 'Overseas'],
    default: [],
  })
  region: string[];

  @Prop({
    type: [String],
    enum: ['TCU', 'TSI', 'GAU'],
    default: [],
  })
  cabCode: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' })
  user: mongoose.Types.ObjectId;

  @Prop({ type: ConvertedFromLead })
  convertedFromLead: ConvertedFromLead;

  @Prop({ type: [Country] })
  country: Country[];

  @Prop()
  conversion: string;

  @Prop()
  lead_generation: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  reporting_manager: mongoose.Types.ObjectId;

  @Prop()
  date_of_joining: string;

  @Prop({ type: TwoFA })
  twoFA: TwoFA;

  @Prop()
  avatar: string;

  @Prop()
  comment: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
