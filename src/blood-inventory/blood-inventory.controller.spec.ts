import { Test, TestingModule } from '@nestjs/testing';
import { BloodInventoryController } from './blood-inventory.controller';
import { BloodInventoryService } from './blood-inventory.service';

describe('BloodInventoryController', () => {
  let controller: BloodInventoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BloodInventoryController],
      providers: [BloodInventoryService],
    }).compile();

    controller = module.get<BloodInventoryController>(BloodInventoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
