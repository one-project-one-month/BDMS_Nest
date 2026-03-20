# Codebase Structure

**Analysis Date:** 2025-01-23

## Directory Layout

```
BDMS_Nest/
├── src/                        # Application source code
│   ├── main.ts                 # Application entry point
│   ├── app.module.ts           # Root module
│   ├── app.controller.ts       # Root controller (health check)
│   ├── app.service.ts          # Root service
│   ├── auth/                   # Authentication module
│   ├── users/                  # Users module
│   ├── donations/              # Donations module
│   ├── requests/               # Blood requests module
│   ├── blood-inventory/        # Blood inventory module
│   ├── appointments/           # Appointments module
│   ├── announcements/          # Announcements module
│   ├── medical-records/        # Medical records module
│   ├── certificates/           # Certificates module
│   ├── database/               # Database connection module
│   ├── config/                 # Configuration module
│   └── common/                 # Shared utilities
├── prisma/                     # Database schema and migrations
│   ├── schema.prisma           # Prisma schema definition
│   ├── seed.ts                 # Database seeding script
│   ├── migrations/             # Database migrations
│   └── generated/              # Generated Prisma client
├── test/                       # E2E test files
├── dist/                       # Compiled output (generated)
├── node_modules/               # Dependencies (generated)
└── [config files]              # Root configuration files
```

## Directory Purposes

**`src/`:**
- Purpose: All application source code
- Contains: Modules, services, controllers, DTOs, common utilities
- Key files: `main.ts` (bootstrap), `app.module.ts` (root module)

**`src/auth/`:**
- Purpose: Authentication and authorization logic
- Contains: Login/register, JWT strategies, guards, decorators
- Key files:
  - `auth.controller.ts` - Auth endpoints
  - `auth.service.ts` - Auth business logic
  - `auth.module.ts` - Module definition
  - `strategies/jwt.strategy.ts` - JWT validation
  - `guards/jwt-auth.guard.ts` - Authentication guard
  - `guards/roles.guard.ts` - Role-based guard
  - `guards/permissions.guard.ts` - Permission-based guard
  - `decorators/current-user.decorator.ts` - User extraction
  - `decorators/roles.decortor.ts` - Role decorator
  - `decorators/permissions.decorator.ts` - Permission decorator
  - `dto/` - Request validation DTOs

**`src/users/`:**
- Purpose: User management (CRUD, role updates)
- Contains: User CRUD operations, profile management
- Key files:
  - `users.controller.ts` - User endpoints
  - `users.service.ts` - User business logic
  - `users.module.ts` - Module definition
  - `dto/create-user.dto.ts` - User creation validation
  - `dto/update-user.dto.ts` - User update validation
  - `dto/update-user-role.dto.ts` - Role update validation

**`src/donations/`:**
- Purpose: Blood donation management
- Contains: Donation CRUD, status management (stub implementation)
- Key files:
  - `donations.controller.ts` - Donation endpoints
  - `donations.service.ts` - Donation logic
  - `dto/` - Request validation

**`src/requests/`:**
- Purpose: Blood request management
- Contains: Request CRUD, urgency handling (stub implementation)
- Key files:
  - `requests.controller.ts` - Request endpoints
  - `requests.service.ts` - Request logic
  - `dto/` - Request validation

**`src/blood-inventory/`:**
- Purpose: Blood inventory tracking
- Contains: Inventory CRUD (stub implementation)
- Key files:
  - `blood-inventory.controller.ts` - Inventory endpoints
  - `blood-inventory.service.ts` - Inventory logic
  - `dto/` - Request validation

**`src/appointments/`:**
- Purpose: Appointment scheduling
- Contains: Appointment CRUD (stub implementation)
- Key files: Same structure as other feature modules

**`src/announcements/`:**
- Purpose: System announcements
- Contains: Announcement CRUD (stub implementation)
- Key files: Same structure as other feature modules

**`src/medical-records/`:**
- Purpose: Medical screening records
- Contains: Medical record management (stub implementation)
- Key files: Same structure as other feature modules

**`src/certificates/`:**
- Purpose: Donation certificates
- Contains: Certificate management (stub implementation)
- Key files: Same structure as other feature modules

**`src/database/`:**
- Purpose: Database connection management
- Contains: Prisma client singleton
- Key files:
  - `database.module.ts` - Global module definition
  - `database.service.ts` - PrismaClient extension with pg adapter

**`src/config/`:**
- Purpose: Environment configuration
- Contains: Config validation, typed accessors
- Key files:
  - `app.config.ts` - Joi schema, config factory
  - `config.helper.ts` - AppConfigService with typed getters
  - `module.config.ts` - Config module definition

**`src/common/`:**
- Purpose: Shared utilities and types
- Contains: Filters, interceptors, helpers, interfaces, DTOs
- Key files:
  - `filters/http-expception.filter.ts` - Global exception handler
  - `interceptors/response.interceptor.ts` - Response wrapper
  - `helpers/paginate.helper.ts` - Pagination utilities
  - `dto/pagination.dto.ts` - Shared pagination DTO
  - `interfaces/requested-user.interface.ts` - User context type
  - `interfaces/paginated-result.interface.ts` - Pagination result type

**`prisma/`:**
- Purpose: Database schema, migrations, seeding
- Contains: Prisma schema, generated client, seed data
- Key files:
  - `schema.prisma` - Database schema definition
  - `seed.ts` - Database seeding script
  - `migrations/` - SQL migrations
  - `generated/` - Generated Prisma client (gitignored)

**`test/`:**
- Purpose: End-to-end tests
- Contains: E2E test files and configuration
- Key files:
  - `app.e2e-spec.ts` - E2E test suite
  - `jest-e2e.json` - E2E Jest config

## Key File Locations

**Entry Points:**
- `src/main.ts`: Application bootstrap, global middleware setup
- `src/app.module.ts`: Root module importing all feature modules

**Configuration:**
- `package.json`: Scripts, dependencies, Jest config
- `tsconfig.json`: TypeScript configuration
- `nest-cli.json`: NestJS CLI configuration
- `eslint.config.mjs`: ESLint configuration
- `.prettierrc`: Prettier configuration
- `docker-compose.yml`: PostgreSQL database container

**Core Logic:**
- `src/auth/auth.service.ts`: Authentication (login, register, tokens)
- `src/users/users.service.ts`: User management (complete implementation)
- `src/database/database.service.ts`: Database connection

**Testing:**
- `src/**/*.spec.ts`: Unit tests (co-located)
- `test/*.e2e-spec.ts`: E2E tests

## Naming Conventions

**Files:**
- Module files: `[feature].module.ts` (e.g., `users.module.ts`)
- Service files: `[feature].service.ts` (e.g., `users.service.ts`)
- Controller files: `[feature].controller.ts` (e.g., `users.controller.ts`)
- Unit test files: `[file].spec.ts` (e.g., `users.service.spec.ts`)
- DTO files: `[action]-[entity].dto.ts` (e.g., `create-user.dto.ts`)
- Guard files: `[name].guard.ts` (e.g., `jwt-auth.guard.ts`)
- Strategy files: `[name].strategy.ts` (e.g., `jwt.strategy.ts`)
- Decorator files: `[name].decorator.ts` (e.g., `current-user.decorator.ts`)
- Interface files: `[name].interface.ts` (e.g., `requested-user.interface.ts`)
- Helper files: `[name].helper.ts` (e.g., `paginate.helper.ts`)

**Directories:**
- Feature modules: kebab-case (e.g., `blood-inventory`, `medical-records`)
- Sub-directories: lowercase plural (e.g., `dto`, `guards`, `strategies`, `decorators`)

**Classes:**
- Services: `[Feature]Service` (e.g., `UsersService`)
- Controllers: `[Feature]Controller` (e.g., `UsersController`)
- Modules: `[Feature]Module` (e.g., `UsersModule`)
- DTOs: `[Action][Entity]Dto` (e.g., `CreateUserDto`)
- Guards: `[Name]Guard` (e.g., `JwtAuthGuard`)
- Strategies: `[Name]Strategy` (e.g., `JwtStrategy`)
- Interfaces: `[Name]` or `[Name]Interface` (e.g., `RequestedUser`)

## Where to Add New Code

**New Feature Module:**
1. Create directory: `src/[feature-name]/`
2. Generate via CLI: `nest g resource [feature-name]`
3. Files created:
   - `[feature-name].module.ts`
   - `[feature-name].controller.ts`
   - `[feature-name].service.ts`
   - `[feature-name].controller.spec.ts`
   - `[feature-name].service.spec.ts`
   - `dto/create-[feature-name].dto.ts`
   - `dto/update-[feature-name].dto.ts`
4. Import module in `src/app.module.ts`

**New DTO:**
- Create in: `src/[feature]/dto/[action]-[entity].dto.ts`
- Shared DTOs: `src/common/dto/[name].dto.ts`

**New Guard:**
- Create in: `src/auth/guards/[name].guard.ts`
- Register in controller via `@UseGuards()`

**New Decorator:**
- Create in: `src/auth/decorators/[name].decorator.ts`
- Pattern: Use `createParamDecorator` or `SetMetadata`

**New Shared Utility:**
- Helpers: `src/common/helpers/[name].helper.ts`
- Interfaces: `src/common/interfaces/[name].interface.ts`
- Filters: `src/common/filters/[name].filter.ts`
- Interceptors: `src/common/interceptors/[name].interceptor.ts`

**New Database Model:**
1. Add model to `prisma/schema.prisma`
2. Run `pnpm db:migrate` to create migration
3. Run `pnpm db:generate` to update Prisma client
4. Update seed script in `prisma/seed.ts` if needed

**Utilities:**
- Shared helpers: `src/common/helpers/`

## Special Directories

**`prisma/generated/`:**
- Purpose: Generated Prisma client code
- Generated: Yes (by `prisma generate`)
- Committed: No (gitignored)

**`dist/`:**
- Purpose: Compiled JavaScript output
- Generated: Yes (by `nest build`)
- Committed: No (gitignored)

**`node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes (by `pnpm install`)
- Committed: No (gitignored)

**`.planning/`:**
- Purpose: Project planning documents
- Generated: No (manual)
- Committed: Yes

**`.husky/`:**
- Purpose: Git hooks (pre-commit linting)
- Generated: By `husky`
- Committed: Yes

## Module Import Pattern

Feature modules follow this import structure:
```typescript
// src/[feature]/[feature].module.ts
import { Module } from '@nestjs/common';
import { [Feature]Service } from './[feature].service';
import { [Feature]Controller } from './[feature].controller';

@Module({
  controllers: [[Feature]Controller],
  providers: [[Feature]Service],
  exports: [[Feature]Service], // If needed by other modules
})
export class [Feature]Module {}
```

DatabaseService is globally available (no import needed) via `DatabaseModule`'s `@Global()` decorator.

---

*Structure analysis: 2025-01-23*
