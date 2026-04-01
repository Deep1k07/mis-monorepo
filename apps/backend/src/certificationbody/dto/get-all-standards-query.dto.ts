import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginatedQueryDto } from 'src/common/dto/paginated-query.dto';

export class GetAllStandardsQueryDto extends PaginatedQueryDto {
  @ApiPropertyOptional({ description: 'Filter by certification body ID' })
  @IsOptional()
  @IsString()
  certificationBody?: string;
}
