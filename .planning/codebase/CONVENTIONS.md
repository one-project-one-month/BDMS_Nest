# Coding Conventions

**Analysis Date:** 2025-01-13

## Naming Patterns

**Files:**
- Module files: `kebab-case.module.ts` (e.g., `blood-inventory.module.ts`)
- Service files: `kebab-case.service.ts` (e.g., `users.service.ts`)
- Controller files: `kebab-case.controller.ts` (e.g., `auth.controller.ts`)
- Test files: `kebab-case.service.spec.ts` or `kebab-case.controller.spec.ts`
- DTO files: `kebab-case.dto.ts` (e.g., `create-user.dto.ts`, `update-password.dto.ts`)
- Guard files: `kebab-case.guard.ts` (e.g., `jwt-auth.guard.ts`)
- Strategy files: `kebab-case.strategy.ts` (e.g., `jwt.strategy.ts`)
- Decorator files: `kebab-case.decorator.ts` (e.g., `current-user.decorator.ts`)
- Interface files: `kebab-case.interface.ts` (e.g., `requested-user.interface.ts`)
- Helper files: `kebab-case.helper.ts` (e.g., `paginate.helper.ts`)
- Filter files: `kebab-case.filter.ts` (e.g., `http-expception.filter.ts`)
- Interceptor files: `kebab-case.interceptor.ts` (e.g., `response.interceptor.ts`)

**Functions:**
- Use camelCase for all function names
- Service methods: verbs like `create`, `findAll`, `findOne`, `update`, `remove`, `findById`, `findByUsername`
- Private helper methods: prefix with descriptive verb (e.g., `generateTokens`, `checkExistsByUsername`)
- Controller methods: match HTTP semantics (e.g., `getHello`, `getProfile`, `updatePassword`)

**Variables:**
- Use camelCase for local variables: `isPasswordValid`, `hasPermission`, `effectivePermissions`
- Database fields use snake_case to match Prisma schema: `user_name`, `hospital_id`, `created_at`
- DTOs use snake_case for properties that map to database fields

**Types:**
- Use PascalCase for class names: `UsersService`, `JwtAuthGuard`, `CreateUserDto`
- Use PascalCase for interfaces: `RequestedUser`, `ApiResponse<T>`, `PaginatedResult`
- Use PascalCase for enums: `BloodGroup`, `DonationStatus`, `UrgencyLevel`

**Constants:**
- Use UPPER_SNAKE_CASE for decorator keys: `ROLES_KEY`, `PERMISSIONS_KEY`

## Code Style

**Formatting:**
- Tool: Prettier v3.4.2
- Config: `.prettierrc`
- Single quotes: `true`
- Trailing commas: `all`
- Tab width: Default (2 spaces)
- End of line: `auto` (configured in ESLint)

**Linting:**
- Tool: ESLint v9 with TypeScript-ESLint
- Config: `eslint.config.mjs` (flat config format)
- Key rules:
  - `@typescript-eslint/no-explicit-any`: off
  - `@typescript-eslint/no-floating-promises`: warn
  - `@typescript-eslint/no-unsafe-argument`: warn
  - `prettier/prettier`: error with `endOfLine: auto`
- Pre-commit: Husky runs `lint-staged` which formats `*.{ts,tsx,js,json,md}` with Prettier

**TypeScript:**
- Target: ES2023
- Module: nodenext
- Strict null checks: enabled
- No implicit any: disabled (allows `any`)
- Decorators: enabled (`experimentalDecorators`, `emitDecoratorMetadata`)

## Import Organization

**Order:**
1. NestJS framework imports (`@nestjs/common`, `@nestjs/core`, etc.)
2. Third-party libraries (`bcryptjs`, `passport-jwt`, `rxjs`)
3. Internal absolute path imports (`src/common/...`, `src/auth/...`)
4. Relative imports (`../database/database.service`, `./dto/...`)

**Path Aliases:**
- `src/` → `<rootDir>/` (configured in Jest moduleNameMapper)
- `prisma/generated/client` → `./prisma/generated/client` (TypeScript paths)

**Import Style:**
```typescript
// Destructured imports preferred
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

// Namespace import for interfaces (observed pattern)
import * as requestedUserInterface from 'src/common/interfaces/requested-user.interface';

// Wildcard import for bcrypt
import * as bcrypt from 'bcryptjs';
```

## Error Handling

**Patterns:**
- Use NestJS built-in HTTP exceptions: `NotFoundException`, `ConflictException`, `UnauthorizedException`, `BadRequestException`, `ForbiddenException`, `InternalServerErrorException`
- Throw exceptions directly in service methods — do not catch and rethrow
- Global `HttpExceptionFilter` (`src/common/filters/http-expception.filter.ts`) standardizes error responses

**Exception Response Format:**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "User not found",
  "path": "/users/123",
  "timestamp": "2025-01-13T00:00:00.000Z"
}
```

**Guard Pattern:**
- Guards throw `ForbiddenException` for authorization failures
- JWT strategy throws `UnauthorizedException` for invalid/inactive users

**Validation Errors:**
- `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
- Uses `class-validator` decorators on DTOs

## Logging

**Framework:** No dedicated logging framework — uses `console.log`, `console.error`

**Patterns:**
- Startup: `console.log('Application is running on: ${url}')`
- Fatal errors: `console.error('Failed to start application:', error)`
- Prisma logs: `['error', 'warn']` level configured in `DatabaseService`

## Comments

**When to Comment:**
- Explain non-obvious business logic
- Document scope restrictions (e.g., `// admin only: list all STAFF in their hospital`)
- Mark internal helper methods (e.g., `// internal use only - no response formatting`)
- TODO comments for future improvements

**JSDoc/TSDoc:**
- Not widely used — method purposes are inferred from naming
- No JSDoc on public API methods currently

## Function Design

**Size:** 
- Keep methods focused — typically under 30 lines
- Extract shared logic into private helper methods or helpers directory

**Parameters:**
- Use DTOs for request bodies (`CreateUserDto`, `LoginDto`)
- Use query DTOs for pagination/filtering (`PaginationDto`, `DonationsQueryDto`)
- Extract user from request via `@CurrentUser()` decorator

**Return Values:**
- Service methods return structured objects with `message` and `data` properties:
```typescript
return {
  message: 'User registered successfully',
  data: user,
};
```
- Response interceptor transforms all responses to standard format:
```typescript
{
  success: true,
  statusCode: 200,
  message: 'Request successful',
  data: { ... },
  timestamp: '2025-01-13T00:00:00.000Z'
}
```

## Module Design

**Exports:**
- Services export from modules for dependency injection
- Module re-exports when wrapping (e.g., `AuthModule` exports `JwtModule`)
- No barrel files (`index.ts`) — import directly from source files

**Barrel Files:**
- Not used — import each file directly

## Controller Patterns

**Route Guards:**
- Apply `@UseGuards()` at controller level for common guards
- Apply additional guards at method level when needed
- Order: `JwtAuthGuard` → `RolesGuard` → `PermissionsGuard`

**Decorator Stacking:**
```typescript
@UseGuards(RolesGuard)
@Roles('ADMIN')
@Permissions('user.update')
@Patch(':id/toggle-active')
toggleActive(@Param('id') id: string) { ... }
```

**Parameter Extraction:**
- Use `@Param('id')` for route parameters
- Use `@Body()` for request bodies
- Use `@Query()` for query parameters
- Use `@CurrentUser()` custom decorator for authenticated user

## Service Patterns

**Dependency Injection:**
```typescript
@Injectable()
export class UsersService {
  constructor(private prisma: DatabaseService) {}
}
```

**Database Operations:**
- Use Prisma client via `DatabaseService`
- Define reusable select objects as class properties:
```typescript
private readonly selectUser: Prisma.UserSelect = {
  id: true,
  password: false,  // Exclude sensitive fields
  // ...
};
```

**Pagination Pattern:**
```typescript
async findAll(dto: PaginationDto) {
  const { page, limit, search } = dto;
  const { skip, take } = paginate(page, limit);
  
  const [data, total] = await Promise.all([
    this.prisma.model.findMany({ where, skip, take }),
    this.prisma.model.count({ where }),
  ]);
  
  return {
    message: 'Records fetched successfully',
    data: paginatedResult(data, total, page, limit),
  };
}
```

## DTO Patterns

**Validation Decorators:**
```typescript
export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  user_name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsUUID()
  hospital_id?: string;
}
```

**Common Validators:**
- `@IsNotEmpty()` — required fields
- `@IsString()` — string type
- `@IsEmail()` — email format
- `@IsUUID()` — UUID format
- `@MinLength(n)` — minimum string length
- `@IsOptional()` — optional fields
- `@IsPositive()` — positive numbers
- `@IsEnum([...])` — enum values
- `@Type(() => Number)` — type transformation

---

*Convention analysis: 2025-01-13*
