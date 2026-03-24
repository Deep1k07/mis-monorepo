import { Controller, Get } from '@nestjs/common';
import { CountryService } from './country.service';
import { Country } from './schema/country.schema';

@Controller('country')
export class CountryController {
    constructor(private readonly countryService: CountryService) { }

    @Get()
    async findAll(): Promise<Country[]> {
        return this.countryService.findAll();
    }
}
