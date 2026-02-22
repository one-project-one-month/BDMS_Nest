import { Module } from '@nestjs/common';
import { BloodInventoryService } from './blood-inventory.service';
import { BloodInventoryController } from './blood-inventory.controller';

@Module({
  controllers: [BloodInventoryController],
  providers: [BloodInventoryService],
})
export class BloodInventoryModule {}
