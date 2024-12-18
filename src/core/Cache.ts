import { CacheError } from '../errors/CacheError';
import { CacheEntry, CacheOptions } from '../types/CacheTypes';

export class Cache<K, V> {
  private storage: Map<K, CacheEntry<V>>;

  constructor() {
    this.storage = new Map();
  }

  set(key: K, value: V, options?: CacheOptions): void {
    if (!key) {
      throw new CacheError('Key must not be empty');
    }

    const entry: CacheEntry<V> = { value };
    if (options?.ttl) {
      if (options.ttl <= 0) {
        throw new CacheError('TTL must be greater than 0');
      }
      entry.expiry = Date.now() + options.ttl;
    }

    this.storage.set(key, entry);
  }

  get(key: K): any {
    if (!key) {
      throw new CacheError('Key must not be empty');
    }

    const entry = this.storage.get(key);
    if (!entry) {
      return null;
    }

    if (entry.expiry && entry.expiry < Date.now()) {
      this.storage.delete(key); // Remove expired entry
      return null;
    }

    return entry.value;
  }

  delete(key: K): void {
    if (!key) {
      throw new CacheError('Key must not be empty');
    }

    if (!this.storage.delete(key)) {
      throw new CacheError(`Key \"${key}\" does not exist in cache`);
    }
  }

  clear(): void {
    this.storage.clear();
  }
}
