import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { BloodType, Role } from 'prisma/generated/enums';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @IsNotEmpty()
  @IsString()
  user_name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsEnum(BloodType)
  blood_type?: BloodType;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
