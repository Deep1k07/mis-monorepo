import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PaginatedQueryDto } from 'src/common/dto/paginated-query.dto';
import { Application } from './schema/application.schema';
import { CreateApplicationDto, UpdateApplicationDto } from './dto/application.dto';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Application')
@ApiCookieAuth()
@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new application' })
  @ApiResponse({ status: 201, description: 'Application created' })
  async create(
    @Req() req: AuthRequest,
    @Body() body: CreateApplicationDto,
  ) {
    return this.applicationService.create(body, req);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all applications with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of applications' })
  async findAll(
    @Req() req: AuthRequest,
    @Query() query: PaginatedQueryDto,
  ): Promise<{
    data: Application[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.applicationService.findAll(
      req,
      query.page,
      query.limit,
      query.search,
      query.cabCode,
    );
  }

  @Get('draft')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get draft applications for scope review' })
  @ApiResponse({ status: 200, description: 'Paginated list of draft applications' })
  async findDraft(
    @Req() req: AuthRequest,
    @Query() query: PaginatedQueryDto,
  ): Promise<{
    data: Application[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.applicationService.findDraft(
      req,
      query.page,
      query.limit,
      query.search,
      query.scopeStatus,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiResponse({ status: 200, description: 'Application found' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async findById(@Param('id') id: string): Promise<Application> {
    return this.applicationService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update application by ID' })
  @ApiResponse({ status: 200, description: 'Application updated' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() body: UpdateApplicationDto,
  ): Promise<Application> {
    return this.applicationService.update(req, id, body);
  }
}
