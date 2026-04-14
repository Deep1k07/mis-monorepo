import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CertificateService } from './certificate.service';
import {
  Application,
  ApplicationSchema,
} from '../application/schema/application.schema';
import { Entity, EntitySchema } from '../entity/schema/entity.schema';
import {
  CertificationStandard,
  CertificationStandardSchema,
} from '../certificationbody/schema/certificationStandards.schema';
import { CertificateEventListener } from './certificate.listener';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Application.name, schema: ApplicationSchema },
      { name: Entity.name, schema: EntitySchema },
      { name: CertificationStandard.name, schema: CertificationStandardSchema },
    ]),
  ],
  providers: [CertificateService, CertificateEventListener],
  exports: [CertificateService],
})
export class CertificateModule {}
