import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsPositive } from 'class-validator';
import { InventoryStatus } from '../../../../prisma/generated/client';

export class BloodInventoryQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(InventoryStatus)
  status?: InventoryStatus;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  per_page?: number;
}
