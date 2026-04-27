import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { UpdateExpiryDto } from './dto/update-expiry.dto';
import { AnnouncementsQueryDto } from './dto/query/announcements.dto';
import { AnnouncementsRepository } from './announcements.repository';

import { paginate, paginatedResult } from 'src/common/helpers/paginate.helper';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly announcementsRepo: AnnouncementsRepository) {}

  async create(createAnnouncementDto: CreateAnnouncementDto) {
    const { expired_at, ...rest } = createAnnouncementDto;

    const announcement = await this.announcementsRepo.create({
      ...rest,
      ...(expired_at && { expired_at: new Date(expired_at) }),
    });

    return {
      message: 'Announcement created successfully',
      data: announcement,
    };
  }

  async findAll(query: AnnouncementsQueryDto) {
    const { page, limit, is_active, search } = query;
    const { skip, take } = paginate(page, limit);

    const where = this.buildWhere({ is_active, search });

    const [announcements, total] = await Promise.all([
      this.announcementsRepo.findMany(where, skip, take),
      this.announcementsRepo.count(where),
    ]);

    return {
      message: 'Announcements fetched successfully',
      data: paginatedResult(announcements, total, page, limit),
    };
  }

  async findOne(id: string) {
    const announcement = await this.announcementsRepo.findById(id);

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    return {
      message: 'Announcement fetched successfully',
      data: announcement,
    };
  }

  async update(id: string, updateAnnouncementDto: UpdateAnnouncementDto) {
    await this.findAnnouncementOrThrow(id);

    const { expired_at, ...rest } = updateAnnouncementDto;

    const updated = await this.announcementsRepo.update(id, {
      ...rest,
      ...(expired_at !== undefined && { expired_at: new Date(expired_at) }),
    });

    return {
      message: 'Announcement updated successfully',
      data: updated,
    };
  }

  async toggleActive(id: string) {
    const existing = await this.findAnnouncementOrThrow(id);

    const updated = await this.announcementsRepo.update(id, {
      is_active: !existing.is_active,
    });

    return {
      message: `Announcement ${updated.is_active ? 'activated' : 'deactivated'} successfully`,
      data: updated,
    };
  }

  async updateExpiry(id: string, dto: UpdateExpiryDto) {
    await this.findAnnouncementOrThrow(id);

    const updated = await this.announcementsRepo.update(id, {
      expired_at: new Date(dto.expired_at),
    });

    return {
      message: 'Announcement expiry updated successfully',
      data: updated,
    };
  }

  async remove(id: string) {
    await this.findAnnouncementOrThrow(id);
    await this.announcementsRepo.delete(id);

    return {
      message: 'Announcement deleted successfully',
      data: null,
    };
  }

  private async findAnnouncementOrThrow(id: string) {
    const existing = await this.announcementsRepo.findByIdRaw(id);

    if (!existing) {
      throw new NotFoundException('Announcement not found');
    }

    return existing;
  }

  private buildWhere(filters: {
    is_active?: boolean;
    search?: string;
  }): Prisma.AnnouncementWhereInput {
    const { is_active, search } = filters;

    return {
      ...(is_active !== undefined && { is_active }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };
  }
}
