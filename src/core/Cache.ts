import { CacheError } from '../errors/CacheError';
import { EventManager } from '../events/EventManager';
import { CacheEntry, CacheEvent, CacheOptions, EventCallback, SerializerType } from '../types/CacheTypes';
import { TTLManager } from './TTLManager';
export class Cache<K, V> {
  protected ttlManager: TTLManager;
  protected event: EventManager<K, V>;
  constructor(protected storage: Map<K, CacheEntry<string>> = new Map(), protected serializer: SerializerType) {
    this.ttlManager = new TTLManager();
    this.event = new EventManager<K, V>(storage as unknown as Map<string, Set<EventCallback<K, V>>>);
  }

  set(key: K, value: V, options?: CacheOptions): void {
    if (!key) {
      throw new CacheError('Key must not be empty');
    }
    const serializedValue = this.serializer.serialize<V>(value);
    const expiry = options?.ttl ? this.ttlManager.setTTL(options.ttl) : null;
    this.storage.set(key, { value: serializedValue, expiry });
    this.event.emit('set', key, value);
  }

  get(key: K): V | null {
    if (!key) {
      throw new CacheError('Key must not be empty');
    }

    const entry = this.storage.get(key);
    if (!entry || this.ttlManager.isExpired(entry)) {
      this.storage.delete(key);
      this.event.emit('expire', key);
      return null;
    }
    const deserializedValue = this.serializer.deserialize<V>(entry.value);
    this.event.emit('get', key, deserializedValue);
    return deserializedValue;
  }

  delete(key: K): void {
    if (!key) {
      throw new CacheError('Key must not be empty');
    }
    const entry = this.storage.get(key);
    if (entry) {
      const value = this.serializer.deserialize<V>(entry.value);
      this.event.emit('delete', key, value);
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
  on(event: CacheEvent, callback: (key: K, value?: V) => void): void {
    this.event.on(event, callback);
  }

  off(event: CacheEvent, callback: (key: K, value?: V) => void): void {
    this.event.off(event, callback);
  }
}
