import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  ValidateNested,
  IsArray,
  IsMongoId,
  IsBoolean,
  Matches,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { cleanString } from 'src/utils/cleanString';

// 🔹 Main Site Address DTO
class MainSiteAddressDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => cleanString(value))
  street: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Transform(({ value }) => cleanString(value))
  city: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Transform(({ value }) => cleanString(value))
  state: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Z]{3}$/, {
    message: 'Country must be a 3-letter uppercase code (e.g., IND, USA)',
  })
  country: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  @Transform(({ value }) => value.trim())
  postal_code: string;
}

// 🔹 Additional Site Address DTO
class AdditionalSiteAddressDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => cleanString(value))
  street: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => cleanString(value))
  city: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => cleanString(value))
  state: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Z]{3}$/, {
    message: 'Country must be a 3-letter uppercase code (e.g., IND, USA)',
  })
  country: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  postal_code: string;

  @IsOptional()
  @IsString()
  legal_entity_management: string;

  @IsOptional()
  @IsString()
  site_type: string;

  @IsOptional()
  @IsString()
  site_category: string;
}

export class CreateEntityDto {
  @IsOptional()
  @IsString()
  entity_id: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => cleanString(value))
  entity_name: string;

  @IsMongoId()
  @IsOptional()
  business_associate: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => cleanString(value))
  entity_name_english: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => cleanString(value))
  entity_trading_name: string;

  // ✅ main_site_address (array)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MainSiteAddressDto)
  main_site_address: MainSiteAddressDto[];

  // ✅ additional_site_address (array)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdditionalSiteAddressDto)
  additional_site_address?: AdditionalSiteAddressDto[];

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  drive_link?: string;

  @IsOptional()
  @IsString()
  name_slug: string;

  @IsOptional()
  @IsBoolean()
  isDirectClient: boolean;

  @IsOptional()
  // @IsString()
  direct_price: number;

  @IsOptional()
  @IsString()
  email_cab_code: string;

  @IsOptional()
  @IsString()
  by_pass: string;

  @IsOptional()
  @IsString()
  isEntityEmailVerifiedStatus: string;
}
