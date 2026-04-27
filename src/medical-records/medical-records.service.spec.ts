import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { DatabaseService } from '../database/database.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { QueryMedicalRecordsDto } from './dto/query-medical-records.dto';
import { ScreeningStatus, TestResult, BloodGroup } from '@prisma/client';

describe('MedicalRecordsService', () => {
  let service: MedicalRecordsService;

  const mockDatabaseService = {
    medicalRecord: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    donation: {
      findUnique: jest.fn(),
    },
  };

  const mockMedicalRecord = {
    id: 'record-1',
    donation_id: 'donation-1',
    hospital_id: 'hospital-1',
    hemoglobin_level: 14.5,
    hiv_result: TestResult.negative,
    hepatitis_b_result: TestResult.negative,
    hepatitis_c_result: TestResult.negative,
    malaria_result: TestResult.negative,
    syphilis_result: TestResult.negative,
    blood_group: BloodGroup.A_POS,
    screening_status: ScreeningStatus.pending,
    screening_notes: null,
    screened_by: 'user-1',
    screening_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    donation: {
      id: 'donation-1',
      donor_id: 'donor-1',
      hospital_id: 'hospital-1',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalRecordsService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<MedicalRecordsService>(MedicalRecordsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateMedicalRecordDto = {
      donation_id: 'donation-1',
      hospital_id: 'hospital-1',
      hemoglobin_level: 14.5,
      hiv_result: TestResult.negative,
      hepatitis_b_result: TestResult.negative,
      hepatitis_c_result: TestResult.negative,
      malaria_result: TestResult.negative,
      syphilis_result: TestResult.negative,
      blood_group: BloodGroup.A_POS,
      screened_by: 'user-1',
      screening_at: '2024-01-01T00:00:00Z',
    };

    it('should create a medical record successfully', async () => {
      // Mock donation exists
      mockDatabaseService.donation.findUnique.mockResolvedValue({
        id: 'donation-1',
        donor_id: 'donor-1',
        hospital_id: 'hospital-1',
      });
      // Mock no existing medical record
      mockDatabaseService.medicalRecord.findFirst.mockResolvedValue(null);
      // Mock successful creation
      mockDatabaseService.medicalRecord.create.mockResolvedValue(
        mockMedicalRecord,
      );

      const result = await service.create(createDto);

      expect(result).toEqual(mockMedicalRecord);
      expect(mockDatabaseService.donation.findUnique).toHaveBeenCalledWith({
        where: { id: 'donation-1' },
      });
      expect(mockDatabaseService.medicalRecord.findUnique).toHaveBeenCalledWith(
        {
          where: { donation_id: 'donation-1' },
        },
      );
      expect(mockDatabaseService.medicalRecord.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          screening_status: ScreeningStatus.pending,
        },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if donation does not exist', async () => {
      mockDatabaseService.donation.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        `Donation with ID ${createDto.donation_id} not found`,
      );
    });

    it('should throw ConflictException if donation already has a medical record', async () => {
      mockDatabaseService.donation.findUnique.mockResolvedValue({
        id: 'donation-1',
      });
      // Use findUnique here because the create method checks with findUnique
      mockDatabaseService.medicalRecord.findUnique.mockResolvedValue(
        mockMedicalRecord,
      );

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        `Medical record already exists for donation ${createDto.donation_id}`,
      );
    });
  });

  describe('findAll', () => {
    const query: QueryMedicalRecordsDto = {
      page: 1,
      limit: 10,
    };

    it('should return paginated medical records', async () => {
      mockDatabaseService.medicalRecord.findMany.mockResolvedValue([
        mockMedicalRecord,
      ]);
      mockDatabaseService.medicalRecord.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(result).toEqual({
        data: [mockMedicalRecord],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
        },
      });
    });

    it('should filter by screening_status', async () => {
      const queryWithStatus = {
        ...query,
        status: ScreeningStatus.passed,
      };
      mockDatabaseService.medicalRecord.findMany.mockResolvedValue([
        mockMedicalRecord,
      ]);
      mockDatabaseService.medicalRecord.count.mockResolvedValue(1);

      await service.findAll(queryWithStatus);

      expect(mockDatabaseService.medicalRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            screening_status: ScreeningStatus.passed,
          }),
        }),
      );
    });

    it('should filter by hospital_id', async () => {
      const queryWithHospital = { ...query, hospital_id: 'hospital-1' };
      mockDatabaseService.medicalRecord.findMany.mockResolvedValue([
        mockMedicalRecord,
      ]);
      mockDatabaseService.medicalRecord.count.mockResolvedValue(1);

      await service.findAll(queryWithHospital, 'hospital-1');

      expect(mockDatabaseService.medicalRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            hospital_id: 'hospital-1',
          }),
        }),
      );
    });

    it('should search in screening_notes field', async () => {
      const queryWithSearch = { ...query, search: 'John' };
      mockDatabaseService.medicalRecord.findMany.mockResolvedValue([
        mockMedicalRecord,
      ]);
      mockDatabaseService.medicalRecord.count.mockResolvedValue(1);

      await service.findAll(queryWithSearch);

      expect(mockDatabaseService.medicalRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            screening_notes: {
              contains: 'John',
              mode: 'insensitive',
            },
          }),
        }),
      );
    });

    it('should apply hospital scoping when userHospitalId provided', async () => {
      mockDatabaseService.medicalRecord.findMany.mockResolvedValue([
        mockMedicalRecord,
      ]);
      mockDatabaseService.medicalRecord.count.mockResolvedValue(1);

      await service.findAll(query, 'hospital-1');

      expect(mockDatabaseService.medicalRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            hospital_id: 'hospital-1',
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a medical record by id', async () => {
      mockDatabaseService.medicalRecord.findFirst.mockResolvedValue(
        mockMedicalRecord,
      );

      const result = await service.findOne('record-1');

      expect(result).toEqual(mockMedicalRecord);
      expect(mockDatabaseService.medicalRecord.findFirst).toHaveBeenCalledWith({
        where: { id: 'record-1', deleted_at: null },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if record not found', async () => {
      mockDatabaseService.medicalRecord.findFirst.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent')).rejects.toThrow(
        'Medical record with ID non-existent not found',
      );
    });

    it('should throw ForbiddenException if hospital does not match', async () => {
      mockDatabaseService.medicalRecord.findFirst.mockResolvedValue(
        mockMedicalRecord,
      );

      await expect(service.findOne('record-1', 'hospital-2')).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.findOne('record-1', 'hospital-2')).rejects.toThrow(
        'You do not have access to this medical record',
      );
    });

    it('should allow access when hospital matches', async () => {
      mockDatabaseService.medicalRecord.findFirst.mockResolvedValue(
        mockMedicalRecord,
      );

      const result = await service.findOne('record-1', 'hospital-1');

      expect(result).toEqual(mockMedicalRecord);
    });
  });

  describe('update', () => {
    const updateDto: UpdateMedicalRecordDto = {
      hemoglobin_level: 15.0,
      screening_notes: 'Updated notes',
    };

    it('should update a medical record successfully', async () => {
      mockDatabaseService.medicalRecord.findFirst.mockResolvedValue(
        mockMedicalRecord,
      );
      const updatedRecord = { ...mockMedicalRecord, ...updateDto };
      mockDatabaseService.medicalRecord.update.mockResolvedValue(updatedRecord);

      const result = await service.update('record-1', updateDto);

      expect(result).toEqual(updatedRecord);
      expect(mockDatabaseService.medicalRecord.update).toHaveBeenCalledWith({
        where: { id: 'record-1' },
        data: updateDto,
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if record not found', async () => {
      mockDatabaseService.medicalRecord.findFirst.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if hospital does not match', async () => {
      mockDatabaseService.medicalRecord.findFirst.mockResolvedValue(
        mockMedicalRecord,
      );

      await expect(
        service.update('record-1', updateDto, 'hospital-2'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('approve', () => {
    it('should approve a medical record with all negative tests', async () => {
      mockDatabaseService.medicalRecord.findFirst.mockResolvedValue(
        mockMedicalRecord,
      );
      const approvedRecord = {
        ...mockMedicalRecord,
        screening_status: ScreeningStatus.passed,
      };
      mockDatabaseService.medicalRecord.update.mockResolvedValue(
        approvedRecord,
      );

      const result = await service.approve('record-1');

      expect(result).toEqual(approvedRecord);
      expect(mockDatabaseService.medicalRecord.update).toHaveBeenCalledWith({
        where: { id: 'record-1' },
        data: { screening_status: ScreeningStatus.passed },
        include: expect.any(Object),
      });
    });

    it('should throw UnprocessableEntityException if HIV test is positive', async () => {
      const positiveHIVRecord = {
        ...mockMedicalRecord,
        hiv_result: TestResult.positive,
      };
      mockDatabaseService.medicalRecord.findFirst.mockResolvedValue(
        positiveHIVRecord,
      );

      await expect(service.approve('record-1')).rejects.toThrow(
        UnprocessableEntityException,
      );
      await expect(service.approve('record-1')).rejects.toThrow(
        'Cannot approve medical record with positive test results',
      );
    });

    it('should throw UnprocessableEntityException if Hepatitis B test is positive', async () => {
      const positiveHepBRecord = {
        ...mockMedicalRecord,
        hepatitis_b_result: TestResult.positive,
      };
      mockDatabaseService.medicalRecord.findFirst.mockResolvedValue(
        positiveHepBRecord,
      );

      await expect(service.approve('record-1')).rejects.toThrow(
        'Cannot approve medical record with positive test results',
      );
    });

    it('should throw UnprocessableEntityException if Hepatitis C test is positive', async () => {
      const positiveHepCRecord = {
        ...mockMedicalRecord,
        hepatitis_c_result: TestResult.positive,
      };
      mockDatabaseService.medicalRecord.findFirst.mockResolvedValue(
        positiveHepCRecord,
      );

      await expect(service.approve('record-1')).rejects.toThrow(
        'Cannot approve medical record with positive test results',
      );
    });

    it('should throw UnprocessableEntityException if Malaria test is positive', async () => {
      const positiveMalariaRecord = {
        ...mockMedicalRecord,
        malaria_result: TestResult.positive,
      };
      mockDatabaseService.medicalRecord.findFirst.mockResolvedValue(
        positiveMalariaRecord,
      );

      await expect(service.approve('record-1')).rejects.toThrow(
        'Cannot approve medical record with positive test results',
      );
    });

    it('should throw UnprocessableEntityException if Syphilis test is positive', async () => {
      const positiveSyphilisRecord = {
        ...mockMedicalRecord,
        syphilis_result: TestResult.positive,
      };
      mockDatabaseService.medicalRecord.findFirst.mockResolvedValue(
        positiveSyphilisRecord,
      );

      await expect(service.approve('record-1')).rejects.toThrow(
        'Cannot approve medical record with positive test results',
      );
    });

    it('should throw NotFoundException if record not found', async () => {
      mockDatabaseService.medicalRecord.findFirst.mockResolvedValue(null);

      await expect(service.approve('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if hospital does not match', async () => {
      mockDatabaseService.medicalRecord.findFirst.mockResolvedValue(
        mockMedicalRecord,
      );

      await expect(service.approve('record-1', 'hospital-2')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('reject', () => {
    it('should reject a medical record successfully', async () => {
      mockDatabaseService.medicalRecord.findFirst.mockResolvedValue(
        mockMedicalRecord,
      );
      const rejectedRecord = {
        ...mockMedicalRecord,
        screening_status: ScreeningStatus.failed,
      };
      mockDatabaseService.medicalRecord.update.mockResolvedValue(
        rejectedRecord,
      );

      const result = await service.reject('record-1');

      expect(result).toEqual(rejectedRecord);
      expect(mockDatabaseService.medicalRecord.update).toHaveBeenCalledWith({
        where: { id: 'record-1' },
        data: { screening_status: ScreeningStatus.failed },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if record not found', async () => {
      mockDatabaseService.medicalRecord.findFirst.mockResolvedValue(null);

      await expect(service.reject('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if hospital does not match', async () => {
      mockDatabaseService.medicalRecord.findFirst.mockResolvedValue(
        mockMedicalRecord,
      );

      await expect(service.reject('record-1', 'hospital-2')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a medical record successfully', async () => {
      mockDatabaseService.medicalRecord.findFirst.mockResolvedValue(
        mockMedicalRecord,
      );
      const deletedRecord = {
        ...mockMedicalRecord,
        deleted_at: new Date(),
      };
      mockDatabaseService.medicalRecord.update.mockResolvedValue(deletedRecord);

      const result = await service.remove('record-1');

      expect(result).toEqual(deletedRecord);
      expect(mockDatabaseService.medicalRecord.update).toHaveBeenCalledWith({
        where: { id: 'record-1' },
        data: { deleted_at: expect.any(Date) },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if record not found', async () => {
      mockDatabaseService.medicalRecord.findFirst.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if hospital does not match', async () => {
      mockDatabaseService.medicalRecord.findFirst.mockResolvedValue(
        mockMedicalRecord,
      );

      await expect(service.remove('record-1', 'hospital-2')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
