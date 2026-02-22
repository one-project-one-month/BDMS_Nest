import { PartialType } from '@nestjs/mapped-types';
import { CreateBloodInventoryDto } from './create-blood-inventory.dto';

export class UpdateBloodInventoryDto extends PartialType(CreateBloodInventoryDto) {}
