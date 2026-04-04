import {
  IsArray,
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

  @IsNotEmpty()
  @IsString()
  version: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsMongoId()
  predecessor?: string;

  @IsOptional()
  @IsMongoId()
  successor?: string;

  @IsArray()
  @IsMongoId({ each: true })
  certificationBodies: string[];
}
