import { CacheError } from '../errors/CacheError';
import { CacheEntry, CacheOptions, SerializerType } from '../types/CacheTypes';
import { TTLManager } from './TTLManager';
export class Cache<K, V> {
  protected ttlManager: TTLManager;
  constructor(protected storage: Map<K, CacheEntry<string>> = new Map(), protected serializer: SerializerType) {
    this.ttlManager = new TTLManager();
  }

  set(key: K, value: V, options?: CacheOptions): void {
    if (!key) {
      throw new CacheError('Key must not be empty');
    }
    const serializedValue = this.serializer.serialize<V>(value);
    const expiry = options?.ttl ? this.ttlManager.setTTL(options.ttl) : null;
    this.storage.set(key, { value: serializedValue, expiry });
  }

  get(key: K): V | null {
    if (!key) {
      throw new CacheError('Key must not be empty');
    }

    const entry = this.storage.get(key);
    if (!entry || this.ttlManager.isExpired(entry)) {
      this.storage.delete(key);
      return null;
    }

    return this.serializer.deserialize<V>(entry.value);
  }

  delete(key: K): void {
    if (!key) {
      throw new CacheError('Key must not be empty');
    }

    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  has(key: K): boolean {
    const entry = this.storage.get(key);
    return !!entry && !this.ttlManager.isExpired(entry);
  }

  size(): number {
    return Array.from(this.storage.entries()).reduce((count, [key, entry]) => {
      if (!this.ttlManager.isExpired(entry)) count++;
      return count;
    }, 0);
  }
  countBy(prefix: string | null = null): number {
    if (!prefix) {
      return this.size();
    }
    return Array.from(this.storage.entries()).reduce((count, [key, entry]) => {
      if (typeof key === 'string' && key.startsWith(`${prefix}:`) && !this.ttlManager.isExpired(entry)) {
        count++;
      }
      return count;
    }, 0);
  }
}
