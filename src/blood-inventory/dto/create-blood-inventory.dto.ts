import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateBloodInventoryDto {
  @ApiProperty({
    description: 'Donation id to convert into an inventory record',
    example: '6c89ea39-7673-4e0e-9188-742d58a60550',
  })
  @IsUUID()
  donation_id: string;
}
