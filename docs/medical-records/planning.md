# Medical Records Feature Planning

## Feature overview

Medical records store screening test results for blood donations. After a donation is created, medical staff screen the donated blood for infectious diseases (HIV, Hepatitis B/C, Malaria, Syphilis) and measure hemoglobin levels. The screening determines if the blood is safe for inventory.

**Target users**: Medical staff (STAFF role), hospital administrators (ADMIN role)
**Business value**: Ensures blood safety compliance and traceability
**Scope**:

- ✅ CRUD operations for medical records
- ✅ Approve/reject screening workflow
- ✅ Query filtering by status, hospital, date
- ✅ Permission-based access control (ADMIN + STAFF)
- ❌ Out of scope: Automatic test result integration, batch screening

## API design

### Endpoints

| Method | Path                           | Permission       | Who Can Access |
| ------ | ------------------------------ | ---------------- | -------------- |
| POST   | `/medical-records`             | `medical.create` | ADMIN, STAFF   |
| GET    | `/medical-records`             | `medical.access` | ADMIN, STAFF   |
| GET    | `/medical-records/:id`         | `medical.view`   | ADMIN, STAFF   |
| PATCH  | `/medical-records/:id/approve` | `medical.update` | ADMIN, STAFF   |
| PATCH  | `/medical-records/:id/reject`  | `medical.update` | ADMIN, STAFF   |
| PATCH  | `/medical-records/:id`         | `medical.update` | ADMIN, STAFF   |
| DELETE | `/medical-records/:id`         | `medical.delete` | ADMIN only     |

### Request/Response DTOs

**CreateMedicalRecordDto**:

```typescript
{
  donation_id: string;          // required, UUID, must be unique
  hospital_id: string;          // required, UUID
  hemoglobin_level: number;     // required, 8.0-20.0
  hiv_result: 'positive' | 'negative' | 'inconclusive';
  hepatitis_b_result: TestResult;
  hepatitis_c_result: TestResult;
  malaria_result: TestResult;
  syphilis_result: TestResult;
  blood_group: BloodGroup;      // required
  screening_notes?: string;     // optional
  screened_by: string;          // required, user UUID
  screening_at: Date;           // required
}
```

**UpdateMedicalRecordDto**: `PartialType(CreateMedicalRecordDto)`

**QueryMedicalRecordsDto** (extends PaginationDto):

```typescript
{
  status?: 'pending' | 'passed' | 'failed';
  hospital_id?: string;
  donation_id?: string;
  limit?: number;    // default 10
  page?: number;     // default 1
  search?: string;   // search by screening notes
}
```

### Validation rules

- `donation_id` must exist in database and be unique (one record per donation)
- `hemoglobin_level` must be between 8.0 and 20.0
- All test results must be valid enum values
- `screened_by` must be valid user UUID
- **Business rule**: Cannot approve if ANY test result is 'positive'
- Hospital scoping: Users can only access records from their assigned hospital

### Auth/Permissions

- All endpoints require `JwtAuthGuard` + `PermissionsGuard`
- Hospital scoping enforced at service layer
- DELETE operation restricted to ADMIN role only (via seed permissions)
- `@CurrentUser()` decorator provides authenticated user context

### Error contracts

- 400 Bad Request: Validation error (invalid DTO)
- 403 Forbidden: Insufficient permissions or wrong hospital
- 404 Not Found: Medical record or donation not found
- 409 Conflict: Donation already has a medical record
- 422 Unprocessable Entity: Cannot approve record with positive test results

## Data model

**Entity**: `MedicalRecord` (Prisma schema lines 256-278)

```prisma
model MedicalRecord {
  id                 String          @id @default(uuid())
  donation_id        String          @unique
  hospital_id        String
  hemoglobin_level   Decimal         @db.Decimal(4, 2)
  hiv_result         TestResult
  hepatitis_b_result TestResult
  hepatitis_c_result TestResult
  malaria_result     TestResult
  syphilis_result    TestResult
  blood_group        BloodGroup
  screening_status   ScreeningStatus @default(pending)
  screening_notes    String?
  screened_by        String
  screening_at       DateTime
  created_at         DateTime        @default(now())
  updated_at         DateTime        @updatedAt
  deleted_at         DateTime?

  donation Donation @relation(fields: [donation_id], references: [id])
  hospital Hospital @relation(fields: [hospital_id], references: [id])
  screener User     @relation(fields: [screened_by], references: [id])
}
```

**Relationships**:

- One-to-one with `Donation` (each donation has exactly one medical record)
- Many-to-one with `Hospital`
- Many-to-one with `User` (screener)

**Enums** (Prisma schema lines 70-80):

- `TestResult`: positive | negative | inconclusive
- `ScreeningStatus`: pending | passed | failed
- `BloodGroup`: A_POS | A_NEG | B_POS | B_NEG | AB_POS | AB_NEG | O_POS | O_NEG

**Indexes**:

- `donation_id` is unique (enforced at DB level)

## Folder structure

```
src/medical-records/
├── dto/
│   ├── create-medical-record.dto.ts (✅ exists, needs implementation)
│   ├── update-medical-record.dto.ts (✅ exists, needs implementation)
│   └── query-medical-records.dto.ts (➕ create new)
├── medical-records.controller.ts (✅ exists, needs full implementation)
├── medical-records.service.ts (✅ exists, needs full implementation)
├── medical-records.module.ts (✅ exists, may need DatabaseModule import)
├── medical-records.controller.spec.ts (✅ exists, needs tests)
└── medical-records.service.spec.ts (✅ exists, needs tests)

test/
└── medical-records.e2e-spec.ts (➕ create new)
```

## Trade-offs

### Decision 1: Approve/Reject as separate endpoints vs status field in PATCH

**Chosen**: Separate endpoints (`/approve`, `/reject`)

**Rationale**:

- ✅ More explicit and semantic REST design
- ✅ Easier to add business logic validation (e.g., block approval if any test is positive)
- ✅ Clearer audit trail in logs and monitoring
- ✅ Follows REST action-oriented sub-resource pattern
- ✅ Better API discoverability

**Alternatives considered**:

- Single PATCH with `screening_status` field → Less explicit, harder to enforce complex business rules

### Decision 2: Hospital scoping enforcement location

**Chosen**: Service-layer enforcement with `hospital_id` checks

**Rationale**:

- ✅ Security defense-in-depth (controller + service validation)
- ✅ Prevents cross-hospital data leakage
- ✅ Consistent with existing `users.controller.ts` pattern (lines 36-38)
- ✅ Testable in isolation

**Alternatives considered**:

- Controller-only checks → Less secure, business logic in wrong layer
- Database row-level security → Over-engineering for current scale

### Decision 3: Soft delete vs hard delete

**Chosen**: Soft delete (set `deleted_at` timestamp)

**Rationale**:

- ✅ Audit trail preservation (critical for medical records)
- ✅ Regulatory compliance requirements
- ✅ Schema already has `deleted_at` field
- ✅ Enables data recovery if needed

**Alternatives considered**:

- Hard delete → Violates medical record retention policies

### Decision 4: Query filtering strategy

**Chosen**: DTO-based with `class-validator` + Prisma `where` clause

**Rationale**:

- ✅ Type-safe at compile time
- ✅ Automatic validation via NestJS ValidationPipe
- ✅ Follows existing `PaginationDto` pattern
- ✅ Composable and extensible

**Alternatives considered**:

- Raw query params → No validation, error-prone
- GraphQL → Overkill for current requirements

## Step-by-step implementation plan

### 1. Create DTOs (✏️ 15 min)

- Implement `CreateMedicalRecordDto` with class-validator decorators
- Implement `UpdateMedicalRecordDto` as `PartialType`
- Create `QueryMedicalRecordsDto` extending `PaginationDto`
- Add enum type definitions for TestResult, ScreeningStatus, BloodGroup

### 2. Implement Service Layer (⚙️ 30 min)

- Inject `DatabaseService` in constructor
- Implement `create()` with donation uniqueness check (409 if exists)
- Implement `findAll()` with query filters, pagination, and hospital scoping
- Implement `findOne()` with hospital scoping and 404 handling
- Implement `update()` with validation
- Implement `approve()` with business rule (reject if ANY test is positive)
- Implement `reject()` to set status to 'failed'
- Implement `remove()` as soft delete (set `deleted_at`)

### 3. Implement Controller Layer (🎮 20 min)

- Add `@UseGuards(JwtAuthGuard, PermissionsGuard)` to controller class
- Add `@Permissions()` decorators to each endpoint
- Add `@CurrentUser()` decorator for hospital scoping
- Add `@Query()` decorator with `QueryMedicalRecordsDto`
- Implement POST, GET (list), GET (by ID), PATCH (update), DELETE
- Add PATCH `/approve` and PATCH `/reject` endpoints

### 4. Update Module (🔧 5 min)

- Ensure `DatabaseModule` is imported
- Verify controller and service are properly registered
- Check no circular dependencies

### 5. Write Unit Tests (🧪 30 min)

- **Service tests**: Mock DatabaseService with `jest.fn()`
- Test `create()`, `findAll()`, `findOne()`, `update()`, `approve()`, `reject()`, `remove()`
- Test hospital scoping logic (403 if wrong hospital)
- Test error cases (404, 409, 422 for invalid approval)

### 6. Write E2E Tests (🔬 45 min)

- Create `test/medical-records.e2e-spec.ts`
- Test full request cycle with JWT authentication
- Test permissions enforcement (ADMIN vs STAFF vs USER)
- Test query filtering (status, hospital_id, pagination)
- Test approve/reject workflow with business rules

### 7. Validate & Commit (✅ 10 min)

- Run `pnpm run lint` and fix any issues
- Run `pnpm run test` to verify unit tests pass
- Run `pnpm run test:e2e` to verify e2e tests pass
- Create atomic commits per logical unit

**Total estimated time**: ~2.5 hours
