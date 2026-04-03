import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCertificateDto {
  @ApiProperty({
    description: 'Donor id used to generate the certificate',
    example: '4f405670-aae0-4f98-943f-30d4acf92f69',
  })
  @IsUUID()
  donor_id: string;

  @ApiPropertyOptional({
    description: 'Optional custom certificate title',
    example: 'Donation Certificate',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  certificate_title?: string;

  @ApiPropertyOptional({
    description: 'Optional custom certificate description',
    example: 'Certificate for blood donor',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  certificate_description?: string;
}
