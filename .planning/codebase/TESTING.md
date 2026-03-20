# Testing Patterns

**Analysis Date:** 2025-01-13

## Test Framework

**Runner:**
- Jest v30.0.0
- Config: `package.json` (inline `jest` configuration)

**Assertion Library:**
- Jest built-in (`expect`)

**Run Commands:**
```bash
pnpm test                # Run all unit tests
pnpm test:watch          # Watch mode
pnpm test:cov            # Run with coverage
pnpm test:debug          # Debug with inspector
pnpm test:e2e            # Run E2E tests (separate config)
```

## Test Configuration

**Unit Tests (package.json):**
```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": ["ts-jest", {...}]
    },
    "moduleNameMapper": {
      "^src/(.*)$": "<rootDir>/$1",
      "^(\\.{1,2}/.*)\\.js$": "$1"
    },
    "testPathIgnorePatterns": ["node_modules", "dist"],
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

**E2E Tests (`test/jest-e2e.json`):**
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

## Test File Organization

**Location:**
- Unit tests: Co-located with source files in `src/` directories
- E2E tests: Separate `test/` directory

**Naming:**
- Unit tests: `*.spec.ts` (e.g., `users.service.spec.ts`, `auth.controller.spec.ts`)
- E2E tests: `*.e2e-spec.ts` (e.g., `app.e2e-spec.ts`)

**Structure:**
```
src/
├── users/
│   ├── users.service.ts
│   ├── users.service.spec.ts      # Service tests
│   ├── users.controller.ts
│   └── users.controller.spec.ts   # Controller tests
├── auth/
│   ├── auth.service.ts
│   ├── auth.service.spec.ts
│   ├── auth.controller.ts
│   └── auth.controller.spec.ts
test/
├── app.e2e-spec.ts                # E2E tests
└── jest-e2e.json                  # E2E config
```

## Test Structure

**Suite Organization:**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DatabaseService } from '../database/database.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// Mock external dependencies at module level
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let databaseService: {
    role: { findUnique: jest.Mock };
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      // ... typed mock methods
    };
  };
  const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

  beforeEach(async () => {
    // Reset mocks before each test
    databaseService = {
      role: { findUnique: jest.fn() },
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        // ...
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DatabaseService,
          useValue: databaseService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('methodName', () => {
    it('should do something specific', async () => {
      // Arrange
      databaseService.user.findUnique.mockResolvedValue({ id: 'user-1' });
      
      // Act & Assert
      await expect(service.findById('user-1')).resolves.toEqual({ id: 'user-1' });
    });

    it('should throw when condition fails', async () => {
      databaseService.user.findUnique.mockResolvedValue(null);
      
      await expect(service.findById('missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
```

**Patterns:**
- Setup: Use `beforeEach` with NestJS `Test.createTestingModule()`
- No `afterEach` cleanup needed — mocks reset in `beforeEach`
- Group related tests with nested `describe()` blocks by method name
- Include baseline "should be defined" test for every service/controller

## Mocking

**Framework:** Jest built-in mocking

**Module-Level Mocking (External Libraries):**
```typescript
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// In test:
mockedBcrypt.hash.mockResolvedValueOnce('hashed-password' as never);
mockedBcrypt.compare.mockResolvedValueOnce(true as never);
```

**Service Mocking (Typed Mock Objects):**
```typescript
let databaseService: {
  role: { findUnique: jest.Mock };
  user: {
    findUnique: jest.Mock;
    create: jest.Mock;
    findMany: jest.Mock;
    count: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

beforeEach(async () => {
  databaseService = {
    role: { findUnique: jest.fn() },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      UsersService,
      { provide: DatabaseService, useValue: databaseService },
    ],
  }).compile();
});
```

**Config Service Mocking:**
```typescript
{
  provide: AppConfigService,
  useValue: {
    jwtSecret: 'jwt-secret',
    jwtExpiresIn: '7d',
    jwtRefreshSecret: 'jwt-refresh-secret',
    jwtRefreshExpiresIn: '30d',
  },
}
```

**What to Mock:**
- Database services (`DatabaseService` / Prisma client)
- External libraries (`bcryptjs`, `JwtService`)
- Configuration services (`AppConfigService`)
- Other internal services when testing controllers

**What NOT to Mock:**
- The class under test
- Pure utility functions (test them directly)
- Simple value objects/DTOs

## Fixtures and Factories

**Test Data:**
```typescript
// Define inline in describe block or test
const activeUser = {
  id: 'user-1',
  user_name: 'john',
  email: 'john@example.com',
  password: 'hashed-password',
  is_active: true,
  hospital_id: null,
  role: {
    name: 'USER',
    role_permissions: [
      { permission: { name: 'user.view' } },
      { permission: { name: 'donation.view' } },
    ],
  },
};

// Use spread to modify for test cases
{ ...activeUser, is_active: false }
```

**Location:**
- Test data defined inline within spec files
- No shared fixtures directory — each test file is self-contained
- Repeated data duplicated across test files (not DRY, but explicit)

## Coverage

**Requirements:** No enforced thresholds currently

**View Coverage:**
```bash
pnpm test:cov
# Output: ../coverage directory with HTML report
```

**Coverage Config:**
```json
{
  "collectCoverageFrom": ["**/*.(t|j)s"],
  "coverageDirectory": "../coverage"
}
```

## Test Types

**Unit Tests:**
- Scope: Individual services and controllers
- Location: `src/**/*.spec.ts`
- Test count: 39 tests across 20 test suites
- Pattern: Isolate class under test with mocked dependencies

**Integration Tests:**
- Not currently implemented
- Would test service layer with real database

**E2E Tests:**
- Framework: Supertest v7.0.0
- Location: `test/app.e2e-spec.ts`
- Pattern: Full NestJS application bootstrap
- Current coverage: Single smoke test (`/ (GET)`)

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
```

## Common Patterns

**Async Testing:**
```typescript
// Use async/await with expect().resolves or expect().rejects
it('should return user when found', async () => {
  databaseService.user.findUnique.mockResolvedValue({ id: 'user-1' });
  
  await expect(service.findById('user-1')).resolves.toEqual({ id: 'user-1' });
});

it('should throw when user not found', async () => {
  databaseService.user.findUnique.mockResolvedValue(null);
  
  await expect(service.findById('missing')).rejects.toBeInstanceOf(NotFoundException);
});
```

**Error Testing:**
```typescript
it('should throw ConflictException when username exists', async () => {
  databaseService.user.findUnique.mockResolvedValue({ id: 'existing' });
  
  await expect(
    service.create({ user_name: 'john', email: 'j@x.com', password: 'pass', role_id: 'r1' }),
  ).rejects.toBeInstanceOf(ConflictException);
});

it('should throw UnauthorizedException for wrong password', async () => {
  usersService.findByUsername.mockResolvedValue(activeUser);
  mockedBcrypt.compare.mockResolvedValueOnce(false as never);
  
  await expect(
    service.login({ user_name: 'john', password: 'wrong' }),
  ).rejects.toBeInstanceOf(UnauthorizedException);
});
```

**Verifying Mock Calls:**
```typescript
it('should hash password and create user', async () => {
  databaseService.user.findUnique.mockResolvedValue(null);
  mockedBcrypt.hash.mockResolvedValueOnce('hashed' as never);
  databaseService.user.create.mockResolvedValue({ id: 'new-user' });
  
  await service.create({ user_name: 'john', ... });
  
  expect(databaseService.user.create).toHaveBeenCalledTimes(1);
  expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 10);
});

it('should call update with correct parameters', async () => {
  // ...setup...
  
  expect(databaseService.user.update).toHaveBeenCalledWith(
    expect.objectContaining({
      where: { id: 'user-1' },
      data: { role_id: 'role-staff' },
    }),
  );
});
```

**Controller Tests (Minimal):**
```typescript
describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        { provide: DatabaseService, useValue: {} },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
```

## Test Status Summary

**Current State (20 test suites, 39 tests):**

| Module | Service Tests | Controller Tests |
|--------|--------------|------------------|
| `users` | 6 tests (full coverage) | 1 test (existence only) |
| `auth` | 10 tests (full coverage) | 1 test (existence only) |
| `donations` | 1 test (existence only) | 1 test (existence only) |
| `appointments` | 1 test (existence only) | 1 test (existence only) |
| `announcements` | 1 test (existence only) | 1 test (existence only) |
| `blood-inventory` | 1 test (existence only) | 1 test (existence only) |
| `certificates` | 1 test (existence only) | 1 test (existence only) |
| `medical-records` | 1 test (existence only) | 1 test (existence only) |
| `requests` | 1 test (existence only) | 1 test (existence only) |
| `database` | 1 test (existence only) | N/A |
| `app` | N/A | 1 test |

**Gaps:**
- Most modules have only "should be defined" tests
- Only `users` and `auth` services have meaningful test coverage
- Controller tests don't verify route behavior, guards, or decorators
- E2E tests are minimal (single endpoint)

---

*Testing analysis: 2025-01-13*
