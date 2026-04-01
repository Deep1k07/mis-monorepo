import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetAllBaQueryDto {
  @ApiPropertyOptional({ description: 'Search by username or userId' })
  @IsOptional()
  @IsString()
  searchTerm?: string;
}
