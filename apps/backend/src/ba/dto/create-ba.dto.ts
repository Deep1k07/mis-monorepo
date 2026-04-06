import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsNotEmpty,
  MinLength,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @ApiProperty() @IsString() @IsNotEmpty() street: string;
  @ApiProperty() @IsString() @IsNotEmpty() city: string;
  @ApiProperty() @IsString() @IsNotEmpty() state: string;
  @ApiProperty() @IsString() @IsNotEmpty() country: string;
  @ApiProperty() @IsString() @IsNotEmpty() postal_code: string;
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
  @ApiProperty() @IsString() @IsNotEmpty() otherCertificateLanguage: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() cab?: any[];
  @ApiPropertyOptional() @IsOptional() @IsString() website?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
}
