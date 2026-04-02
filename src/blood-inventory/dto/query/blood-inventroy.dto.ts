import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  BloodGroup,
  InventoryStatus,
} from '../../../../prisma/generated/client';
import { IsBooleanString, IsEnum, IsOptional, IsUUID } from 'class-validator';

export class BloodInventoryQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by hospital id',
    example: '86055095-bebf-4945-8df6-79e61518f4d2',
  })
  @IsOptional()
  @IsUUID()
  hospital_id?: string;

  @ApiPropertyOptional({ enum: BloodGroup })
  @IsOptional()
  @IsEnum(BloodGroup)
  blood_group?: BloodGroup;

  @ApiPropertyOptional({ enum: InventoryStatus })
  @IsOptional()
  @IsEnum(InventoryStatus)
  status?: InventoryStatus;

  @ApiPropertyOptional({
    description: 'Set true to include soft-deleted records',
    example: 'false',
  })
  @IsOptional()
  @IsBooleanString()
  with_deleted?: string;
}
