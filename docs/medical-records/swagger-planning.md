# Swagger Implementation Planning - Medical Records

## Feature overview

Implement Swagger (OpenAPI) documentation for the `MedicalRecordsController`. This includes documenting all endpoints, request bodies (DTOs), and response structures (Entities/Wrappers) to provide a clear API contract.

## API Design Updates

### Controller Level

- `@ApiTags('Medical Records')`: Group all medical record endpoints.
- `@ApiBearerAuth('access-token')`: Indicate that endpoints require JWT authentication.
- `@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)`: Already present, Swagger will reflect this via security requirements.

### Endpoint Level

- `@ApiOperation`: Brief description of each action.
- `@ApiResponse`: Document successful (200/201) and error (400, 401, 403, 404, 409) responses.
- `@ApiParam`: Document path parameters like `:id`.
- `@ApiQuery`: Document query parameters for filtering and pagination.

## Data Model Updates

### Entities (Response Models)

Since the project uses Prisma, we need to define class-based entities for Swagger to describe the response data structure.

- **New File**: `src/medical-records/entities/medical-record.entity.ts`
  - Defines `MedicalRecordEntity` with `@ApiProperty` decorators.

### DTOs (Request Models)

Update existing DTOs with `@ApiProperty` to describe field types, examples, and validation constraints.

- `CreateMedicalRecordDto`
- `UpdateMedicalRecordDto`
- `QueryMedicalRecordsDto`
- `PaginationDto` (Common)

### Response Wrappers

Since the `ResponseInterceptor` wraps all data in a standard structure, we'll create generic response DTOs.

- **New File**: `src/common/dto/response.dto.ts`
  - `BaseResponseDto<T>`: Generic wrapper with `success`, `statusCode`, `message`, `data`, and `timestamp`.

## Folder Structure

No major changes, just adding entities and common response DTOs:

```
src/
├── common/
│   └── dto/
│       └── response.dto.ts (➕ New)
└── medical-records/
    ├── entities/
    │   └── medical-record.entity.ts (➕ New)
    ├── dto/ (📝 Update existing)
    └── medical-records.controller.ts (📝 Update existing)
```

## Trade-offs

- **Manual Decorators**: We use manual `@ApiProperty` decorators instead of the Swagger CLI plugin to have fine-grained control over examples and descriptions, especially given the Prisma-generated types which the plugin might not fully parse.
- **Entity Classes**: Creating separate entity classes for Swagger adds some boilerplate but ensures that the API documentation remains decoupled from the database schema and provides a clean contract for the frontend.

## Step-by-step implementation plan

### Step 1: Base Response DTOs

Create `src/common/dto/response.dto.ts` to document the structure provided by `ResponseInterceptor`.
Update `src/common/dto/pagination.dto.ts` with Swagger decorators.

### Step 2: Medical Record Entity

Create `src/medical-records/entities/medical-record.entity.ts` representing the `MedicalRecord` model.

### Step 3: Update Medical Records DTOs

Add `@ApiProperty` and `@ApiPropertyOptional` to:

- `CreateMedicalRecordDto`
- `UpdateMedicalRecordDto`
- `QueryMedicalRecordsDto`

### Step 4: Update MedicalRecordsController

Apply Swagger decorators to all methods in `MedicalRecordsController`.

### Step 5: Verification

- Run the application.
- Access `/docs` to verify the documentation is correct and reflects the implementation.
