import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PaginatedQueryDto } from 'src/common/dto/paginated-query.dto';
import { Application } from './schema/application.schema';
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
  constructor(private readonly applicationService: ApplicationService) {}

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
    @Param('id') id: string,
    @Body() body: Partial<Application>,
  ): Promise<Application> {
    return this.applicationService.update(id, body);
  }
}
