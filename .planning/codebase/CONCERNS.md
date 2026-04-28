# Codebase Concerns

**Analysis Date:** 2025-06-30

## Tech Debt

**Stub Service Implementations:**
- Issue: 7 out of 8 domain services contain placeholder/stub implementations that return static strings instead of actual database operations
- Files:
  - `src/donations/donations.service.ts` - All methods return placeholder strings
  - `src/appointments/appointments.service.ts` - All methods return placeholder strings
  - `src/blood-inventory/blood-inventory.service.ts` - All methods return placeholder strings
  - `src/certificates/certificates.service.ts` - All methods return placeholder strings
  - `src/medical-records/medical-records.service.ts` - All methods return placeholder strings
  - `src/requests/requests.service.ts` - All methods return placeholder strings
  - `src/announcements/announcements.service.ts` - create/update/remove methods are stubs, only findAll is implemented
- Impact: API endpoints exist but don't perform actual CRUD operations; frontend would receive misleading responses
- Fix approach: Implement actual Prisma database operations for each service method following the pattern in `src/users/users.service.ts`

**Commented Out Update Method:**
- Issue: `UsersService.update()` method is commented out (lines 196-215)
- Files: `src/users/users.service.ts`
- Impact: No general user profile update functionality available
- Fix approach: Uncomment and implement with proper DTO validation, or remove if intentionally deprecated

**Multiple eslint-disable Comments:**
- Issue: 17+ `@typescript-eslint/no-unused-vars` disable comments throughout stub services
- Files: All stub service files listed above
- Impact: Masks unused parameters that exist due to unimplemented methods
- Fix approach: Implement the methods properly; eslint-disable comments will no longer be needed

**Type ID Mismatch in Controllers:**
- Issue: Controllers pass string IDs but services expect `number` (using `+id` coercion)
- Files:
  - `src/donations/donations.controller.ts:45` - `+id` coercion
  - `src/appointments/appointments.controller.ts:43` - `+id` coercion
  - `src/requests/requests.controller.ts:42` - `+id` coercion
- Impact: Type inconsistency; Prisma schema uses UUID strings for all IDs
- Fix approach: Change service method signatures to accept `string` IDs to match Prisma schema

## Security Considerations

**Open CORS Configuration:**
- Risk: `app.enableCors()` called without options allows all origins
- Files: `src/main.ts:36`
- Current mitigation: None
- Recommendations: Configure CORS with explicit allowed origins, especially for production:
  ```typescript
  app.enableCors({
    origin: configService.get('ALLOWED_ORIGINS')?.split(','),
    credentials: true,
  });
  ```

**Missing Security Headers:**
- Risk: No helmet middleware for security headers (X-Frame-Options, Content-Security-Policy, etc.)
- Files: `src/main.ts`
- Current mitigation: None
- Recommendations: Install and configure `@fastify/helmet` or `helmet` package

**No Rate Limiting:**
- Risk: API endpoints vulnerable to brute force attacks (especially `/auth/login`)
- Files: No rate limiting implementation found
- Current mitigation: None
- Recommendations: Implement `@nestjs/throttler` package, especially for authentication endpoints

**Refresh Token in Response Body (TODO noted):**
- Risk: Refresh tokens returned in JSON response body instead of httpOnly cookies
- Files: `src/auth/auth.service.ts:67` - Contains TODO comment acknowledging this
- Current mitigation: None
- Recommendations: Set refresh token in httpOnly secure cookie to prevent XSS token theft

**Hard Delete Without Soft Delete:**
- Risk: User deletion is hard delete despite `deleted_at` field existing in schema
- Files: `src/users/users.service.ts:264` - Uses `prisma.user.delete()`
- Current mitigation: None; data is permanently deleted
- Recommendations: Implement soft delete by setting `deleted_at` timestamp; add middleware to filter soft-deleted records

**Exposed Password Hash in Token Generation:**
- Risk: `findByUsername` and `findById` include password hash in returned object
- Files: `src/users/users.service.ts:52-67`, `src/users/users.service.ts:69-90`
- Current mitigation: Login endpoint strips password before response
- Recommendations: Always exclude password from queries except when explicitly needed for authentication

## Performance Bottlenecks

**N+1 Query Potential in JWT Validation:**
- Problem: Every authenticated request hits database to validate user
- Files: `src/auth/strategies/jwt.strategy.ts:27-46`
- Cause: No caching of user validation results
- Improvement path: Implement Redis caching for user session data; invalidate on user update/deactivation

**No Query Optimization for Pagination:**
- Problem: Count query runs separately from data query
- Files: `src/users/users.service.ts:136-145`, `src/users/users.service.ts:170-179`
- Cause: Two separate Promise.all queries for data and count
- Improvement path: Consider using cursor-based pagination for large datasets; or combine with Prisma's `_count`

## Fragile Areas

**Permission System Coupling:**
- Files: `src/auth/guards/permissions.guard.ts`, `src/auth/strategies/jwt.strategy.ts`
- Why fragile: Permissions are fetched from database on every JWT validation, then checked in guard; changes to permission structure require coordinated updates
- Safe modification: Ensure permission names match between seed data, guards, and decorators
- Test coverage: No permission guard tests exist

**Hospital Scoping Logic:**
- Files: `src/users/users.controller.ts:35-38`, `src/users/users.controller.ts:56-58`
- Why fragile: Hospital ID required check is duplicated in controller; no centralized hospital scoping
- Safe modification: Consider a hospital scoping guard or service decorator
- Test coverage: Minimal controller tests

**Role-Permission Relationship:**
- Files: `prisma/schema.prisma:122-130`, `prisma/seed.ts`
- Why fragile: Role permissions are manually seeded; no admin UI to manage; changes require re-seeding
- Safe modification: Run seed script after permission changes; ensure idempotent upserts
- Test coverage: None

## Missing Critical Features

**No Logging Infrastructure:**
- Problem: Only `console.log` in `src/main.ts` for startup; no structured logging
- Blocks: Production debugging, audit trails, error tracking
- Recommendation: Implement NestJS Logger or Winston with log levels and formatters

**No API Documentation:**
- Problem: No `@ApiProperty`, `@ApiOperation`, `@ApiResponse` decorators found
- Blocks: API consumers have no documentation; Swagger UI shows minimal info
- Recommendation: Add Swagger decorators to all DTOs and controller methods

**No Health Check Endpoint:**
- Problem: No `/health` or `/ready` endpoints for container orchestration
- Blocks: Kubernetes readiness/liveness probes, load balancer health checks
- Recommendation: Implement `@nestjs/terminus` health checks

**No Database Transaction Support:**
- Problem: Multi-step operations (e.g., creating donation + inventory) not wrapped in transactions
- Blocks: Data consistency in complex workflows
- Recommendation: Use Prisma interactive transactions for multi-model operations

## Test Coverage Gaps

**Stub Service Tests:**
- What's not tested: All stub services only test "should be defined"
- Files:
  - `src/donations/donations.service.spec.ts` (15 lines, 1 test)
  - `src/appointments/appointments.service.spec.ts` (19 lines, 1 test)
  - `src/blood-inventory/blood-inventory.service.spec.ts` (18 lines, 1 test)
  - `src/certificates/certificates.service.spec.ts` (18 lines, 1 test)
  - `src/medical-records/medical-records.service.spec.ts` (18 lines, 1 test)
  - `src/requests/requests.service.spec.ts` (15 lines, 1 test)
- Risk: No verification of business logic when implementations are added
- Priority: High - must be addressed alongside service implementations

**Controller Tests Minimal:**
- What's not tested: Route handlers, guards, decorators, response formatting
- Files: All controller spec files contain only "should be defined" tests
- Risk: Authorization bypasses, response format changes undetected
- Priority: Medium - guards and decorators provide some protection

**No Integration/E2E Tests for Auth Flow:**
- What's not tested: Full login → token → protected endpoint flow
- Files: `test/app.e2e-spec.ts` only tests `/` route
- Risk: Auth regressions undetected
- Priority: High - authentication is critical path

**No Guard/Strategy Tests:**
- What's not tested: JWT validation, role checking, permission checking
- Files: No tests for `src/auth/guards/` or `src/auth/strategies/`
- Risk: Security regressions in authorization logic
- Priority: High - security critical

## Scaling Limits

**Single Database Connection Pool:**
- Current capacity: Default pg Pool settings
- Limit: Will bottleneck under high concurrent load
- Scaling path: Configure Pool size based on expected connections; consider PgBouncer

**No Caching Layer:**
- Current capacity: Direct database hits for all requests
- Limit: Database becomes bottleneck for read-heavy workloads
- Scaling path: Implement Redis for session data, frequently accessed records

## Dependencies at Risk

**Prisma 7.x (Preview/RC):**
- Risk: Using `@prisma/client@^7.4.1` which may have breaking changes
- Impact: Schema or query API changes between versions
- Migration plan: Pin to stable version when available; test upgrades thoroughly

**Type Packages Versioning:**
- Risk: `@types/jest@^30.0.0` - Jest 30 types may not match Jest 29 used in ts-jest
- Impact: Type mismatches in test files
- Migration plan: Verify type package versions match runtime package versions

---

*Concerns audit: 2025-06-30*
