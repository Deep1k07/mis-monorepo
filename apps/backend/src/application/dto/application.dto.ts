import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StandardDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}

class AddressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  postal_code?: string;
}

export class CreateApplicationDto {
  @ApiProperty({ description: 'Entity ObjectId' })
  @IsMongoId()
  entity: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cab_code: string;

  @ApiProperty({ type: [StandardDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StandardDto)
  standards: StandardDto[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  duration: string;

  @ApiProperty({ enum: ['normal', 'urgent', 'most_urgent'] })
  @IsEnum(['normal', 'urgent', 'most_urgent'])
  severity: string;

  @ApiProperty({ enum: ['low', 'medium', 'high'] })
  @IsEnum(['low', 'medium', 'high'])
  risk: string;

  @ApiProperty()
  @IsBoolean()
  annexure: boolean;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  auditor_leader_name: string;

  @ApiProperty({ enum: ['individual', 'integrated'] })
  @IsEnum(['individual', 'integrated'])
  certification_type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  charges?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  primary_certificate_language: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  drive_link?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  scope: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  secondary_entity_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  secondary_certificate_language?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  additional_scope?: string;

  @ApiPropertyOptional({ type: [AddressDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  additional_site_address?: AddressDto[];

  @ApiPropertyOptional({ type: [AddressDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  additional_address_multiple?: AddressDto[];
}

export class UpdateApplicationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scope?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  additional_scope?: string;

  @ApiPropertyOptional({ type: [AddressDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  main_site_address?: AddressDto[];

  @ApiPropertyOptional({ type: [AddressDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  additional_site_address?: AddressDto[];

  @ApiPropertyOptional({ type: [AddressDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  additional_address_multiple?: AddressDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primary_certificate_language?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  secondary_certificate_language?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scope_comment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  iaf_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  audit1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  audit2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  isScopeModified?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scopeStatus?: string;
}

export class UpdateFinalApplicationDto {
  @ApiProperty({ enum: ['approve', 'reject'] })
  @IsEnum(['approve', 'reject'])
  action!: 'approve' | 'reject';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;

  @IsNotEmpty()
  @IsString()
  audit1: string;

  @IsNotEmpty()
  @IsString()
  audit2: string;

  @IsNotEmpty()
  @IsString()
  iaf_code: string;
}
