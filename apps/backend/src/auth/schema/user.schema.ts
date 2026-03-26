import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

export type UserAccountDocument = UserAccount & Document;

@Schema({ timestamps: true })
export class UserAccount {
  @Prop({ required: true })
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({
    maxlength: 7,
    minlength: 7,
    uppercase: true,
    unique: true,
    sparse: true,
    default: undefined,
  })
  userId: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
  })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserRole' })
  role: Types.ObjectId;

  @Prop({ select: false })
  password: string;

  @Prop({
    enum: ['active', 'inactive', 'pending', 'rejected', 'suspended'],
    default: 'active',
  })
  status: string;

  @Prop()
  conversion: string;

  @Prop()
  leadGeneration: string;

  @Prop()
  dateOfJoining: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' })
  reportingManager: Types.ObjectId;

  @Prop([
    {
      cab: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CertificationBody' }],
      ref: String,
    },
  ])
  country: {
    cab: Types.ObjectId[];
    ref: string;
  }[];

  @Prop({
    type: {
      enabled: { type: Boolean, default: false },
      tempSecret: { type: String, select: false },
      secret: { type: String, select: false },
    },
  })
  twoFA: {
    enabled: boolean;
    tempSecret: string;
    secret: string;
  };

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' })
  createdBy: Types.ObjectId;

  @Prop()
  avatar: string;

  @Prop()
  comment: string;

  @Prop()
  lastLogin: Date;

  @Prop()
  lastLoginIP: string;
}

export const UserAccountSchema = SchemaFactory.createForClass(UserAccount);
