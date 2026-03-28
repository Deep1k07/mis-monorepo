import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { BaService } from './ba.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@Controller('ba')
export class BaController {
  constructor(private readonly baService: BaService) {}

  @Get('get-all')
  @UseGuards(JwtAuthGuard)
  async getAll(@Req() req: AuthRequest) {
    const { searchTerm } = req.query;
    return this.baService.getAll(req, searchTerm as string);
  }
}
