import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class HospitalsService {
  private readonly logger = new Logger(HospitalsService.name);
  private readonly CACHE_KEY = 'hospitals:list';
  private readonly CACHE_TTL = 60 * 60 * 24 * 7 * 1000; // 7 days in ms

  constructor(
    private readonly db: DatabaseService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async findAll() {
    // 1. Check cache
    try {
      const cached = await this.cache.get<{ messages: string; data: any[] }>(
        this.CACHE_KEY,
      );
      if (cached) {
        this.logger.debug('Returning hospitals from cache');
        return cached;
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

    const response = {
      messages: 'Fetched hospitals successfully',
      data: hospitals,
    };

    // 3. Save to cache
    try {
      await this.cache.set(this.CACHE_KEY, response, this.CACHE_TTL);
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
