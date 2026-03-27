import { IsUUID } from 'class-validator';

export class MarkUsedBloodInventoryDto {
  @IsUUID()
  blood_request_id: string;
}
