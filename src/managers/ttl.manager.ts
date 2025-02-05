import { CacheEntry, CacheErrorCodes } from '../common';
import { CacheExceptionFactory } from '../errors';

export class TTLManager {
  setTTL(ttl: number): number {
    if (ttl <= 0) {
      throw CacheExceptionFactory.createException(CacheErrorCodes.INVALID_TTL, `TTL must be greater than 0. Provided value: ${ttl}`, { ttl });
    }
    return Date.now() + ttl;
  }

  isExpired<K, V>(entry: CacheEntry<K, V>): boolean {
    return !!entry.expiry && entry.expiry <= Date.now();
  }
}
