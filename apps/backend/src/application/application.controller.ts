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

@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Req() req: AuthRequest,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    return this.applicationService.findAll(req, +page, +limit, search);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findById(@Param('id') id: string) {
    return this.applicationService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() body: any) {
    return this.applicationService.update(id, body);
  }
}
