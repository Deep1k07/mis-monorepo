import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginatedQueryDto } from 'src/common/dto/paginated-query.dto';

export class GetAllEntityQueryDto extends PaginatedQueryDto {
  @ApiPropertyOptional({
    description: 'Business associate ID (MongoDB ObjectId)',
  })
  @IsOptional()
  @IsString()
  business_associate?: string;
}
