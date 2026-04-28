import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BloodGroup } from '@prisma/client';

export class CreateDonationDto {
  @ApiPropertyOptional({
    description:
      'Donor ID — required for ADMIN/STAFF; resolved automatically for USER role',
    example: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  donor_id?: string;

  @ApiPropertyOptional({
    description: 'Blood request this donation fulfills',
    example: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  blood_request_id?: string;

  @ApiProperty({ enum: BloodGroup, example: BloodGroup.O_POS })
  @IsEnum(BloodGroup)
  @IsNotEmpty()
  blood_group: BloodGroup;

  @ApiPropertyOptional({ example: 1, description: 'Units donated' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  units_donated?: number;

  @ApiProperty({
    example: '2026-04-27T08:00:00Z',
    description: 'Date of donation',
  })
  @IsDateString()
  @IsNotEmpty()
  donation_date: string;

  @ApiPropertyOptional({ example: 'First-time donor' })
  @IsOptional()
  @IsString()
  remarks?: string;
}
