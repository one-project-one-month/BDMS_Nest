import { Test, TestingModule } from '@nestjs/testing';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { QueryMedicalRecordsDto } from './dto/query-medical-records.dto';
import { ScreeningStatus, TestResult, BloodGroup } from '@prisma/client';

describe('MedicalRecordsController', () => {
  let controller: MedicalRecordsController;
  let service: MedicalRecordsService;

  const mockMedicalRecordsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser = {
    id: 'user-1',
    user_name: 'admin-user',
    role: 'admin',
    permissions: [],
    hospital_id: 'hospital-1',
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
      controllers: [MedicalRecordsController],
      providers: [
        {
          provide: MedicalRecordsService,
          useValue: mockMedicalRecordsService,
        },
      ],
    }).compile();

    controller = module.get<MedicalRecordsController>(MedicalRecordsController);
    service = module.get<MedicalRecordsService>(MedicalRecordsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

    it('should create a new medical record', async () => {
      mockMedicalRecordsService.create.mockResolvedValue(mockMedicalRecord);

      const result = await controller.create(createDto, mockUser);

      expect(result).toEqual(mockMedicalRecord);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should call service with the correct DTO', async () => {
      mockMedicalRecordsService.create.mockResolvedValue(mockMedicalRecord);

      await controller.create(createDto, mockUser);

      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    const query: QueryMedicalRecordsDto = {
      page: 1,
      limit: 10,
    };

    const paginatedResponse = {
      data: [mockMedicalRecord],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };

    it('should return paginated medical records', async () => {
      mockMedicalRecordsService.findAll.mockResolvedValue(paginatedResponse);

      const result = await controller.findAll(query, mockUser);

      expect(result).toEqual(paginatedResponse);
      expect(service.findAll).toHaveBeenCalledWith(query, mockUser.hospital_id);
    });

    it('should pass hospital_id from authenticated user', async () => {
      mockMedicalRecordsService.findAll.mockResolvedValue(paginatedResponse);

      await controller.findAll(query, mockUser);

      expect(service.findAll).toHaveBeenCalledWith(query, 'hospital-1');
    });

    it('should handle query parameters', async () => {
      const queryWithFilters: QueryMedicalRecordsDto = {
        page: 1,
        limit: 10,
        search: 'John',
      };
      mockMedicalRecordsService.findAll.mockResolvedValue(paginatedResponse);

      await controller.findAll(queryWithFilters, mockUser);

      expect(service.findAll).toHaveBeenCalledWith(
        queryWithFilters,
        mockUser.hospital_id,
      );
    });
  });

  describe('findOne', () => {
    it('should return a single medical record', async () => {
      mockMedicalRecordsService.findOne.mockResolvedValue(mockMedicalRecord);

      const result = await controller.findOne('record-1', mockUser);

      expect(result).toEqual(mockMedicalRecord);
      expect(service.findOne).toHaveBeenCalledWith(
        'record-1',
        mockUser.hospital_id,
      );
    });

    it('should pass hospital_id from authenticated user', async () => {
      mockMedicalRecordsService.findOne.mockResolvedValue(mockMedicalRecord);

      await controller.findOne('record-1', mockUser);

      expect(service.findOne).toHaveBeenCalledWith('record-1', 'hospital-1');
    });
  });

  describe('update', () => {
    const updateDto: UpdateMedicalRecordDto = {
      hemoglobin_level: 15.0,
      screening_notes: 'Updated notes',
    };

    it('should update a medical record', async () => {
      const updatedRecord = { ...mockMedicalRecord, ...updateDto };
      mockMedicalRecordsService.update.mockResolvedValue(updatedRecord);

      const result = await controller.update('record-1', updateDto, mockUser);

      expect(result).toEqual(updatedRecord);
      expect(service.update).toHaveBeenCalledWith(
        'record-1',
        updateDto,
        mockUser.hospital_id,
      );
    });

    it('should pass hospital_id from authenticated user', async () => {
      mockMedicalRecordsService.update.mockResolvedValue(mockMedicalRecord);

      await controller.update('record-1', updateDto, mockUser);

      expect(service.update).toHaveBeenCalledWith(
        'record-1',
        updateDto,
        'hospital-1',
      );
    });
  });

  describe('approve', () => {
    it('should approve a medical record', async () => {
      const approvedRecord = {
        ...mockMedicalRecord,
        screening_status: ScreeningStatus.passed,
      };
      mockMedicalRecordsService.approve.mockResolvedValue(approvedRecord);

      const result = await controller.approve('record-1', mockUser);

      expect(result).toEqual(approvedRecord);
      expect(service.approve).toHaveBeenCalledWith(
        'record-1',
        mockUser.hospital_id,
      );
    });

    it('should pass hospital_id from authenticated user', async () => {
      mockMedicalRecordsService.approve.mockResolvedValue(mockMedicalRecord);

      await controller.approve('record-1', mockUser);

      expect(service.approve).toHaveBeenCalledWith('record-1', 'hospital-1');
    });
  });

  describe('reject', () => {
    it('should reject a medical record', async () => {
      const rejectedRecord = {
        ...mockMedicalRecord,
        screening_status: ScreeningStatus.failed,
      };
      mockMedicalRecordsService.reject.mockResolvedValue(rejectedRecord);

      const result = await controller.reject('record-1', mockUser);

      expect(result).toEqual(rejectedRecord);
      expect(service.reject).toHaveBeenCalledWith(
        'record-1',
        mockUser.hospital_id,
      );
    });

    it('should pass hospital_id from authenticated user', async () => {
      mockMedicalRecordsService.reject.mockResolvedValue(mockMedicalRecord);

      await controller.reject('record-1', mockUser);

      expect(service.reject).toHaveBeenCalledWith('record-1', 'hospital-1');
    });
  });

  describe('remove', () => {
    it('should soft delete a medical record', async () => {
      const deletedRecord = {
        ...mockMedicalRecord,
        deleted_at: new Date(),
      };
      mockMedicalRecordsService.remove.mockResolvedValue(deletedRecord);

      const result = await controller.remove('record-1', mockUser);

      expect(result).toEqual(deletedRecord);
      expect(service.remove).toHaveBeenCalledWith(
        'record-1',
        mockUser.hospital_id,
      );
    });

    it('should pass hospital_id from authenticated user', async () => {
      mockMedicalRecordsService.remove.mockResolvedValue(mockMedicalRecord);

      await controller.remove('record-1', mockUser);

      expect(service.remove).toHaveBeenCalledWith('record-1', 'hospital-1');
    });
  });
});
