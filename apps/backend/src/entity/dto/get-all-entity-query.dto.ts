import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetAllEntityQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Business associate ID (MongoDB ObjectId)' })
  @IsOptional()
  @IsString()
  busuness_associate?: string;

  @ApiPropertyOptional({ description: 'Search term for entity name, ID, email, or trading name' })
  @IsOptional()
  @IsString()
  search?: string;
}
