import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApplicationService } from './application.service';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Req() req: AuthRequest,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.applicationService.findAll(req, +page, +limit);
  }
}
