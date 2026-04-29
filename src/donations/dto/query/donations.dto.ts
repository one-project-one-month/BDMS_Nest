import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BloodGroup, DonationStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class DonationsQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: DonationStatus })
  @IsOptional()
  @IsEnum(DonationStatus)
  status?: DonationStatus;

  @ApiPropertyOptional({ enum: BloodGroup })
  @IsOptional()
  @IsEnum(BloodGroup)
  blood_group?: BloodGroup;

  @ApiPropertyOptional({ description: 'Filter by donor ID' })
  @IsOptional()
  @IsString()
  donor_id?: string;

  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Donation date from',
  })
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'Donation date to',
  })
  @IsOptional()
  @IsDateString()
  to_date?: string;

  @ApiPropertyOptional({
    default: false,
    description: 'Include soft-deleted records',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  with_deleted?: boolean = false;
}
