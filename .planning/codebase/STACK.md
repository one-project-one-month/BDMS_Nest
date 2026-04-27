# Technology Stack

**Analysis Date:** 2025-01-28

## Languages

**Primary:**
- TypeScript 5.7.3 - All application code (`src/**/*.ts`)
- Target: ES2023

**Secondary:**
- SQL (via Prisma schema) - Database definitions (`prisma/schema.prisma`)

## Runtime

**Environment:**
- Node.js 22.x (CI), 24.x (local development)
- Target ES2023 with ESM module resolution (`nodenext`)

**Package Manager:**
- pnpm 10.29.2
- Lockfile: `pnpm-lock.yaml` (present, lockfileVersion 9.0)

## Frameworks

**Core:**
- NestJS 11.x - Backend framework
  - `@nestjs/core` 11.0.1
  - `@nestjs/common` 11.0.1
  - `@nestjs/platform-express` 11.0.1 (Express HTTP adapter)

**Authentication:**
- `@nestjs/passport` 11.0.5 - Passport integration
- `@nestjs/jwt` 11.0.2 - JWT token handling
- `passport-jwt` 4.0.1 - JWT strategy implementation
- `bcryptjs` 3.0.3 - Password hashing

**Database:**
- Prisma 7.4.1 - ORM and database toolkit
- `@prisma/adapter-pg` 7.4.1 - PostgreSQL driver adapter
- `pg` 8.18.0 - PostgreSQL client

**Validation:**
- `class-validator` 0.14.3 - DTO validation decorators
- `class-transformer` 0.5.1 - DTO transformation
- `joi` 18.0.2 - Environment variable validation

**Documentation:**
- `@nestjs/swagger` 11.0.6 - OpenAPI/Swagger integration

**Testing:**
- Jest 30.0.0 - Test runner
- `ts-jest` 29.2.5 - TypeScript support for Jest
- `supertest` 7.0.0 - HTTP integration testing
- `@nestjs/testing` 11.0.1 - NestJS testing utilities

**Build/Dev:**
- NestJS CLI 11.0.0 - Build and development tooling
- `tsx` 4.21.0 - TypeScript execution (used for seed script)
- `ts-node` 10.9.2 - TypeScript execution
- `source-map-support` 0.5.21 - Stack trace support

**Linting/Formatting:**
- ESLint 9.18.0 with flat config (`eslint.config.mjs`)
- Prettier 3.4.2
- `typescript-eslint` 8.20.0
- Husky 9.1.7 - Git hooks
- `lint-staged` 16.2.1 - Pre-commit linting

## Key Dependencies

**Critical:**
- `@nestjs/core` - Application foundation
- `@prisma/client` 7.4.1 - Database queries
- `passport-jwt` - Authentication strategy
- `bcryptjs` - Password security

**Infrastructure:**
- `rxjs` 7.8.1 - Reactive programming (NestJS dependency)
- `reflect-metadata` 0.2.2 - Decorator support
- `ms` 2.1.3 - Time string parsing (JWT expiration)

**Type Definitions:**
- `@types/node` 22.10.7
- `@types/express` 5.0.0
- `@types/jest` 30.0.0
- `@types/bcryptjs` 3.0.0
- `@types/passport-jwt` 4.0.1
- `@types/pg` 8.16.0
- `@types/supertest` 6.0.2
- `@types/ms` 2.1.0

## Configuration

**Environment:**
- Configuration via `@nestjs/config` with `.env` files
- Validation schema: `src/config/app.config.ts` (using Joi)
- Config helper: `src/config/config.helper.ts` (typed access)

**Required env vars:**
| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |
| `APP_NAME` | Application name | `BloodDonationManagementSystem` |
| `DATABASE_URL` | PostgreSQL connection string | **Required** |
| `JWT_SECRET` | JWT signing secret | **Required** |
| `JWT_EXPIRES_IN` | Access token TTL | `7d` |
| `JWT_REFRESH_SECRET` | Refresh token secret | **Required** |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | `30d` |

**Build:**
- `tsconfig.json` - TypeScript configuration
- `tsconfig.build.json` - Production build configuration
- `nest-cli.json` - NestJS CLI configuration

## TypeScript Configuration

**Key settings:**
```json
{
  "module": "nodenext",
  "moduleResolution": "nodenext",
  "target": "ES2023",
  "emitDecoratorMetadata": true,
  "experimentalDecorators": true,
  "strictNullChecks": true
}
```

**Path aliases:**
- `prisma/generated/client` → `./prisma/generated/client`

## Scripts

**Development:**
```bash
pnpm start:dev      # Watch mode development
pnpm start:debug    # Debug mode with inspector
pnpm start          # Single run
```

**Build:**
```bash
pnpm build          # Production build to dist/
pnpm start:prod     # Run production build
```

**Database:**
```bash
pnpm db:start       # Start Docker PostgreSQL
pnpm db:generate    # Generate Prisma client
pnpm db:migrate     # Run migrations
pnpm db:push        # Push schema changes
pnpm db:seed        # Seed database
pnpm db:studio      # Open Prisma Studio
```

**Quality:**
```bash
pnpm lint           # Lint and fix
pnpm lint:check     # Lint without fixing
pnpm format         # Format with Prettier
pnpm test           # Run unit tests
pnpm test:cov       # Run with coverage
pnpm test:e2e       # Run e2e tests
```

## Platform Requirements

**Development:**
- Node.js 22+ (CI runs on 22, local on 24)
- pnpm 10.29.2+
- Docker (for PostgreSQL container)
- PostgreSQL 15 (via Docker)

**Production:**
- Node.js 22+
- PostgreSQL 15 database
- Environment variables configured

---

*Stack analysis: 2025-01-28*
