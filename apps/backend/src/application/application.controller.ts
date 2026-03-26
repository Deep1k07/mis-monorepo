import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { Application } from './schema/application.schema';

@Controller('application')
export class ApplicationController {
    constructor(private readonly applicationService: ApplicationService) { }

    @Get()
    async findAll(): Promise<Application[]> {
        return this.applicationService.findAll();
    }
}
