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
import { BaService } from './ba.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { GetAllBaQueryDto } from './dto/get-all-ba-query.dto';
import { CreateBaDto } from './dto/create-ba.dto';
import { UpdateBaDto } from './dto/update-ba.dto';
import { User } from './schema/ba.schema';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CabBA } from './schema/cabBa.schema';

@ApiTags('Business Associate')
@ApiCookieAuth()
@Controller('ba')
export class BaController {
  constructor(private readonly baService: BaService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a business associate' })
  @ApiResponse({ status: 201, description: 'Business associate created' })
  async create(
    @Req() req: AuthRequest,
    @Body() body: CreateBaDto,
  ) {
    return this.baService.create(req, body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a business associate' })
  @ApiResponse({ status: 200, description: 'Business associate updated' })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateBaDto,
  ) {
    return this.baService.update(id, body);
  }

  @Get('get-all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all business associates' })
  @ApiResponse({ status: 200, description: 'List of business associates' })
  async getAll(
    @Req() req: AuthRequest,
    @Query() query: GetAllBaQueryDto,
  ): Promise<User[]> {
    return this.baService.getAll(req, query.searchTerm ?? '');
  }

  @Get('get-all-paginated')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all business associates (paginated)' })
  @ApiResponse({ status: 200, description: 'Paginated list of business associates' })
  async getAllPaginated(
    @Req() req: AuthRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.baService.getAllPaginated(
      req,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
    );
  }

  @Get('get-all-cabBa')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all cab business associates' })
  @ApiResponse({ status: 200, description: 'List of cab business associates' })
  async getAllCabBa(): Promise<CabBA[]> {
    return this.baService.getAllCabBa();
  }
}
