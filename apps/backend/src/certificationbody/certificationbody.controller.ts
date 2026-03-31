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

@Controller('certificationbody')
export class CertificationbodyController {
  constructor(
    private readonly certificationbodyService: CetificationbodyService,
  ) {}

  // ─── CAB Endpoints ───

  @Post()
  @UseGuards(JwtAuthGuard)
  async createCab(@Body() body: CreateCabDto, @Req() req: AuthRequest) {
    return this.certificationbodyService.createCab(body, req);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllCabs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.certificationbodyService.getAllCabs(page, limit);
  }

  // ─── Standard Endpoints (must be before :id to avoid route conflict) ───

  @Post('standard')
  @UseGuards(JwtAuthGuard)
  async createStandard(
    @Body() body: CreateStandardDto,
    @Req() req: AuthRequest,
  ) {
    return this.certificationbodyService.createStandard(body, req);
  }

  @Get('standard/all')
  @UseGuards(JwtAuthGuard)
  async getAllStandards(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('certificationBody') certificationBody?: string,
  ) {
    return this.certificationbodyService.getAllStandards(
      page,
      limit,
      certificationBody,
    );
  }

  @Get('standard/:id')
  @UseGuards(JwtAuthGuard)
  async getStandardById(@Param('id') id: string) {
    return this.certificationbodyService.getStandardById(id);
  }

  @Patch('standard/:id')
  @UseGuards(JwtAuthGuard)
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
  async getCabById(@Param('id') id: string) {
    return this.certificationbodyService.getCabById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateCab(
    @Param('id') id: string,
    @Body() body: CreateCabDto,
    @Req() req: AuthRequest,
  ) {
    return this.certificationbodyService.updateCab(id, body, req);
  }
}
