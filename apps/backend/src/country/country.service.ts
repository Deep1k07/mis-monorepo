import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Country, CountryDocument } from './schema/country.schema';
import { Model } from 'mongoose';

@Injectable()
export class CountryService {
  constructor(
    @InjectModel(Country.name)
    private countryModel: Model<CountryDocument>,
  ) {}

  async findAll(): Promise<Country[]> {
    return this.countryModel.find().exec();
  }
}
