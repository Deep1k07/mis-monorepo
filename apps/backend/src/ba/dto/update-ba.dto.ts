import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsNumber,
  MinLength,
  ValidateNested,
  IsArray,
  IsNotEmpty,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

class AddressDto {
  @ApiPropertyOptional() @IsOptional() @IsString() street?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() state?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() country?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() postal_code?: string;
}

const stripLeadingZeros = ({ value }: { value: any }) =>
  typeof value === 'string' ? String(parseInt(value, 10) || 0) : value;

class RateCardDto {
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5) @Transform(stripLeadingZeros) initial?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5) @Transform(stripLeadingZeros) annual?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5) @Transform(stripLeadingZeros) recertification?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() endDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() comments?: string;
}

class StandardDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() code?: string;
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
  @ApiPropertyOptional() @IsOptional() @IsString() cabCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cbCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() abCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;

  @ApiPropertyOptional({ type: [StandardDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StandardDto)
  standards?: StandardDto[];
}

export class UpdateBaDto {
  // ── User fields ──
  @ApiPropertyOptional() @IsOptional() @IsString() username?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(6) password?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;

  // ── CabBA fields ──
  @ApiPropertyOptional() @IsOptional() @IsString() contact_name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() registration_authority?: string;
  @ApiPropertyOptional() @IsString() @MinLength(5) @MaxLength(20) @Matches(/^\S+$/, { message: 'Registration number must not contain spaces' }) registration_number?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() registration_date?: string;
  @ApiPropertyOptional() @IsOptional() @ValidateNested() @Type(() => AddressDto) address?: AddressDto;
  @ApiPropertyOptional() @IsOptional() @IsString() currency?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() gst?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() certificateLanguage?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() otherCertificateLanguage?: string;

  @ApiPropertyOptional({ type: [CbDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CbDto)
  cab?: CbDto[];

  @ApiPropertyOptional() @IsOptional() @IsString() website?: string;
}
