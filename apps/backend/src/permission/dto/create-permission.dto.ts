import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PermissionStatus, PermissionType } from '../schema/permission.schema';

export class CreatePermissionDto {
  @ApiProperty({ example: 'user:create' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Can create new users' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'User Management' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ enum: PermissionStatus })
  @IsEnum(PermissionStatus)
  @IsOptional()
  status?: PermissionStatus;

  @ApiPropertyOptional({ enum: PermissionType })
  @IsEnum(PermissionType)
  @IsOptional()
  type?: PermissionType;
}
