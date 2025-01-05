import { CacheError } from '../../errors/CacheError';
import { CacheItem } from '../../types/CacheTypes';

export class TTLManager {
  setTTL(ttl: number): number {
    if (ttl <= 0) {
      throw new CacheError('TTL must be greater than 0');
    }
    return Date.now() + ttl;
  }

  isExpired<K, V>(entry: CacheItem<K, V>): boolean {
    return !!entry.expiry && entry.expiry <= Date.now();
  }
}
