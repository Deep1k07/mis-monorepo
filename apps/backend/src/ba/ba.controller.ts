import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { BaService } from './ba.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { User } from './schema/ba.schema';
import { ApiCookieAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Business Associate')
@ApiCookieAuth()
@Controller('ba')
export class BaController {
  constructor(private readonly baService: BaService) {}

  @Get('get-all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all business associates' })
  @ApiQuery({ name: 'searchTerm', required: false, type: String, description: 'Search by username or userId' })
  @ApiResponse({ status: 200, description: 'List of business associates' })
  async getAll(
    @Req() req: AuthRequest,
    @Query('searchTerm') searchTerm?: string,
  ): Promise<User[]> {
    return this.baService.getAll(req, searchTerm ?? '');
  }
}
