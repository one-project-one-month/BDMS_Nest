import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ScreeningStatus } from '../../../prisma/generated/enums';

export class QueryMedicalRecordsDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ScreeningStatus)
  status?: ScreeningStatus;

  @IsOptional()
  @IsUUID()
  hospital_id?: string;

  @IsOptional()
  @IsUUID()
  donation_id?: string;
}
