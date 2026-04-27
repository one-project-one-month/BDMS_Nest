import { Module } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsRepository } from './announcements.repository';

@Module({
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService, AnnouncementsRepository],
})
export class AnnouncementsModule {}
