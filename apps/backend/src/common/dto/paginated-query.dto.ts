import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginatedQueryDto {
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

  @ApiPropertyOptional({ description: 'Scope status filter' })
  @IsOptional()
  @IsString()
  scopeStatus?: string;

  @ApiPropertyOptional({ description: 'CAB code filter' })
  @IsOptional()
  @IsString()
  cabCode?: string;

  @ApiPropertyOptional({ description: 'Business associate id filter' })
  @IsOptional()
  @IsString()
  ba?: string;

  @ApiPropertyOptional({ description: 'Country filter (matches main site country)' })
  @IsOptional()
  @IsString()
  country?: string;
}
