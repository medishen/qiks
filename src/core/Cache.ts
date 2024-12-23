import { CacheError } from '../errors/CacheError';
import { CacheEntry } from '../types/CacheTypes';
import { CacheOptions } from '../types/utils';
import { TTLManager } from '../utils/TTLManager';

export class Cache<K, V> {
  private storage: Map<K, CacheEntry<V>>;
  private ttlManager: TTLManager<K>;

  constructor() {
    this.storage = new Map();
    this.ttlManager = new TTLManager();
  }

  set(key: K, value: V, options?: CacheOptions): void {
    if (!key) {
      throw new CacheError('Key must not be empty');
    }

    this.storage.set(key, { value });

    if (options?.ttl) {
      if (options.ttl <= 0) {
        throw new CacheError('TTL must be greater than 0');
      }
      this.ttlManager.setTTL(key, options.ttl);
    }
  }
  get(key: K): V | null {
    if (!key) {
      throw new CacheError('Key must not be empty');
    }
    if (this.ttlManager.isExpired(key)) {
      this.storage.delete(key);
      return null;
    }

    const entry = this.storage.get(key);
    return entry ? entry.value : null;
  }

  delete(key: K): void {
    if (!key) {
      throw new CacheError('Key must not be empty');
    }

    this.storage.delete(key);
    this.ttlManager.clearTTL(key);
  }
  clear(): void {
    this.storage.clear();
    this.ttlManager.clearAll();
  }

  has(key: K): boolean {
    return this.storage.has(key) && !this.ttlManager.isExpired(key);
  }

  size(): number {
    return Array.from(this.storage.keys()).filter((key) => !this.ttlManager.isExpired(key)).length;
  }
}
