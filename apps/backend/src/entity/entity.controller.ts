import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Query,
  Param,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { EntityService } from './entity.service';
import { CreateEntityDto } from './dto/entity.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { Entity } from './schema/entity.schema';

@Controller('entity')
export class EntityController {
  constructor(private readonly entityService: EntityService) {}
  @Post('create')
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: CreateEntityDto, @Req() req: AuthRequest) {
    return this.entityService.create(body, req);
  }

  @Get('get-all')
  @UseGuards(JwtAuthGuard)
  async getAll(
    @Req() req: AuthRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('busuness_associate') busuness_associate?: string,
  ): Promise<{
    data: Entity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.entityService.getAll(req, page, limit, busuness_associate);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id') id: string) {
    return this.entityService.getById(id);
  }
}
