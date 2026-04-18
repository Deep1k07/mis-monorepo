import { IsIn, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SurveillanceType {
  FIRST = 'first',
  SECOND = 'second',
}

export class SurveillanceQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Surveillance status filter' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'CAB code filter' })
  @IsOptional()
  @IsString()
  cabCode?: string;

  @ApiPropertyOptional({ description: 'Business associate id filter' })
  @IsOptional()
  @IsString()
  ba?: string;
}

export class UpdateSurveillanceDraftDto {
  @ApiPropertyOptional({ enum: ['approve', 'reject'] })
  @IsIn(['approve', 'reject'])
  action: 'approve' | 'reject';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scope?: string;

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
  @IsString()
  iaf_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scope_comment?: string;
}

export class UpdateSurveillanceFinalDto {
  @ApiPropertyOptional({ enum: ['approve', 'reject'] })
  @IsIn(['approve', 'reject'])
  action: 'approve' | 'reject';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;

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
  @IsString()
  iaf_code?: string;
}
