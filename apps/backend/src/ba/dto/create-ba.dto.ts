import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  MinLength,
  ValidateNested,
  IsArray,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @ApiProperty() @IsString() @IsNotEmpty() street: string;
  @ApiProperty() @IsString() @IsNotEmpty() city: string;
  @ApiProperty() @IsString() @IsNotEmpty() state: string;
  @ApiProperty() @IsString() @IsNotEmpty() country: string;
  @ApiProperty() @IsString() @IsNotEmpty() postal_code: string;
}

class RateCardDto {
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5) initial?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5) annual?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5) recertification?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() endDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() comments?: string;
}

class StandardDto {
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiProperty() @IsString() @IsNotEmpty() code: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() version?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;

  @ApiPropertyOptional({ type: [RateCardDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RateCardDto)
  rateCard?: RateCardDto[];
}

class CbDto {
  @ApiProperty() @IsString() @IsNotEmpty() cabCode: string;
  @ApiProperty() @IsString() @IsNotEmpty() cbCode: string;
  @ApiProperty() @IsString() @IsNotEmpty() abCode: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;

  @ApiPropertyOptional({ type: [StandardDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StandardDto)
  standards?: StandardDto[];
}

export class CreateBaDto {
  // ── User fields ──
  @ApiProperty() @IsString() @MinLength(1) username: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(6) password: string;
  @ApiProperty() @IsString() @IsNotEmpty() phone: string;

  // ── CabBA fields ──
  @ApiProperty() @IsString() @MinLength(1) contact_name: string;
  @ApiProperty() @IsString() @MinLength(1) registration_authority: string;
  @ApiProperty() @IsString() @MinLength(1) registration_number: string;
  @ApiProperty() @IsString() @IsNotEmpty() registration_date: string;
  @ApiProperty() @ValidateNested() @Type(() => AddressDto) address: AddressDto;
  @ApiProperty() @IsString() @IsNotEmpty() currency: string;
  @ApiProperty() @IsString() @IsNotEmpty() gst: string;
  @ApiProperty() @IsString() @IsNotEmpty() certificateLanguage: string;
  @ApiProperty() @IsString() @IsOptional() otherCertificateLanguage: string;

  @ApiPropertyOptional({ type: [CbDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CbDto)
  cab?: CbDto[];

  @ApiPropertyOptional() @IsOptional() @IsString() website?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
}
