import { CacheError } from '../errors/CacheError';
import { EventManager } from '../events/EventManager';
import { CacheEventType, CacheItemOptions, CacheConfig, StorageAdapter, CacheItem, EventCallback } from '../types/CacheTypes';
import { EvictionPolicy } from '../types/EvictionPolicy';
import { TTLManager } from './managers/TTLManager';
import { expireKeyRecursively, initializeEvictionPolicy, isInternalKey, isWeak, validateKey, validateOptions } from '../utils';
import { ObserverManager } from './managers/ObserverManager';
import { DependencyManager } from './managers/DependencyManager';
export class Cache<K, V> {
  private evictionPolicy: EvictionPolicy<K>;
  protected ttlManager: TTLManager;
  protected event: EventManager<K, V>;
  protected storage: StorageAdapter<K, CacheItem<string>>;
  private isWeakStorage: boolean;
  public static readonly INTERNAL_PREFIX = '_internal:';
  private dependencyManager: DependencyManager<K, V>;
  protected observerManager: ObserverManager<K, V>;
  constructor(protected options: CacheConfig<K>) {
    validateOptions(this.options);
    this.storage = this.options.storage;
    this.isWeakStorage = isWeak(this.storage);
    this.evictionPolicy = initializeEvictionPolicy(this.options);
    this.ttlManager = new TTLManager();
    this.event = new EventManager<K, V>(this.storage as unknown as StorageAdapter<string, Set<EventCallback<K, V>>>);
    this.observerManager = new ObserverManager<K, V>(this.storage);
    this.dependencyManager = new DependencyManager(this.storage);
  }
  set(key: K, value: V, options?: CacheItemOptions<K, V>): void {
    validateKey(key);
    if (this.getUserKeyCount() >= (this.options.maxSize ?? Infinity)) {
      this.evictionPolicy.evict();
    }

    const serializedValue = this.options.serializer!.serialize<V>(value);
    const expiry = options?.ttl ? this.ttlManager.setTTL(options.ttl) : null;
    this.observerManager.triggerObservers(key, value);
    if (options?.dependsOn) {
      const parentKey = options.dependsOn;
      if (!this.has(parentKey)) {
        throw new CacheError(`Parent key "${parentKey}" does not exist.`);
      }

      this.dependencyManager.addDependency(parentKey, key);
    }
    const cacheItem: CacheItem<string> = {
      value: serializedValue,
      expiry,
      onExpire: options?.onExpire as ((key: any, value: string | null) => void) | undefined,
    };
    this.evictionPolicy.onInsert(key, cacheItem);
    this.event.emit('set', key, value);
  }

  get(key: K): V | null {
    if (!key) {
      throw new CacheError('Key must not be empty');
    }

    const entry = this.options.storage.get(key);
    if (!entry) return null;
    if (this.ttlManager.isExpired(entry)) {
      if (entry.onExpire) {
        const deserializedValue = this.options.serializer!.deserialize<string>(entry.value);
        entry.onExpire(key, deserializedValue);
      }
      // Handle dependent keys
      // Expire all dependents recursively
      const dependents = this.dependencyManager.getDependents(key);
      if (dependents) {
        for (const dependentKey of dependents) {
          expireKeyRecursively<K, V>({ key: dependentKey, dependencyManager: this.dependencyManager, evictionPolicy: this.evictionPolicy, storage: this.storage });
        }
      }
      this.dependencyManager.clearDependencies(key);
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
    if (!entry) return;
    if (entry.onExpire) {
      const deserializedValue = this.options.serializer!.deserialize<string>(entry.value);
      entry.onExpire(key, deserializedValue);
    }
    const dependents = this.dependencyManager.getDependents(key);
    if (dependents) {
      for (const dependentKey of dependents) {
        this.delete(dependentKey);
      }
    }
    const value = this.options.serializer!.deserialize<V>(entry.value);
    this.observerManager.triggerObservers(key, value);
    this.dependencyManager.clearDependencies(key);
    this.evictionPolicy.onRemove(key);
    this.event.emit('delete', key, value);
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
  observeKey(key: K, callback: EventCallback<K, V>): void {
    this.observerManager.observeKey(key, callback);
  }
  unobserveKey(key: K, callback: EventCallback<K, V>): void {
    this.observerManager.unobserveKey(key, callback);
  }
}
