import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Country, CountrySchema } from './schema/country.schema';
import { CountryService } from './country.service';
import { CountryController } from './country.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Country.name, schema: CountrySchema }]),
    AuthModule,
  ],
  providers: [CountryService],
  controllers: [CountryController],
})
export class CountryModule {}
