import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBloodInventoryDto } from './dto/create-blood-inventory.dto';
import { UpdateBloodInventoryDto } from './dto/update-blood-inventory.dto';
import { BloodInventoryQueryDto } from './dto/query/blood-inventroy.dto';
import { MarkUsedBloodInventoryDto } from './dto/mark-used-blood-inventory.dto';
import { DatabaseService } from '../database/database.service';
import {
  InventoryStatus,
  Prisma,
  type BloodInventory,
} from '../../prisma/generated/client';
import { paginate, paginatedResult } from '../common/helpers/paginate.helper';
import type { RequestedUser } from '../common/interfaces/requested-user.interface';

@Injectable()
export class BloodInventoryService {
  constructor(private readonly prisma: DatabaseService) {}

  private readonly includeRelations: Prisma.BloodInventoryInclude = {
    hospital: true,
    blood_request: true,
  };

  async create(
    createBloodInventoryDto: CreateBloodInventoryDto,
    user: RequestedUser,
  ) {
    if (!user.hospital_id) {
      throw new BadRequestException('Hospital ID is required');
    }

    if (createBloodInventoryDto.hospital_id !== user.hospital_id) {
      throw new BadRequestException(
        'You can only create inventory in your assigned hospital',
      );
    }

    const inventory = await this.prisma.bloodInventory.create({
      data: {
        ...createBloodInventoryDto,
        collected_at: new Date(createBloodInventoryDto.collected_at),
        expired_at: new Date(createBloodInventoryDto.expired_at),
      },
      include: this.includeRelations,
    });

    return {
      message: 'Blood inventory created successfully',
      data: inventory,
    };
  }

  async findAll(query: BloodInventoryQueryDto, hospitalId: string) {
    await this.expireIfNeeded(hospitalId);

    const page = query.page ?? 1;
    const limit = query.per_page ?? query.limit ?? 10;
    const { skip, take } = paginate(page, limit);

    const where: Prisma.BloodInventoryWhereInput = {
      hospital_id: hospitalId,
      deleted_at: null,
      ...(query.status && { status: query.status }),
    };

    const [items, total] = await Promise.all([
      this.prisma.bloodInventory.findMany({
        where,
        include: this.includeRelations,
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.bloodInventory.count({ where }),
    ]);

    const groupedItems = this.groupByBloodGroup(items);

    return {
      message: 'Blood inventories retrieved successfully',
      data: paginatedResult(groupedItems, total, page, limit),
    };
  }

  async findOne(id: string, hospitalId: string) {
    await this.expireIfNeeded(hospitalId);

    const inventory = await this.prisma.bloodInventory.findFirst({
      where: {
        id,
        hospital_id: hospitalId,
        deleted_at: null,
      },
      include: this.includeRelations,
    });

    if (!inventory) {
      throw new NotFoundException('Blood inventory not found');
    }

    return {
      message: 'Blood inventory retrieved successfully',
      data: inventory,
    };
  }

  async update(
    id: string,
    updateBloodInventoryDto: UpdateBloodInventoryDto,
    hospitalId: string,
  ) {
    const existing = await this.prisma.bloodInventory.findFirst({
      where: {
        id,
        hospital_id: hospitalId,
        deleted_at: null,
      },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Blood inventory not found');
    }

    const updated = await this.prisma.bloodInventory.update({
      where: { id },
      data: {
        ...updateBloodInventoryDto,
        ...(updateBloodInventoryDto.collected_at
          ? { collected_at: new Date(updateBloodInventoryDto.collected_at) }
          : {}),
        ...(updateBloodInventoryDto.expired_at
          ? { expired_at: new Date(updateBloodInventoryDto.expired_at) }
          : {}),
      },
      include: this.includeRelations,
    });

    return {
      message: 'Blood inventory updated successfully',
      data: updated,
    };
  }

  async markUsed(
    id: string,
    dto: MarkUsedBloodInventoryDto,
    hospitalId: string,
  ) {
    await this.expireIfNeeded(hospitalId);

    const request = await this.prisma.bloodRequest.findFirst({
      where: {
        id: dto.blood_request_id,
        hospital_id: hospitalId,
        deleted_at: null,
      },
      select: { id: true },
    });

    if (!request) {
      throw new NotFoundException('Blood request not found');
    }

    const inventory = await this.prisma.bloodInventory.findFirst({
      where: {
        id,
        hospital_id: hospitalId,
        deleted_at: null,
      },
      include: this.includeRelations,
    });

    if (!inventory) {
      throw new NotFoundException('Blood inventory not found');
    }

    if (inventory.status !== InventoryStatus.available) {
      throw new BadRequestException('This blood has been used.');
    }

    const updated = await this.prisma.bloodInventory.update({
      where: { id },
      data: {
        status: InventoryStatus.used,
        blood_request_id: dto.blood_request_id,
      },
      include: this.includeRelations,
    });

    return {
      message: 'Blood inventory marked as used successfully',
      data: updated,
    };
  }

  private async expireIfNeeded(hospitalId: string) {
    return this.prisma.bloodInventory.updateMany({
      where: {
        hospital_id: hospitalId,
        deleted_at: null,
        status: InventoryStatus.available,
        expired_at: {
          lte: new Date(),
        },
      },
      data: {
        status: InventoryStatus.expired,
      },
    });
  }

  private groupByBloodGroup(items: BloodInventory[]) {
    const grouped = new Map<string, BloodInventory[]>();

    for (const item of items) {
      const key = item.blood_group;
      const current = grouped.get(key) ?? [];
      current.push(item);
      grouped.set(key, current);
    }

    return Array.from(grouped.entries()).map(([blood_group, inventories]) => ({
      blood_group,
      inventories,
    }));
  }
}
