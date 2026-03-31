import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CertificationBody,
  CertificationBodySchema,
} from './schema/certificationBody.schema';
import { CetificationbodyService } from './certificationbody.service';
import {
  CertificationStandard,
  CertificationStandardSchema,
} from './schema/certificationStandards.schema';
import { CertificationbodyController } from './certificationbody.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CertificationBody.name, schema: CertificationBodySchema },
      { name: CertificationStandard.name, schema: CertificationStandardSchema },
    ]),
    AuthModule,
  ],
  providers: [CetificationbodyService],
  controllers: [CertificationbodyController],
})
export class CertificationbodyModule {}
