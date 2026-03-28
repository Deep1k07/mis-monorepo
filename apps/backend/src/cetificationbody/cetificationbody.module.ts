import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CertificationBody, CertificationBodySchema } from './schema/certificationBody.schema';
import { CetificationbodyService } from './cetificationbody.service';
import { CertificationStandard, CertificationStandardSchema } from './schema/certificationStandards.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: CertificationBody.name, schema: CertificationBodySchema },
            { name: CertificationStandard.name, schema: CertificationStandardSchema },
        ]),
    ],
    providers: [CetificationbodyService],
})
export class CetificationbodyModule { }
