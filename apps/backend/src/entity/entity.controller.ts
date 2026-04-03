import {
  Controller,
  Post,
  Patch,
  Body,
  Req,
  UseGuards,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { EntityService } from './entity.service';
import { CreateEntityDto } from './dto/entity.dto';
import { GetAllEntityQueryDto } from './dto/get-all-entity-query.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { Entity } from './schema/entity.schema';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Entity')
@ApiCookieAuth()
@Controller('entity')
export class EntityController {
  constructor(private readonly entityService: EntityService) { }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new entity' })
  @ApiResponse({ status: 201, description: 'Entity created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(
    @Body() body: CreateEntityDto,
    @Req() req: AuthRequest,
  ): Promise<Entity> {
    return this.entityService.create(body, req);
  }

  @Get('get-all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all entities with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of entities' })
  async getAll(
    @Req() req: AuthRequest,
    @Query() query: GetAllEntityQueryDto,
  ): Promise<{
    data: Entity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.entityService.getAll(
      req,
      query.page,
      query.limit,
      query.business_associate,
      query.search,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update an entity by entity_id' })
  @ApiResponse({ status: 200, description: 'Entity updated successfully' })
  @ApiResponse({ status: 400, description: 'Entity not found' })
  async update(
    @Param('id') id: string,
    @Body() body: CreateEntityDto,
    @Req() req: AuthRequest,
  ) {
    return this.entityService.update(id, body, req);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get entity by entity_id' })
  @ApiResponse({ status: 200, description: 'Entity found' })
  @ApiResponse({ status: 400, description: 'Entity not found' })
  async getById(@Param('id') id: string): Promise<Entity> {
    return this.entityService.getById(id);
  }
}
