import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class HospitalsService {
  constructor(private readonly prisma: DatabaseService) {}

  async findAll() {
    // 1. Check cache
    try {
      const cachedStr = await this.redis.get(this.CACHE_KEY);
      if (cachedStr) {
        this.logger.debug('Returning hospitals from cache');
        const cachedData = JSON.parse(cachedStr) as {
          messages: string;
          data: any[];
        };
        return cachedData;
      }
    } catch (e) {
      this.logger.warn('Failed to read hospitals from cache', e);
    }

    // 2. Fetch from DB
    this.logger.log('Fetching hospitals from database');
    const hospitals = await this.db.hospital.findMany({
      where: {
        is_active: true,
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return {
      message: 'Hospitals fetched successfully',
      data: hospitals,
    };
  }

    const response = {
      messages: 'Fetched hospitals successfully',
      data: hospitals,
    };

    // 3. Save to cache
    try {
      await this.redis.set(
        this.CACHE_KEY,
        JSON.stringify(response),
        this.CACHE_TTL,
      );
    } catch (e) {
      this.logger.warn('Failed to save hospitals to cache', e);
    }

    return response;
  }

  async findOne(id: string) {
    const hospital = await this.db.hospital.findUnique({
      where: { id },
    });
    return {
      message: 'Hospital fetched successfully',
      data: hospital,
    };
  }
}
