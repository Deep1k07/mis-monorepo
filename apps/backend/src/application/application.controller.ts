import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { Application } from './schema/application.schema';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('application')
export class ApplicationController {
    constructor(private readonly applicationService: ApplicationService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(@Req() req: AuthRequest): Promise<Application[]> {
        return this.applicationService.findAll(req);
    }
}
