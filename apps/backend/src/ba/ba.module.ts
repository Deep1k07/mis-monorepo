import { Module } from '@nestjs/common';
import { BaService } from './ba.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/ba.schema';
import { BaController } from './ba.controller';
import { AuthModule } from 'src/auth/auth.module';
import { CabBA, CabBASchema } from './schema/cabBa.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: CabBA.name, schema: CabBASchema }]),
    AuthModule,
  ],
  providers: [BaService],
  controllers: [BaController],
})
export class BaModule { }
