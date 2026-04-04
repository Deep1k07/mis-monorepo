import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+91 9876543210' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Role ID' })
  @IsString()
  role: string;

  @ApiPropertyOptional({ description: 'Reporting Manager user ID' })
  @IsString()
  @IsOptional()
  reportingManager?: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'pending', 'rejected', 'suspended'] })
  @IsString()
  @IsOptional()
  status?: string;
}
