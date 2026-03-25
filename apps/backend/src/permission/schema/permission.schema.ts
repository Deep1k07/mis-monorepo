import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PermissionDocument = Permission & Document;

export enum PermissionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum PermissionType {
  DEFAULT = 'default',
  CUSTOM = 'custom',
}

@Schema({ timestamps: true })
export class Permission {
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
  })
  name: string; // e.g., 'user:create', 'certificate:view'

  @Prop()
  description: string;

  @Prop()
  category: string; // e.g., 'User Management', 'Certificate'

  @Prop({
    enum: PermissionStatus,
    default: PermissionStatus.ACTIVE,
  })
  status: PermissionStatus;

  @Prop({
    enum: PermissionType,
    default: PermissionType.DEFAULT,
  })
  type: PermissionType;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
