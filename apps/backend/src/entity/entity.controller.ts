import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { EntityService } from './entity.service';
import { CreateEntityDto } from './dto/entity.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@Controller('entity')
export class EntityController {
  constructor(private readonly entityService: EntityService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: CreateEntityDto, @Req() req: AuthRequest) {
    return this.entityService.create(body, req);
  }
}
