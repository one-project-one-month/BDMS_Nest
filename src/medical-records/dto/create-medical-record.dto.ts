import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
} from '../../../prisma/generated/client';

export class CreateMedicalRecordDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsNotEmpty()
  @IsUUID()
  donation_id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
  @IsNotEmpty()
  @IsUUID()
  hospital_id: string;

  @ApiProperty({ example: 12.5, minimum: 8.0, maximum: 20.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(8.0)
  @Max(20.0)
  hemoglobin_level: number;

  @ApiProperty({ enum: TestResult, example: TestResult.negative })
  @IsNotEmpty()
  @IsEnum(TestResult)
  hiv_result: TestResult;

  @ApiProperty({ enum: TestResult, example: TestResult.negative })
  @IsNotEmpty()
  @IsEnum(TestResult)
  hepatitis_b_result: TestResult;

  @ApiProperty({ enum: TestResult, example: TestResult.negative })
  @IsNotEmpty()
  @IsEnum(TestResult)
  hepatitis_c_result: TestResult;

  @ApiProperty({ enum: TestResult, example: TestResult.negative })
  @IsNotEmpty()
  @IsEnum(TestResult)
  malaria_result: TestResult;

  @ApiProperty({ enum: TestResult, example: TestResult.negative })
  @IsNotEmpty()
  @IsEnum(TestResult)
  syphilis_result: TestResult;

  @ApiProperty({ enum: BloodGroup, example: BloodGroup.A_POS })
  @IsNotEmpty()
  @IsEnum(BloodGroup)
  blood_group: BloodGroup;

  @ApiPropertyOptional({ example: 'All tests negative' })
  @IsOptional()
  @IsString()
  screening_notes?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174003' })
  @IsNotEmpty()
  @IsUUID()
  screened_by: string;

  @ApiProperty({ example: '2024-03-21T10:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  screening_at: string;
}

// Re-export for convenience
export { TestResult, ScreeningStatus, BloodGroup };
