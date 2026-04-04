import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Permission } from './schema/permission.schema';
import { PaginatedQueryDto } from 'src/common/dto/paginated-query.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@ApiTags('Permission')
@ApiCookieAuth()
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all permissions (unpaginated)' })
  @ApiResponse({ status: 200, description: 'List of all permissions' })
  async getAllPermissions(@Req() req: AuthRequest): Promise<Permission[]> {
    return this.permissionService.getAllPermissions(req);
  }

  @Get('get-all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all permissions with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of permissions' })
  async getAll(@Req() req: AuthRequest, @Query() query: PaginatedQueryDto) {
    return this.permissionService.getAll(req, query.page, query.limit, query.search);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully' })
  @ApiResponse({ status: 400, description: 'Permission already exists' })
  async create(@Req() req: AuthRequest, @Body() body: CreatePermissionDto) {
    return this.permissionService.create(req, body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a permission by ID' })
  @ApiResponse({ status: 200, description: 'Permission updated successfully' })
  @ApiResponse({ status: 400, description: 'Permission not found' })
  async update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() body: CreatePermissionDto,
  ) {
    return this.permissionService.update(req, id, body);
  }
}
