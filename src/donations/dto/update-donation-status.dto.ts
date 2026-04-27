import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DonationStatus } from '@prisma/client';

export class UpdateDonationStatusDto {
  @ApiProperty({
    enum: DonationStatus,
    example: DonationStatus.screening,
    description: 'New status for the donation',
  })
  @IsEnum(DonationStatus)
  @IsNotEmpty()
  status: DonationStatus;

  @ApiPropertyOptional({
    example: 1,
    description: 'Units donated (set during approval)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  units_donated?: number;

  @ApiPropertyOptional({ example: 'Passed all screening checks' })
  @IsOptional()
  @IsString()
  remarks?: string;
}
