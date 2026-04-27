import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { QueryMedicalRecordsDto } from './dto/query-medical-records.dto';
import { Prisma, ScreeningStatus, TestResult } from '@prisma/client';
import { paginate, paginatedResult } from '../common/helpers/paginate.helper';

@Injectable()
export class MedicalRecordsService {
  constructor(private prisma: DatabaseService) {}

  private readonly includeMedicalRecord: Prisma.MedicalRecordInclude = {
    donation: {
      include: {
        donor: {
          include: {
            user: {
              select: {
                user_name: true,
                email: true,
              },
            },
          },
        },
      },
    },
    hospital: {
      select: {
        id: true,
        name: true,
      },
    },
    screener: {
      select: {
        id: true,
        user_name: true,
        email: true,
      },
    },
  };

  async create(createMedicalRecordDto: CreateMedicalRecordDto) {
    // Check if donation exists
    const donation = await this.prisma.donation.findUnique({
      where: { id: createMedicalRecordDto.donation_id },
    });

    if (!donation) {
      throw new NotFoundException(
        `Donation with ID ${createMedicalRecordDto.donation_id} not found`,
      );
    }

    // Check if medical record already exists for this donation
    const existingRecord = await this.prisma.medicalRecord.findUnique({
      where: { donation_id: createMedicalRecordDto.donation_id },
    });

    if (existingRecord) {
      throw new ConflictException(
        `Medical record already exists for donation ${createMedicalRecordDto.donation_id}`,
      );
    }

    const result = await this.prisma.medicalRecord.create({
      data: {
        ...createMedicalRecordDto,
        screening_status: ScreeningStatus.pending,
      },
      include: this.includeMedicalRecord,
    });

    return {
      message: 'Medical record created successfully',
      data: result,
    };
  }

  async findAll(query: QueryMedicalRecordsDto, userHospitalId?: string) {
    const {
      page = 1,
      limit = 10,
      status,
      hospital_id,
      donation_id,
      search,
    } = query;
    const { skip, take } = paginate(page, limit);

    const where: Prisma.MedicalRecordWhereInput = {
      deleted_at: null,
    };

    // Hospital scoping - users can only see their hospital's records
    if (userHospitalId) {
      where.hospital_id = userHospitalId;
    }

    if (hospital_id) {
      where.hospital_id = hospital_id;
    }

    if (status) {
      where.screening_status = status;
    }

    if (donation_id) {
      where.donation_id = donation_id;
    }

    if (search) {
      where.screening_notes = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.medicalRecord.findMany({
        where,
        include: this.includeMedicalRecord,
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.medicalRecord.count({ where }),
    ]);

    return {
      message: 'Medical records fetched successfully',
      data: paginatedResult(data, total, page, limit),
    };
  }

  async findOne(id: string, userHospitalId?: string) {
    const record = await this.prisma.medicalRecord.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: this.includeMedicalRecord,
    });

    if (!record) {
      throw new NotFoundException(`Medical record with ID ${id} not found`);
    }

    // Hospital scoping check
    if (userHospitalId && record.hospital_id !== userHospitalId) {
      throw new ForbiddenException(
        'You do not have access to this medical record',
      );
    }

    return {
      message: 'Medical record fetched successfully',
      data: record,
    };
  }

  async update(
    id: string,
    updateMedicalRecordDto: UpdateMedicalRecordDto,
    userHospitalId?: string,
  ) {
    const { data: record } = await this.findOne(id, userHospitalId);

    const result = await this.prisma.medicalRecord.update({
      where: { id: record.id },
      data: updateMedicalRecordDto,
      include: this.includeMedicalRecord,
    });

    return {
      message: 'Medical record updated successfully',
      data: result,
    };
  }

  async approve(id: string, userHospitalId?: string) {
    const { data: record } = await this.findOne(id, userHospitalId);

    // Business rule: Cannot approve if any test is positive
    const hasPositiveTest =
      record.hiv_result === TestResult.positive ||
      record.hepatitis_b_result === TestResult.positive ||
      record.hepatitis_c_result === TestResult.positive ||
      record.malaria_result === TestResult.positive ||
      record.syphilis_result === TestResult.positive;

    if (hasPositiveTest) {
      throw new UnprocessableEntityException(
        'Cannot approve medical record with positive test results',
      );
    }

    const result = await this.prisma.medicalRecord.update({
      where: { id: record.id },
      data: { screening_status: ScreeningStatus.passed },
      include: this.includeMedicalRecord,
    });

    return {
      message: 'Medical record approved successfully',
      data: result,
    };
  }

  async reject(id: string, userHospitalId?: string) {
    const { data: record } = await this.findOne(id, userHospitalId);

    const result = await this.prisma.medicalRecord.update({
      where: { id: record.id },
      data: { screening_status: ScreeningStatus.failed },
      include: this.includeMedicalRecord,
    });

    return {
      message: 'Medical record rejected successfully',
      data: result,
    };
  }

  async remove(id: string, userHospitalId?: string) {
    const { data: record } = await this.findOne(id, userHospitalId);

    const result = await this.prisma.medicalRecord.update({
      where: { id: record.id },
      data: { deleted_at: new Date() },
      include: this.includeMedicalRecord,
    });

    return {
      message: 'Medical record deleted successfully',
      data: result,
    };
  }
}
