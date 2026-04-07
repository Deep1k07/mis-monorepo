import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Country, CountryDocument } from './schema/country.schema';
import { Model } from 'mongoose';

const LANGUAGES = [
  'English',
  'Hindi',
  'Spanish',
  'French',
  'Arabic',
  'Chinese',
  'Portuguese',
  'German',
  'Italian',
  'Japanese',
  'Korean',
  'Russian',
  'Turkish',
];

@Injectable()
export class CountryService {
  constructor(
    @InjectModel(Country.name)
    private countryModel: Model<CountryDocument>,
  ) {}

  async findAll(): Promise<Country[]> {
    return this.countryModel.find().exec();
  }

  getLanguages(): string[] {
    return LANGUAGES;
  }
}
