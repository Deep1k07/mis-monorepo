import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  MinLength,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @ApiPropertyOptional() @IsOptional() @IsString() street?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() state?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() country?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() postal_code?: string;
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
  @ApiPropertyOptional() @IsOptional() @IsString() registration_number?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() registration_date?: string;
  @ApiPropertyOptional() @IsOptional() @ValidateNested() @Type(() => AddressDto) address?: AddressDto;
  @ApiPropertyOptional() @IsOptional() @IsString() currency?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() gst?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() certificateLanguage?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() otherCertificateLanguage?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() cab?: any[];
  @ApiPropertyOptional() @IsOptional() @IsString() website?: string;
}
