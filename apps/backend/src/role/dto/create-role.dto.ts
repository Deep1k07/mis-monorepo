import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleStatus, RoleType, Region } from '../schema/role.schema';

export class CreateRoleDto {
  @ApiProperty({ example: 'BA Manager' })
  @IsString()
  role: string;

  @ApiPropertyOptional({ example: 'Manages business associates' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['permissionId1', 'permissionId2'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[];

  @ApiPropertyOptional({ enum: RoleStatus })
  @IsEnum(RoleStatus)
  @IsOptional()
  status?: RoleStatus;

  @ApiPropertyOptional({ description: 'Reporting role ID' })
  @IsString()
  @IsOptional()
  reportingRole?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  cabCode?: string[];

  @ApiPropertyOptional({ type: [String], enum: Region })
  @IsArray()
  @IsEnum(Region, { each: true })
  @IsOptional()
  region?: Region[];

  @ApiPropertyOptional({ enum: RoleType })
  @IsEnum(RoleType)
  @IsOptional()
  type?: RoleType;
}
