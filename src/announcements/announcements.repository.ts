import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class AnnouncementsRepository {
  constructor(private readonly prisma: DatabaseService) {}

  public readonly selectAnnouncement: Prisma.AnnouncementSelect = {
    id: true,
    title: true,
    content: true,
    is_active: true,
    expired_at: true,
    created_at: true,
    updated_at: true,
  };

  async create(data: Prisma.AnnouncementCreateInput) {
    return this.prisma.announcement.create({
      data,
      select: this.selectAnnouncement,
    });
  }

  async findById(id: string) {
    return this.prisma.announcement.findUnique({
      where: { id },
      select: this.selectAnnouncement,
    });
  }

  async findByIdRaw(id: string) {
    return this.prisma.announcement.findUnique({ where: { id } });
  }

  async findMany(
    where: Prisma.AnnouncementWhereInput,
    skip?: number,
    take?: number,
  ) {
    return this.prisma.announcement.findMany({
      where,
      select: this.selectAnnouncement,
      skip,
      take,
      orderBy: { created_at: 'desc' },
    });
  }

  async count(where?: Prisma.AnnouncementWhereInput) {
    return this.prisma.announcement.count({ where });
  }

  async update(id: string, data: Prisma.AnnouncementUpdateInput) {
    return this.prisma.announcement.update({
      where: { id },
      data,
      select: this.selectAnnouncement,
    });
  }

  async delete(id: string) {
    return this.prisma.announcement.delete({ where: { id } });
  }
}
