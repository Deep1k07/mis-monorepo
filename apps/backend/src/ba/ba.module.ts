import { Module } from '@nestjs/common';
import { BaService } from './ba.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/ba.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [BaService],
})
export class BaModule { }
