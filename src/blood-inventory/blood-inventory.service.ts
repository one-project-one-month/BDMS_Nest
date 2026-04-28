import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BloodGroup,
  DonationStatus,
  InventoryStatus,
  Prisma,
} from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { CreateBloodInventoryDto } from './dto/create-blood-inventory.dto';
import { UseFromInventoryDto } from './dto/update-blood-inventory.dto';
import { BloodInventoryQueryDto } from './dto/query/blood-inventroy.dto';

@Injectable()
export class BloodInventoryService {
  private static readonly BLOOD_EXPIRY_DAYS = 42;

  constructor(private readonly db: DatabaseService) {}

  async addToInventory(createBloodInventoryDto: CreateBloodInventoryDto) {
    const { donation_id } = createBloodInventoryDto;

    const donation = await this.db.donation.findFirst({
      where: {
        id: donation_id,
        deleted_at: null,
      },
    });

    if (!donation) {
      throw new NotFoundException('Donation not found');
    }

    if (donation.status !== DonationStatus.completed) {
      throw new BadRequestException(
        'Only completed donations can be added to inventory.',
      );
    }

    const existingInventory = await this.db.bloodInventory.findFirst({
      where: {
        donation_id,
        deleted_at: null,
      },
    });

    if (existingInventory) {
      throw new BadRequestException(
        'Inventory record already exists for this donation.',
      );
    }

    const collectedAt = donation.donation_date ?? new Date();
    const expiredAt = new Date(collectedAt);
    expiredAt.setDate(
      expiredAt.getDate() + BloodInventoryService.BLOOD_EXPIRY_DAYS,
    );

    const inventory = await this.db.bloodInventory.create({
      data: {
        donation_id,
        hospital_id: donation.hospital_id,
        blood_group: donation.blood_group,
        units: donation.units_donated ?? 1,
        collected_at: collectedAt,
        expired_at: expiredAt,
        status: InventoryStatus.available,
      },
    });

    return {
      message: 'Blood added to inventory successfully.',
      data: inventory,
    };
  }

  async useFromInventory(useFromInventoryDto: UseFromInventoryDto) {
    const { inventory_id, request_id } = useFromInventoryDto;

    const inventory = await this.db.bloodInventory.findFirst({
      where: {
        id: inventory_id,
        deleted_at: null,
      },
    });

    if (!inventory) {
      throw new NotFoundException('Inventory record not found.');
    }

    if (inventory.status !== InventoryStatus.available) {
      throw new BadRequestException('Only available blood units can be used.');
    }

    const request = await this.db.bloodRequest.findFirst({
      where: {
        id: request_id,
        deleted_at: null,
      },
    });

    if (!request) {
      throw new NotFoundException('Blood request not found.');
    }

    if (inventory.blood_group !== request.blood_group) {
      throw new BadRequestException(
        'Blood group mismatch between inventory and request.',
      );
    }

    const updatedInventory = await this.db.bloodInventory.update({
      where: {
        id: inventory_id,
      },
      data: {
        status: InventoryStatus.used,
        blood_request_id: request_id,
      },
    });

    return {
      message: 'Blood unit marked as used.',
      data: updatedInventory,
    };
  }

  async runStockTake(hospitalId?: string) {
    const where: Prisma.BloodInventoryWhereInput = {
      deleted_at: null,
      status: InventoryStatus.available,
      expired_at: {
        lt: new Date(),
      },
      ...(hospitalId ? { hospital_id: hospitalId } : {}),
    };

    const result = await this.db.bloodInventory.updateMany({
      where,
      data: {
        status: InventoryStatus.expired,
      },
    });

    return {
      message: `${result.count} unit(s) marked as expired.`,
      data: result.count,
    };
  }

  async findAll(query: BloodInventoryQueryDto) {
    const where = this.buildWhereClause(query);

    const inventories = await this.db.bloodInventory.findMany({
      where,
      orderBy: {
        created_at: 'desc',
      },
    });

    return {
      message: 'Inventory fetched successfully',
      data: inventories,
    };
  }

  async findOne(id: string) {
    const inventory = await this.db.bloodInventory.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!inventory) {
      throw new NotFoundException('Inventory not found.');
    }

    return {
      message: 'Inventory fetched successfully',
      data: inventory,
    };
  }

  async findByHospital(hospitalId: string) {
    const inventories = await this.db.bloodInventory.findMany({
      where: {
        hospital_id: hospitalId,
        deleted_at: null,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return {
      message: 'Hospital inventory fetched successfully',
      data: inventories,
    };
  }

  async getAvailableStock(hospitalId?: string, bloodGroup?: BloodGroup) {
    const grouped = await this.db.bloodInventory.groupBy({
      by: ['hospital_id', 'blood_group'],
      where: {
        deleted_at: null,
        status: InventoryStatus.available,
        ...(hospitalId ? { hospital_id: hospitalId } : {}),
        ...(bloodGroup ? { blood_group: bloodGroup } : {}),
      },
      _sum: {
        units: true,
      },
      _count: {
        _all: true,
      },
    });

    const availableStock = grouped.map((item) => ({
      hospital_id: item.hospital_id,
      blood_group: item.blood_group,
      total_units: item._sum.units ?? 0,
      available_count: item._count._all,
    }));

    return {
      message: 'Available stock fetched successfully',
      data: availableStock,
    };
  }

  async remove(id: string) {
    const inventory = await this.db.bloodInventory.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!inventory) {
      throw new NotFoundException('Inventory not found.');
    }

    await this.db.bloodInventory.update({
      where: {
        id,
      },
      data: {
        deleted_at: new Date(),
      },
    });

    return {
      message: 'Delete success',
      data: null,
    };
  }

  private buildWhereClause(
    query: BloodInventoryQueryDto,
  ): Prisma.BloodInventoryWhereInput {
    const { hospital_id, blood_group, status, with_deleted } = query;

    return {
      ...(with_deleted === 'true' ? {} : { deleted_at: null }),
      ...(hospital_id ? { hospital_id } : {}),
      ...(blood_group ? { blood_group } : {}),
      ...(status ? { status } : {}),
    };
  }
}
