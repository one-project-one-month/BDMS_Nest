import { IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsFutureDate } from 'src/common/decorators/is-future-date.decorator';

export class UpdateExpiryDto {
  @ApiProperty({
    example: '2026-12-31T23:59:59Z',
    description: 'New expiry date for the announcement (must be a future date)',
  })
  @IsDateString()
  @IsNotEmpty()
  @IsFutureDate()
  expired_at: string;
}
