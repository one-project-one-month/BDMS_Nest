import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { BloodGroup, Gender } from '@prisma/client';

export class CreateDonorDto {
  @ApiPropertyOptional({
    description: 'Required for ADMIN/STAFF; resolved from JWT for USER',
    example: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiProperty({ example: '12/ABC(N)123456' })
  @IsNotEmpty()
  @IsString()
  nrc_no: string;

  @ApiProperty({ example: '1995-06-15T00:00:00Z' })
  @IsNotEmpty()
  @IsDateString()
  date_of_birth: string;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ enum: BloodGroup, example: BloodGroup.O_POS })
  @IsNotEmpty()
  @IsEnum(BloodGroup)
  blood_group: BloodGroup;

  @ApiProperty({ example: 65.5, description: 'Weight in kg' })
  @IsNotEmpty()
  @IsNumber()
  @Min(50)
  @Max(200)
  weight: number;

  @ApiPropertyOptional({ example: 'No known conditions' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({ example: 'Jane Doe' })
  @IsNotEmpty()
  @IsString()
  emergency_contact: string;

  @ApiProperty({ example: '+959123456789' })
  @IsNotEmpty()
  @IsString()
  emergency_phone: string;

  @ApiProperty({ example: 'No. 123, Main Street, Yangon' })
  @IsNotEmpty()
  @IsString()
  address: string;
}
