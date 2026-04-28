import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { CreateBloodInventoryDto } from './create-blood-inventory.dto';

export class UpdateBloodInventoryDto extends PartialType(
  CreateBloodInventoryDto,
) {}

export class UseFromInventoryDto {
  @ApiProperty({
    description: 'Blood inventory id to mark as used',
    example: '0229ea64-3ca2-41dd-8239-8fc51cf27408',
  })
  @IsUUID()
  inventory_id: string;

  @ApiProperty({
    description: 'Blood request id that consumes this inventory unit',
    example: 'f0dbef44-dcec-4783-ae58-555dcf4ee8ac',
  })
  @IsUUID()
  request_id: string;
}
