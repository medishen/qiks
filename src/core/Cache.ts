import { CacheError } from '../errors/CacheError';
import { EventManager } from '../events/EventManager';
import { CacheEventType, CacheItemOptions, CacheConfig, StorageAdapter, CacheItem, EventCallback } from '../types/CacheTypes';
import { EvictionPolicy } from '../types/EvictionPolicy';
import { TTLManager } from './TTLManager';
import { initializeEvictionPolicy, isInternalKey, isWeak, validateKey, validateOptions } from '../utils';
export class Cache<K, V> {
  private evictionPolicy: EvictionPolicy<K>;
  protected ttlManager: TTLManager;
  protected event: EventManager<K, V>;
  private storage: StorageAdapter<K, CacheItem<string>>;
  private isWeakStorage: boolean;
  public static readonly INTERNAL_PREFIX = '_internal:';

  constructor(protected options: CacheConfig<K>) {
    validateOptions(this.options);
    this.storage = this.options.storage;
    this.isWeakStorage = isWeak(this.storage);
    this.evictionPolicy = initializeEvictionPolicy(this.options);
    this.ttlManager = new TTLManager();
    this.event = new EventManager<K, V>(this.storage as unknown as StorageAdapter<string, Set<EventCallback<K, V>>>);
  }
  set(key: K, value: V, options?: CacheItemOptions): void {
    validateKey(key);
    if (this.getUserKeyCount() >= (this.options.maxSize ?? Infinity)) {
      this.evictionPolicy.evict();
    }

    const serializedValue = this.options.serializer!.serialize<V>(value);
    const expiry = options?.ttl ? this.ttlManager.setTTL(options.ttl) : null;
    this.evictionPolicy.onInsert(key, { value: serializedValue, expiry });
    this.event.emit('set', key, value);
  }

  get(key: K): V | null {
    if (!key) {
      throw new CacheError('Key must not be empty');
    }

    const entry = this.options.storage.get(key);
    if (!entry) return null;
    if (this.ttlManager.isExpired(entry)) {
      this.evictionPolicy.onRemove(key);
      this.event.emit('expire', key);
      return null;
    }

    const deserializedValue = this.options.serializer!.deserialize<V>(entry.value);
    this.evictionPolicy.onAccess(key);
    this.event.emit('get', key, deserializedValue);
    return deserializedValue;
  }

  delete(key: K): void {
    validateKey(key);

    const entry = this.options.storage.get(key);
    if (entry) {
      const value = this.options.serializer!.deserialize<V>(entry.value);
      this.evictionPolicy.onRemove(key);
      this.event.emit('delete', key, value);
    }
  }

  clear(): void {
    this.storage.clear?.();
  }

  has(key: K): boolean {
    const entry = this.options.storage.get(key);
    return !!entry && !this.ttlManager.isExpired(entry);
  }

  size(): number {
    return this.getUserKeyCount();
  }

  private getUserKeyCount(): number {
    if (this.isWeakStorage) {
    }
    let count = 0;
    for (const key of this.storage.keys()) {
      if (!isInternalKey(key)) {
        count++;
      }
    }
    return count;
  }
  countBy(prefix: string | null = null): number {
    if (!prefix) return this.size();

    let count = 0;
    for (const [key, entry] of this.storage.entries()) {
      if (typeof key === 'string' && key.startsWith(`${prefix}:`) && !this.ttlManager.isExpired(entry)) {
        count++;
      }
    }
    return count;
  }
  on(event: CacheEventType, callback: (key: K, value?: V) => void): void {
    this.event.on(event, callback);
  }

  off(event: CacheEventType, callback: (key: K, value?: V) => void): void {
    this.event.off(event, callback);
  }
}
