import { CacheEntry, CacheStorageAdapter, EntryItem } from '../common';
import { sizeOfKey, sizeOfValue } from '../utils';
import { DependencyManager } from './dependency.manager';
import { TTLManager } from './ttl.manager';

/**
 * The CacheEntryManager class is responsible for creating, updating, retrieving,
 * and deleting cache entries, as well as managing the TTL, SWR, and dependencies.
 */
export class CacheEntryManager<K, V> {
  private readonly ttlManager: TTLManager;
  private readonly dependencyManager: DependencyManager<K, V>;
  constructor(storage: CacheStorageAdapter<K, V>) {
    this.dependencyManager = new DependencyManager(storage);
    this.ttlManager = new TTLManager();
  }

  /**
   * Initializes a new cache entry with the given value and options.
   *
   * @param value The value to store in the cache.
   * @param options Optional configuration for the cache entry.
   * @returns A fully constructed CacheEntry object.
   */
  createEntry(key: K, value: V, options?: EntryItem<K, V>): CacheEntry<K, V> {
    const entry: CacheEntry<K, V> = {
      value,
      expiry: options?.ttl ? this.ttlManager.setTTL(options.ttl) : null,
      onExpire: options?.onExpire,
      isLocked: options?.isLocked ?? false,
      size: {
        key: sizeOfKey<K>(key),
        value: sizeOfValue<V>(value),
      },
      status: 'valid',
      dependents: options?.dependsOn ? this.dependencyManager.addDependency(options.dependsOn, key) : undefined,
      createdAt: Date.now(),
      isDirty: false,
      lastAccessTime: Date.now(),
      lastUpdated: Date.now(),
      modifiedAt: Date.now(),
    };

    return entry;
  }
}
