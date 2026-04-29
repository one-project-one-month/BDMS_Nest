import { Module } from '@nestjs/common';
import { DonorsController } from './donors.controller';
import { DonorsService } from './donors.service';
import { DonorsRepository } from './donors.repository';

@Module({
  controllers: [DonorsController],
  providers: [DonorsService, DonorsRepository],
  exports: [DonorsService],
})
export class DonorsModule {}
