import { Controller, Get } from '@nestjs/common';
import { CetificationbodyService } from './certificationbody.service';

@Controller('certificationbody')
export class CertificationbodyController {
    constructor(private readonly certificationbodyService: CetificationbodyService) { }

    @Get()
    async getAllCertificationBodies() {
        return this.certificationbodyService.getAllCertificationBodies();
    }

    @Get('standards')
    async getAllStandards() {
        return this.certificationbodyService.getAllStandards();
    }
}
