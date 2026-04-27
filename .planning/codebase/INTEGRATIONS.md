# External Integrations

**Analysis Date:** 2025-01-28

## APIs & External Services

**External APIs:**
- None detected - This is a self-contained backend API

**Third-Party SDKs:**
- None detected - No cloud provider integrations (AWS, Firebase, Stripe, etc.)

## Data Storage

**Databases:**
- PostgreSQL 15
  - Connection: `DATABASE_URL` environment variable
  - Client: Prisma ORM with `@prisma/adapter-pg` driver
  - Schema: `prisma/schema.prisma`
  - Generated client: `prisma/generated/client`

**Database Schema Overview:**
- `Hospital` - Hospital entities
- `User` - System users (linked to Role, Hospital)
- `Role`, `Permission`, `RolePermission` - RBAC system
- `Donor` - Blood donors (linked to User)
- `Donation` - Blood donation records
- `BloodRequest` - Blood requests from hospitals
- `BloodInventory` - Blood stock management
- `Appointment` - Donation appointments
- `MedicalRecord` - Screening and test results
- `Certificate` - Donor certificates
- `Announcement` - System announcements

**File Storage:**
- None configured - No file/blob storage integration

**Caching:**
- None configured - No Redis or in-memory caching

## Authentication & Identity

**Auth Provider:**
- Custom JWT-based authentication

**Implementation:**
- Access tokens: JWT signed with `JWT_SECRET`, expires per `JWT_EXPIRES_IN` (default 7d)
- Refresh tokens: JWT signed with `JWT_REFRESH_SECRET`, expires per `JWT_REFRESH_EXPIRES_IN` (default 30d)
- Password hashing: bcrypt (10 rounds)

**Key Files:**
- `src/auth/auth.service.ts` - Login, register, token generation
- `src/auth/strategies/jwt.strategy.ts` - Access token validation
- `src/auth/strategies/jwt-refresh.strategy.ts` - Refresh token validation
- `src/auth/guards/jwt-auth.guard.ts` - Route protection

**Authorization:**
- Role-based: `src/auth/guards/roles.guard.ts`
- Permission-based: `src/auth/guards/permissions.guard.ts`
- Roles: ADMIN, STAFF, USER
- Permissions: Granular per-resource permissions (defined in `prisma/seed.ts`)

## Monitoring & Observability

**Error Tracking:**
- None configured - No Sentry, Bugsnag, etc.

**Logs:**
- Console logging only
- Prisma logs: `['error', 'warn']` (see `src/database/database.service.ts`)

**Metrics:**
- None configured

## CI/CD & Deployment

**Hosting:**
- Not specified - No deployment configuration found

**CI Pipeline:**
- GitHub Actions (`.github/workflows/ci.yml`)
- Triggers: Push/PR to `dev` and `main` branches
- Steps:
  1. Checkout
  2. Setup pnpm
  3. Setup Node.js 22
  4. Install dependencies (`pnpm install --frozen-lockfile`)
  5. Generate Prisma client (`pnpm run db:generate`)
  6. Lint (`pnpm run lint:check`)
  7. Build (`pnpm run build`)

**Local Development:**
- Docker Compose for PostgreSQL: `docker-compose.yml`
- Container name: `bdms_db`
- Database: `bdms`
- Port: `5432`

## Environment Configuration

**Required env vars:**
| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Access token signing |
| `JWT_REFRESH_SECRET` | ✅ | Refresh token signing |
| `NODE_ENV` | ❌ | Environment (default: development) |
| `PORT` | ❌ | Server port (default: 3000) |
| `APP_NAME` | ❌ | Application name |
| `JWT_EXPIRES_IN` | ❌ | Access token expiry (default: 7d) |
| `JWT_REFRESH_EXPIRES_IN` | ❌ | Refresh token expiry (default: 30d) |

**Config Files:**
- `.env` - Local environment (present, gitignored)
- `.env.example` - Template with placeholder values

**Secrets Location:**
- Environment variables only
- No secrets manager integration

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

## API Documentation

**OpenAPI/Swagger:**
- Available at `/docs` endpoint
- Generated via `@nestjs/swagger`
- Bearer authentication configured
- See `src/main.ts` for setup

## Database Connection

**Connection Pattern:**
```typescript
// src/database/database.service.ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

**Lifecycle:**
- `onModuleInit()` - Connect to database
- `onModuleDestroy()` - Disconnect and close pool

## CORS

**Configuration:**
- Enabled globally via `app.enableCors()` in `src/main.ts`
- No custom CORS settings - uses default (all origins)

## Request Pipeline

**Global Middleware:**
1. `HttpExceptionFilter` - Error response formatting (`src/common/filters/http-expception.filter.ts`)
2. `ResponseInterceptor` - Success response wrapping (`src/common/interceptors/response.interceptor.ts`)
3. `ValidationPipe` - DTO validation with class-validator

**Validation Settings:**
```typescript
new ValidationPipe({
  whitelist: true,           // Strip unknown properties
  forbidNonWhitelisted: true, // Throw on unknown properties
  transform: true,           // Auto-transform to DTO types
})
```

---

*Integration audit: 2025-01-28*
