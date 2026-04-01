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
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { CetificationbodyService } from './certificationbody.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { CreateCabDto } from './dto/create-cab.dto';
import { CreateStandardDto } from './dto/create-standard.dto';
import { CertificationBody } from './schema/certificationBody.schema';
import { CertificationStandard } from './schema/certificationStandards.schema';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Certification Body')
@ApiCookieAuth()
@Controller('certificationbody')
export class CertificationbodyController {
  constructor(
    private readonly certificationbodyService: CetificationbodyService,
  ) {}

  // ─── CAB Endpoints ───

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new certification body (CAB)' })
  @ApiResponse({ status: 201, description: 'CAB created successfully' })
  @ApiResponse({ status: 400, description: 'CAB with this code already exists' })
  async createCab(
    @Body() body: CreateCabDto,
    @Req() req: AuthRequest,
  ): Promise<CertificationBody> {
    return this.certificationbodyService.createCab(body, req);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all CABs with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Paginated list of CABs' })
  async getAllCabs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ): Promise<{
    data: CertificationBody[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.certificationbodyService.getAllCabs(page, limit, search);
  }

  // ─── Standard Endpoints (must be before :id to avoid route conflict) ───

  @Post('standard')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new certification standard' })
  @ApiResponse({ status: 201, description: 'Standard created successfully' })
  @ApiResponse({ status: 400, description: 'Certification body not found' })
  async createStandard(
    @Body() body: CreateStandardDto,
    @Req() req: AuthRequest,
  ): Promise<CertificationStandard> {
    return this.certificationbodyService.createStandard(body, req);
  }

  @Get('standard/all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all standards with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'certificationBody', required: false, type: String, description: 'Filter by certification body ID' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Paginated list of standards' })
  async getAllStandards(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('certificationBody') certificationBody?: string,
    @Query('search') search?: string,
  ): Promise<{
    data: CertificationStandard[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.certificationbodyService.getAllStandards(
      page,
      limit,
      certificationBody,
      search,
    );
  }

  @Get('standard/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get standard by ID' })
  @ApiResponse({ status: 200, description: 'Standard found' })
  @ApiResponse({ status: 400, description: 'Standard not found' })
  async getStandardById(
    @Param('id') id: string,
  ): Promise<CertificationStandard> {
    return this.certificationbodyService.getStandardById(id);
  }

  @Patch('standard/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update standard by ID' })
  @ApiResponse({ status: 200, description: 'Standard updated' })
  @ApiResponse({ status: 400, description: 'Standard not found' })
  async updateStandard(
    @Param('id') id: string,
    @Body() body: CreateStandardDto,
    @Req() req: AuthRequest,
  ) {
    return this.certificationbodyService.updateStandard(id, body, req);
  }

  // ─── CAB by ID (after standard routes) ───

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get CAB by ID' })
  @ApiResponse({ status: 200, description: 'CAB found' })
  @ApiResponse({ status: 400, description: 'Certification body not found' })
  async getCabById(@Param('id') id: string): Promise<CertificationBody> {
    return this.certificationbodyService.getCabById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update CAB by ID' })
  @ApiResponse({ status: 200, description: 'CAB updated' })
  @ApiResponse({ status: 400, description: 'Certification body not found' })
  async updateCab(
    @Param('id') id: string,
    @Body() body: CreateCabDto,
    @Req() req: AuthRequest,
  ) {
    return this.certificationbodyService.updateCab(id, body, req);
  }
}
