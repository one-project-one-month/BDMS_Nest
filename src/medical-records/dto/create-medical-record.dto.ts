import {
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsEnum,
  IsString,
  IsOptional,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import {
  TestResult,
  ScreeningStatus,
  BloodGroup,
} from '../../../prisma/generated/enums';

export class CreateMedicalRecordDto {
  @IsNotEmpty()
  @IsUUID()
  donation_id: string;

  @IsNotEmpty()
  @IsUUID()
  hospital_id: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(8.0)
  @Max(20.0)
  hemoglobin_level: number;

  @IsNotEmpty()
  @IsEnum(TestResult)
  hiv_result: TestResult;

  @IsNotEmpty()
  @IsEnum(TestResult)
  hepatitis_b_result: TestResult;

  @IsNotEmpty()
  @IsEnum(TestResult)
  hepatitis_c_result: TestResult;

  @IsNotEmpty()
  @IsEnum(TestResult)
  malaria_result: TestResult;

  @IsNotEmpty()
  @IsEnum(TestResult)
  syphilis_result: TestResult;

  @IsNotEmpty()
  @IsEnum(BloodGroup)
  blood_group: BloodGroup;

  @IsOptional()
  @IsString()
  screening_notes?: string;

  @IsNotEmpty()
  @IsUUID()
  screened_by: string;

  @IsNotEmpty()
  @IsDateString()
  screening_at: string;
}

// Re-export for convenience
export { TestResult, ScreeningStatus, BloodGroup };
