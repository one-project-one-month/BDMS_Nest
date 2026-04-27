# Architecture

**Analysis Date:** 2025-01-23

## Pattern Overview

**Overall:** Modular Monolith using NestJS with feature-based modules

**Key Characteristics:**
- Feature-based module organization (users, auth, donations, requests, etc.)
- Dependency Injection via NestJS IoC container
- Layered architecture within each module: Controller → Service → Database
- Role-Based Access Control (RBAC) with permissions system
- Global exception handling and response formatting
- Multi-tenant design scoped by hospital_id

## Layers

**Presentation Layer (Controllers):**
- Purpose: HTTP request handling, input validation, route definitions
- Location: `src/*/[name].controller.ts`
- Contains: Route handlers decorated with `@Controller()`, guards, decorators
- Depends on: Service layer, Guards, DTOs
- Used by: External HTTP clients

**Business Logic Layer (Services):**
- Purpose: Core business logic, data transformation, orchestration
- Location: `src/*/[name].service.ts`
- Contains: Business rules, query building, data operations
- Depends on: DatabaseService (Prisma), other services
- Used by: Controllers

**Data Access Layer (Database):**
- Purpose: Database connection and Prisma client management
- Location: `src/database/database.service.ts`
- Contains: PrismaClient extension with lifecycle hooks
- Depends on: PostgreSQL via pg Pool
- Used by: All services via dependency injection

**Configuration Layer:**
- Purpose: Environment validation and typed config access
- Location: `src/config/`
- Contains: Joi validation schema, config factory, helper service
- Key files:
  - `src/config/app.config.ts` - Joi validation schema and config factory
  - `src/config/config.helper.ts` - AppConfigService for typed access
  - `src/config/module.config.ts` - Module definition

**Common Layer (Shared):**
- Purpose: Cross-cutting concerns, shared utilities
- Location: `src/common/`
- Contains: Filters, interceptors, helpers, interfaces, shared DTOs
- Key files:
  - `src/common/filters/http-expception.filter.ts` - Global exception formatting
  - `src/common/interceptors/response.interceptor.ts` - Standard API response wrapper
  - `src/common/helpers/paginate.helper.ts` - Pagination utilities
  - `src/common/dto/pagination.dto.ts` - Shared pagination DTO
  - `src/common/interfaces/requested-user.interface.ts` - User context interface

## Data Flow

**Standard Request Flow:**

1. HTTP request received by Express server (`src/main.ts`)
2. Global `ValidationPipe` validates request body/query against DTO
3. Route matched to Controller method
4. Guards execute in order: `JwtAuthGuard` → `PermissionsGuard`/`RolesGuard`
5. Controller method invokes Service method
6. Service queries/mutates via `DatabaseService` (Prisma)
7. Service returns `{ message, data }` object
8. `ResponseInterceptor` wraps response in standard format
9. Client receives JSON response

**Authentication Flow:**

1. Client POSTs credentials to `/auth/login`
2. `AuthService.login()` validates credentials via `UsersService`
3. On success, generates access_token and refresh_token via `JwtService`
4. Subsequent requests include Bearer token in Authorization header
5. `JwtAuthGuard` → `JwtStrategy.validate()` extracts user from token
6. User permissions loaded from database and attached to request
7. `@CurrentUser()` decorator provides user context to controllers

**State Management:**
- Stateless REST API - no server-side session
- User context derived from JWT on each request
- Hospital scoping via `user.hospital_id` from JWT payload

## Key Abstractions

**DatabaseService:**
- Purpose: Singleton Prisma client with connection pooling
- Location: `src/database/database.service.ts`
- Pattern: Extends PrismaClient, implements OnModuleInit/OnModuleDestroy
- Usage: Injected into services as `private prisma: DatabaseService`

**RequestedUser Interface:**
- Purpose: Typed representation of authenticated user context
- Location: `src/common/interfaces/requested-user.interface.ts`
- Contains: `id`, `user_name`, `role`, `permissions[]`, `hospital_id?`
- Pattern: Attached to Express Request by JwtStrategy

**Guards:**
- `JwtAuthGuard` (`src/auth/guards/jwt-auth.guard.ts`): Authentication
- `RolesGuard` (`src/auth/guards/roles.guard.ts`): Role-based authorization
- `PermissionsGuard` (`src/auth/guards/permissions.guard.ts`): Permission-based authorization

**Decorators:**
- `@Roles()` (`src/auth/decorators/roles.decortor.ts`): Declares required roles
- `@Permissions()` (`src/auth/decorators/permissions.decorator.ts`): Declares required permissions
- `@CurrentUser()` (`src/auth/decorators/current-user.decorator.ts`): Extracts user from request

## Entry Points

**Application Bootstrap:**
- Location: `src/main.ts`
- Triggers: `pnpm start`, `pnpm start:dev`, `pnpm start:prod`
- Responsibilities:
  - Creates NestJS application from `AppModule`
  - Registers global filters, interceptors, pipes
  - Configures Swagger documentation at `/docs`
  - Enables CORS
  - Starts HTTP server on configured port

**Root Module:**
- Location: `src/app.module.ts`
- Triggers: Imported by bootstrap
- Responsibilities:
  - Imports all feature modules
  - Configures global ConfigModule with Joi validation
  - Wires DatabaseModule as global provider

**Database Seeding:**
- Location: `prisma/seed.ts`
- Triggers: `pnpm db:seed`
- Responsibilities:
  - Creates roles (ADMIN, STAFF, USER)
  - Creates permissions (CRUD for each domain)
  - Links permissions to roles
  - Creates sample hospitals and users

## Error Handling

**Strategy:** Centralized exception filter with standardized response format

**Patterns:**
- `HttpExceptionFilter` (`src/common/filters/http-expception.filter.ts`) catches all HttpExceptions
- Services throw NestJS built-in exceptions: `NotFoundException`, `ConflictException`, `UnauthorizedException`, `ForbiddenException`, `BadRequestException`
- Filter formats errors as:
  ```json
  {
    "success": false,
    "statusCode": 404,
    "message": "User not found",
    "path": "/users/123",
    "timestamp": "2025-01-23T..."
  }
  ```

**Success Response Format:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User fetched successfully",
  "data": { ... },
  "timestamp": "2025-01-23T..."
}
```

## Cross-Cutting Concerns

**Logging:**
- Prisma logs: `['error', 'warn']` configured in DatabaseService
- Application logs: `console.log()` in bootstrap, no formal logging framework

**Validation:**
- Global `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
- DTOs use `class-validator` decorators
- Environment validation via Joi schema in `src/config/app.config.ts`

**Authentication:**
- JWT-based with access and refresh tokens
- Passport.js with `passport-jwt` strategy
- Tokens generated via `@nestjs/jwt`
- Access token: 7d default expiry
- Refresh token: 30d default expiry

**Authorization:**
- Three roles: ADMIN, STAFF, USER
- Permission-based with string identifiers (e.g., `user.access`, `donation.create`)
- Guards check roles/permissions against user context from JWT
- Hospital scoping: Users see only data from their assigned hospital

**Database:**
- PostgreSQL via `pg` driver with `@prisma/adapter-pg`
- Prisma ORM for type-safe queries
- Schema: `prisma/schema.prisma`
- Generated client: `prisma/generated/`

---

*Architecture analysis: 2025-01-23*
