import { Controller, Get, UseGuards } from '@nestjs/common';
import { CountryService } from './country.service';
import { Country } from './schema/country.schema';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Country')
@ApiCookieAuth()
@Controller('country')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all countries' })
  @ApiResponse({ status: 200, description: 'List of all countries' })
  async findAll(): Promise<Country[]> {
    return this.countryService.findAll();
  }
}
