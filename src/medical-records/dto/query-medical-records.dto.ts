import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ScreeningStatus } from '../../../prisma/generated/client';

export class QueryMedicalRecordsDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: ScreeningStatus,
    example: ScreeningStatus.pending,
  })
  @IsOptional()
  @IsEnum(ScreeningStatus)
  status?: ScreeningStatus;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174002' })
  @IsOptional()
  @IsUUID()
  hospital_id?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsOptional()
  @IsUUID()
  donation_id?: string;
}
