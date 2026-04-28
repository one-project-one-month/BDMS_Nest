import { Injectable, Inject } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class TokenBlacklistService {
  private readonly BLACKLIST_PREFIX = 'blacklist:';
  private readonly BLACKLIST_TTL_BUFFER = 10;

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async blacklist(token: string, expiresAt: number): Promise<void> {
    const ttlSeconds =
      expiresAt - Math.floor(Date.now() / 1000) + this.BLACKLIST_TTL_BUFFER;
    if (ttlSeconds > 0) {
      await this.cache.set(
        `${this.BLACKLIST_PREFIX}${token}`,
        'revoked',
        ttlSeconds * 1000,
      );
    }
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const result = await this.cache.get(`${this.BLACKLIST_PREFIX}${token}`);
    return result !== undefined && result !== null;
  }
}
