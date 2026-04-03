import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Application, ApplicationSchema } from './schema/application.schema';
import { AuthModule } from 'src/auth/auth.module';
import { Entity, EntitySchema } from 'src/entity/schema/entity.schema';
import { CertificationBody, CertificationBodySchema } from 'src/certificationbody/schema/certificationBody.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Application.name, schema: ApplicationSchema },
      { name: Entity.name, schema: EntitySchema },
      { name: CertificationBody.name, schema: CertificationBodySchema },
    ]),
    AuthModule,
  ],
  providers: [ApplicationService],
  controllers: [ApplicationController],
})
export class ApplicationModule { }
