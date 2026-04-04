import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserRole } from './schema/role.schema';
import { PaginatedQueryDto } from 'src/common/dto/paginated-query.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Role')
@ApiCookieAuth()
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all roles (unpaginated)' })
  @ApiResponse({ status: 200, description: 'List of all roles' })
  async getAllRoles(): Promise<UserRole[]> {
    return this.roleService.getAllRoles();
  }

  @Get('get-all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all roles with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of roles' })
  async getAll(@Query() query: PaginatedQueryDto) {
    return this.roleService.getAll(query.page, query.limit, query.search);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiResponse({ status: 400, description: 'Role already exists' })
  async create(
    @Body() body: CreateRoleDto,
    @Req() req: AuthRequest,
  ) {
    return this.roleService.create(body, req);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a role by ID' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 400, description: 'Role not found' })
  async update(
    @Param('id') id: string,
    @Body() body: CreateRoleDto,
  ) {
    return this.roleService.update(id, body);
  }
}
