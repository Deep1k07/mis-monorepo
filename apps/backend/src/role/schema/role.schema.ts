import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserRoleDocument = UserRole & Document;

export enum RoleStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

export enum RoleType {
    DEFAULT = 'default',
    CUSTOM = 'custom',
}

export enum Region {
    INDIA = 'India',
    OVERSEAS = 'Overseas',
}

@Schema({ timestamps: true })
export class UserRole {
    @Prop({
        required: true,
        unique: true,
    })
    role: string; // eg: BA Manager, Scope Manager

    @Prop()
    description: string;

    @Prop({
        type: [{ type: Types.ObjectId, ref: 'Permission' }],
    })
    permissions: Types.ObjectId[];

    @Prop({
        enum: RoleStatus,
        default: RoleStatus.ACTIVE,
    })
    status: RoleStatus;

    @Prop({
        type: Types.ObjectId,
        ref: 'UserAccount',
    })
    createdBy: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'UserRole',
    })
    reportingRole: Types.ObjectId;

    @Prop({
        type: [String],
        default: [],
    })
    cabCode: string[];

    @Prop({
        type: [String],
        enum: Region,
        default: [],
    })
    region: Region[];

    @Prop({
        enum: RoleType,
        default: RoleType.CUSTOM,
    })
    type: RoleType;
}

export const UserRoleSchema = SchemaFactory.createForClass(UserRole);