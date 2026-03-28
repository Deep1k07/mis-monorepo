import { Controller, Get, UseGuards } from '@nestjs/common';
import { CountryService } from './country.service';
import { Country } from './schema/country.schema';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('country')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Country[]> {
    return this.countryService.findAll();
  }
}
