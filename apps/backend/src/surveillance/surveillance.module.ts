import { Module } from '@nestjs/common';
import { SurveillanceController } from './surveillance.controller';
import { SurveillanceService } from './surveillance.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SurveillanceOne, SurveillanceOneSchema } from './schema/surveillanceOne.schema';
import { SurveillanceTwo, SurveillanceTwoSchema } from './schema/surveillanceTwo.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SurveillanceOne.name, schema: SurveillanceOneSchema },
      { name: SurveillanceTwo.name, schema: SurveillanceTwoSchema },
    ]),
    AuthModule,
  ],
  controllers: [SurveillanceController],
  providers: [SurveillanceService],
})
export class SurveillanceModule {}
