import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';
import {
  MedicalRecordStatus,
  BloodType,
  RhFactor,
  Role,
} from '../prisma/generated/enums';

describe('MedicalRecordsController (e2e)', () => {
  let app: INestApplication<App>;
  let databaseService: DatabaseService;
  let authToken: string;
  let adminToken: string;
  let staffToken: string;
  let testHospitalId: string;
  let testDonationId: string;
  let testMedicalRecordId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    databaseService = moduleFixture.get<DatabaseService>(DatabaseService);

    // Setup test data
    await setupTestData();
  });

  afterAll(async () => {
    // Cleanup test data
    await cleanupTestData();
    await app.close();
  });

  async function setupTestData() {
    // Create test hospital
    const hospital = await databaseService.hospital.create({
      data: {
        name: 'Test Hospital E2E',
        address: '123 Test St',
        phone: '1234567890',
        email: 'test@hospital.com',
      },
    });
    testHospitalId = hospital.id;

    // Create test users (admin, staff)
    const adminUser = await databaseService.user.create({
      data: {
        email: 'admin.e2e@test.com',
        password: '$2b$10$X3vZ9K8h.vQg9YLI0B4cX.8hY5K2YgX3vZ9K8h.vQg9YLI0B4cX.',
        role: Role.ADMIN,
        hospital_id: testHospitalId,
      },
    });

    const staffUser = await databaseService.user.create({
      data: {
        email: 'staff.e2e@test.com',
        password: '$2b$10$X3vZ9K8h.vQg9YLI0B4cX.8hY5K2YgX3vZ9K8h.vQg9YLI0B4cX.',
        role: Role.STAFF,
        hospital_id: testHospitalId,
      },
    });

    // Create test donor
    const donor = await databaseService.donor.create({
      data: {
        user_id: adminUser.id,
        blood_type: BloodType.A,
        rh_factor: RhFactor.POSITIVE,
        date_of_birth: new Date('1990-01-01'),
        gender: 'MALE',
        phone: '1234567890',
        address: '123 Donor St',
        city: 'Test City',
        state: 'Test State',
        zip_code: '12345',
        country: 'Test Country',
        emergency_contact_name: 'Test Contact',
        emergency_contact_phone: '9876543210',
        medical_conditions: null,
        current_medications: null,
        hospital_id: testHospitalId,
      },
    });

    // Create test donation
    const donation = await databaseService.donation.create({
      data: {
        donor_id: donor.id,
        hospital_id: testHospitalId,
        donation_date: new Date(),
        blood_type: BloodType.A,
        rh_factor: RhFactor.POSITIVE,
        quantity_ml: 450,
        status: 'COMPLETED',
      },
    });
    testDonationId = donation.id;

    // Get auth tokens (mock JWT generation or use actual login endpoint)
    // For this example, we'll mock the token generation
    // In a real scenario, you'd call the auth/login endpoint
    adminToken = await generateMockToken(adminUser.id, Role.ADMIN);
    staffToken = await generateMockToken(staffUser.id, Role.STAFF);
    authToken = adminToken; // Default to admin for most tests
  }

  async function cleanupTestData() {
    // Delete in reverse order of dependencies
    if (testMedicalRecordId) {
      await databaseService.medicalRecord.deleteMany({
        where: { donation_id: testDonationId },
      });
    }
    if (testDonationId) {
      await databaseService.donation.deleteMany({
        where: { hospital_id: testHospitalId },
      });
    }
    await databaseService.donor.deleteMany({
      where: { hospital_id: testHospitalId },
    });
    await databaseService.user.deleteMany({
      where: { hospital_id: testHospitalId },
    });
    await databaseService.hospital.deleteMany({
      where: { id: testHospitalId },
    });
  }

  async function generateMockToken(
    userId: string,
    role: Role,
  ): Promise<string> {
    // TODO: Replace with actual JWT generation or login endpoint call
    // For now, return a mock token
    // In a real scenario, you would:
    // const response = await request(app.getHttpServer())
    //   .post('/auth/login')
    //   .send({ email: 'admin.e2e@test.com', password: 'password' });
    // return response.body.access_token;
    return 'mock-jwt-token';
  }

  describe('POST /medical-records', () => {
    it('should create a new medical record (ADMIN)', () => {
      const createDto = {
        donation_id: testDonationId,
        hospital_id: testHospitalId,
        blood_type: BloodType.A,
        rh_factor: RhFactor.POSITIVE,
        hemoglobin_level: 14.5,
        blood_pressure_systolic: 120,
        blood_pressure_diastolic: 80,
        hiv_test: false,
        hepatitis_b_test: false,
        hepatitis_c_test: false,
        malaria_test: false,
        syphilis_test: false,
      };

      return request(app.getHttpServer())
        .post('/medical-records')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.donation_id).toBe(testDonationId);
          expect(res.body.status).toBe(MedicalRecordStatus.PENDING);
          testMedicalRecordId = res.body.id;
        });
    });

    it('should create a new medical record (STAFF)', () => {
      // First cleanup the previous record
      return request(app.getHttpServer())
        .post('/medical-records')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          donation_id: testDonationId,
          hospital_id: testHospitalId,
          blood_type: BloodType.A,
          rh_factor: RhFactor.POSITIVE,
          hemoglobin_level: 14.5,
          blood_pressure_systolic: 120,
          blood_pressure_diastolic: 80,
          hiv_test: false,
          hepatitis_b_test: false,
          hepatitis_c_test: false,
          malaria_test: false,
          syphilis_test: false,
        })
        .expect(201);
    });

    it('should fail with 409 if medical record already exists for donation', () => {
      return request(app.getHttpServer())
        .post('/medical-records')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          donation_id: testDonationId,
          hospital_id: testHospitalId,
          blood_type: BloodType.A,
          rh_factor: RhFactor.POSITIVE,
          hemoglobin_level: 14.5,
          blood_pressure_systolic: 120,
          blood_pressure_diastolic: 80,
          hiv_test: false,
          hepatitis_b_test: false,
          hepatitis_c_test: false,
          malaria_test: false,
          syphilis_test: false,
        })
        .expect(409);
    });

    it('should fail with 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/medical-records')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          donation_id: testDonationId,
          hospital_id: testHospitalId,
          // Missing required fields
        })
        .expect(400);
    });

    it('should fail with 401 without authentication', () => {
      return request(app.getHttpServer())
        .post('/medical-records')
        .send({
          donation_id: testDonationId,
          hospital_id: testHospitalId,
        })
        .expect(401);
    });
  });

  describe('GET /medical-records', () => {
    it('should return paginated medical records (ADMIN)', () => {
      return request(app.getHttpServer())
        .get('/medical-records')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.meta).toHaveProperty('total');
          expect(res.body.meta).toHaveProperty('page');
          expect(res.body.meta).toHaveProperty('limit');
          expect(res.body.meta).toHaveProperty('totalPages');
        });
    });

    it('should filter by status', () => {
      return request(app.getHttpServer())
        .get('/medical-records?status=PENDING')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.every((r: any) => r.status === 'PENDING')).toBe(
            true,
          );
        });
    });

    it('should filter by hospital_id', () => {
      return request(app.getHttpServer())
        .get(`/medical-records?hospital_id=${testHospitalId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(
            res.body.data.every((r: any) => r.hospital_id === testHospitalId),
          ).toBe(true);
        });
    });

    it('should support pagination', () => {
      return request(app.getHttpServer())
        .get('/medical-records?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(5);
          expect(res.body.data.length).toBeLessThanOrEqual(5);
        });
    });

    it('should fail with 401 without authentication', () => {
      return request(app.getHttpServer()).get('/medical-records').expect(401);
    });
  });

  describe('GET /medical-records/:id', () => {
    it('should return a single medical record by id (ADMIN)', () => {
      return request(app.getHttpServer())
        .get(`/medical-records/${testMedicalRecordId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testMedicalRecordId);
          expect(res.body).toHaveProperty('donation');
        });
    });

    it('should return a single medical record by id (STAFF)', () => {
      return request(app.getHttpServer())
        .get(`/medical-records/${testMedicalRecordId}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testMedicalRecordId);
        });
    });

    it('should fail with 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .get('/medical-records/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should fail with 401 without authentication', () => {
      return request(app.getHttpServer())
        .get(`/medical-records/${testMedicalRecordId}`)
        .expect(401);
    });
  });

  describe('PATCH /medical-records/:id', () => {
    it('should update a medical record (ADMIN)', () => {
      return request(app.getHttpServer())
        .patch(`/medical-records/${testMedicalRecordId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          hemoglobin_level: 15.0,
          notes: 'Updated via E2E test',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.hemoglobin_level).toBe(15.0);
          expect(res.body.notes).toBe('Updated via E2E test');
        });
    });

    it('should update a medical record (STAFF)', () => {
      return request(app.getHttpServer())
        .patch(`/medical-records/${testMedicalRecordId}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          notes: 'Updated by staff',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.notes).toBe('Updated by staff');
        });
    });

    it('should fail with 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .patch('/medical-records/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ notes: 'Test' })
        .expect(404);
    });

    it('should fail with 401 without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/medical-records/${testMedicalRecordId}`)
        .send({ notes: 'Test' })
        .expect(401);
    });
  });

  describe('PATCH /medical-records/:id/approve', () => {
    it('should approve a medical record with all negative tests (ADMIN)', () => {
      return request(app.getHttpServer())
        .patch(`/medical-records/${testMedicalRecordId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(MedicalRecordStatus.APPROVED);
        });
    });

    it('should approve a medical record (STAFF)', () => {
      // First set status back to pending
      return request(app.getHttpServer())
        .patch(`/medical-records/${testMedicalRecordId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: MedicalRecordStatus.PENDING })
        .then(() => {
          return request(app.getHttpServer())
            .patch(`/medical-records/${testMedicalRecordId}/approve`)
            .set('Authorization', `Bearer ${staffToken}`)
            .expect(200)
            .expect((res) => {
              expect(res.body.status).toBe(MedicalRecordStatus.APPROVED);
            });
        });
    });

    it('should fail with 422 if any test is positive', async () => {
      // Update record with positive HIV test
      await databaseService.medicalRecord.update({
        where: { id: testMedicalRecordId },
        data: { hiv_test: true, status: MedicalRecordStatus.PENDING },
      });

      return request(app.getHttpServer())
        .patch(`/medical-records/${testMedicalRecordId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(422)
        .then(async () => {
          // Reset for other tests
          await databaseService.medicalRecord.update({
            where: { id: testMedicalRecordId },
            data: { hiv_test: false },
          });
        });
    });

    it('should fail with 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .patch('/medical-records/non-existent-id/approve')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should fail with 401 without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/medical-records/${testMedicalRecordId}/approve`)
        .expect(401);
    });
  });

  describe('PATCH /medical-records/:id/reject', () => {
    it('should reject a medical record (ADMIN)', () => {
      return request(app.getHttpServer())
        .patch(`/medical-records/${testMedicalRecordId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(MedicalRecordStatus.REJECTED);
        });
    });

    it('should reject a medical record (STAFF)', () => {
      // First set status back to pending
      return request(app.getHttpServer())
        .patch(`/medical-records/${testMedicalRecordId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: MedicalRecordStatus.PENDING })
        .then(() => {
          return request(app.getHttpServer())
            .patch(`/medical-records/${testMedicalRecordId}/reject`)
            .set('Authorization', `Bearer ${staffToken}`)
            .expect(200)
            .expect((res) => {
              expect(res.body.status).toBe(MedicalRecordStatus.REJECTED);
            });
        });
    });

    it('should fail with 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .patch('/medical-records/non-existent-id/reject')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should fail with 401 without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/medical-records/${testMedicalRecordId}/reject`)
        .expect(401);
    });
  });

  describe('DELETE /medical-records/:id', () => {
    it('should fail with 403 for STAFF role (not allowed to delete)', () => {
      return request(app.getHttpServer())
        .delete(`/medical-records/${testMedicalRecordId}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(403);
    });

    it('should soft delete a medical record (ADMIN only)', () => {
      return request(app.getHttpServer())
        .delete(`/medical-records/${testMedicalRecordId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('deleted_at');
          expect(res.body.deleted_at).not.toBeNull();
        });
    });

    it('should fail with 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .delete('/medical-records/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should fail with 401 without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/medical-records/${testMedicalRecordId}`)
        .expect(401);
    });
  });

  describe('Hospital Scoping', () => {
    let otherHospitalId: string;
    let otherDonationId: string;
    let otherRecordId: string;
    let otherAdminToken: string;

    beforeAll(async () => {
      // Create another hospital and admin
      const otherHospital = await databaseService.hospital.create({
        data: {
          name: 'Other Hospital',
          address: '456 Other St',
          phone: '9876543210',
          email: 'other@hospital.com',
        },
      });
      otherHospitalId = otherHospital.id;

      const otherAdmin = await databaseService.user.create({
        data: {
          email: 'other.admin@test.com',
          password:
            '$2b$10$X3vZ9K8h.vQg9YLI0B4cX.8hY5K2YgX3vZ9K8h.vQg9YLI0B4cX.',
          role: Role.ADMIN,
          hospital_id: otherHospitalId,
        },
      });

      const otherDonor = await databaseService.donor.create({
        data: {
          user_id: otherAdmin.id,
          blood_type: BloodType.B,
          rh_factor: RhFactor.NEGATIVE,
          date_of_birth: new Date('1985-01-01'),
          gender: 'FEMALE',
          phone: '5555555555',
          address: '456 Donor St',
          city: 'Other City',
          state: 'Other State',
          zip_code: '54321',
          country: 'Other Country',
          emergency_contact_name: 'Other Contact',
          emergency_contact_phone: '1111111111',
          hospital_id: otherHospitalId,
        },
      });

      const otherDonation = await databaseService.donation.create({
        data: {
          donor_id: otherDonor.id,
          hospital_id: otherHospitalId,
          donation_date: new Date(),
          blood_type: BloodType.B,
          rh_factor: RhFactor.NEGATIVE,
          quantity_ml: 450,
          status: 'COMPLETED',
        },
      });
      otherDonationId = otherDonation.id;

      const otherRecord = await databaseService.medicalRecord.create({
        data: {
          donation_id: otherDonationId,
          hospital_id: otherHospitalId,
          blood_type: BloodType.B,
          rh_factor: RhFactor.NEGATIVE,
          hemoglobin_level: 13.5,
          blood_pressure_systolic: 115,
          blood_pressure_diastolic: 75,
          hiv_test: false,
          hepatitis_b_test: false,
          hepatitis_c_test: false,
          malaria_test: false,
          syphilis_test: false,
        },
      });
      otherRecordId = otherRecord.id;

      otherAdminToken = await generateMockToken(otherAdmin.id, Role.ADMIN);
    });

    afterAll(async () => {
      await databaseService.medicalRecord.deleteMany({
        where: { hospital_id: otherHospitalId },
      });
      await databaseService.donation.deleteMany({
        where: { hospital_id: otherHospitalId },
      });
      await databaseService.donor.deleteMany({
        where: { hospital_id: otherHospitalId },
      });
      await databaseService.user.deleteMany({
        where: { hospital_id: otherHospitalId },
      });
      await databaseService.hospital.deleteMany({
        where: { id: otherHospitalId },
      });
    });

    it('should not allow access to records from other hospital', () => {
      return request(app.getHttpServer())
        .get(`/medical-records/${otherRecordId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);
    });

    it('should allow access to own hospital records only', () => {
      return request(app.getHttpServer())
        .get(`/medical-records/${otherRecordId}`)
        .set('Authorization', `Bearer ${otherAdminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(otherRecordId);
          expect(res.body.hospital_id).toBe(otherHospitalId);
        });
    });
  });
});
