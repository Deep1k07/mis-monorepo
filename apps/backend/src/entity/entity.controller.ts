import { Controller, Post, Body, Req, UseGuards, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { EntityService } from './entity.service';
import { CreateEntityDto } from './dto/entity.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@Controller('entity')
export class EntityController {
  constructor(private readonly entityService: EntityService) { }
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
  ) {
    return this.entityService.getAll(req, page, limit);
  }
}
