import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateStandardDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  mssCode: string;

  @IsNotEmpty()
  @IsString()
  schemeName: string;

  @IsNotEmpty()
  @IsString()
  standardCode: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsNotEmpty()
  @IsMongoId()
  certificationBody: string;
}
