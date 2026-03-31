import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsMongoId,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateCabDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  cabCode: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(5)
  cbCode: string;

  @IsNotEmpty()
  @IsString()
  cbName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  abCode: string;

  @IsNotEmpty()
  @IsString()
  abName: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  cabJurisdictions?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  standards?: string[];
}
