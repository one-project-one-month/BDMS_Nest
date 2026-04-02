import { Test, TestingModule } from '@nestjs/testing';
import { BloodInventoryService } from './blood-inventory.service';
import { DatabaseService } from '../database/database.service';

describe('BloodInventoryService', () => {
  let service: BloodInventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BloodInventoryService,
        {
          provide: DatabaseService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<BloodInventoryService>(BloodInventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
