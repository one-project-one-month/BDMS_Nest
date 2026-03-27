import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsUUID,
} from 'class-validator';
import { BloodGroup, InventoryStatus } from '../../../prisma/generated/client';

export class CreateBloodInventoryDto {
  @IsUUID()
  donation_id: string;

  @IsUUID()
  hospital_id: string;

  @IsEnum(BloodGroup)
  blood_group: BloodGroup;

  @IsInt()
  @IsPositive()
  units: number;

  @IsDateString()
  collected_at: string;

  @IsDateString()
  expired_at: string;

  @IsOptional()
  @IsEnum(InventoryStatus)
  status?: InventoryStatus;

  @IsOptional()
  @IsUUID()
  blood_request_id?: string;
}
