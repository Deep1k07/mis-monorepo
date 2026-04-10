import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CertificateService } from './certificate.service';
import {
  Application,
  ApplicationSchema,
} from '../application/schema/application.schema';
import { Entity, EntitySchema } from '../entity/schema/entity.schema';
import { CertificateEventListener } from './certificate.listener';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Application.name, schema: ApplicationSchema },
      { name: Entity.name, schema: EntitySchema },
    ]),
  ],
  providers: [CertificateService, CertificateEventListener],
  exports: [CertificateService],
})
export class CertificateModule {}
