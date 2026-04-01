import { ApiProperty } from '@nestjs/swagger';
import {
  TestResult,
  ScreeningStatus,
  BloodGroup,
} from '../../../prisma/generated/client';

export class MedicalRecordEntity {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  donation_id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
  hospital_id: string;

  @ApiProperty({ example: 12.5 })
  hemoglobin_level: number;

  @ApiProperty({ enum: TestResult, example: TestResult.negative })
  hiv_result: TestResult;

  @ApiProperty({ enum: TestResult, example: TestResult.negative })
  hepatitis_b_result: TestResult;

  @ApiProperty({ enum: TestResult, example: TestResult.negative })
  hepatitis_c_result: TestResult;

  @ApiProperty({ enum: TestResult, example: TestResult.negative })
  malaria_result: TestResult;

  @ApiProperty({ enum: TestResult, example: TestResult.negative })
  syphilis_result: TestResult;

  @ApiProperty({ enum: BloodGroup, example: BloodGroup.A_POS })
  blood_group: BloodGroup;

  @ApiProperty({ enum: ScreeningStatus, example: ScreeningStatus.pending })
  screening_status: ScreeningStatus;

  @ApiProperty({
    example: 'All tests negative',
    required: false,
    nullable: true,
  })
  screening_notes: string | null;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174003' })
  screened_by: string;

  @ApiProperty({ example: '2024-03-21T10:00:00.000Z' })
  screening_at: Date;

  @ApiProperty({ example: '2024-03-21T08:00:00.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2024-03-21T10:00:00.000Z' })
  updated_at: Date;

  @ApiProperty({ example: null, required: false, nullable: true })
  deleted_at: Date | null;
}

class MedicalRecordPaginationMeta {
  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNextPage: boolean;
}

export class PaginatedMedicalRecordEntity {
  @ApiProperty({ type: [MedicalRecordEntity] })
  data: MedicalRecordEntity[];

  @ApiProperty({ type: MedicalRecordPaginationMeta })
  meta: MedicalRecordPaginationMeta;
}
