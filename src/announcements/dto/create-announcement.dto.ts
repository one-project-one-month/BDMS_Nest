import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsFutureDate } from 'src/common/decorators/is-future-date.decorator';

export class CreateAnnouncementDto {
  @ApiProperty({
    example: 'Blood Drive Event',
    description: 'Title of the announcement',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'We are hosting a blood drive on 1st May. All donors welcome!',
    description: 'Full content of the announcement',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the announcement is currently active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;

  @ApiPropertyOptional({
    example: '2026-06-01T00:00:00Z',
    description: 'Expiry date of the announcement (must be a future date)',
  })
  @IsOptional()
  @IsDateString()
  @IsFutureDate()
  expired_at?: string;
}
