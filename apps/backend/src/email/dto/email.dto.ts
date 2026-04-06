import { IsString, IsNotEmpty, IsEmail, IsObject } from 'class-validator';

export class EntityEmailDto {
    @IsString()
    @IsNotEmpty()
    to: string;

    @IsString()
    @IsNotEmpty()
    type: 'create_entity' | 'apply_cert';

    @IsObject()
    @IsNotEmpty()
    entityData: any;
}