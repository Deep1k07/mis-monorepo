import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Country, CountrySchema } from './schema/country.schema';
import { CountryService } from './country.service';
import { CountryController } from './country.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Country.name, schema: CountrySchema },
        ]),
    ],
    providers: [CountryService],
    controllers: [CountryController],

})
export class CountryModule { }
