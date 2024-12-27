import { CacheError } from '../errors/CacheError';
import { EventManager } from '../events/EventManager';
import { CacheEventType, CacheItemOptions, CacheConfig, StorageAdapter, CacheItem, EventCallback, GetOptions, SWRPolicy } from '../types/CacheTypes';
import { EvictionPolicy } from '../types/EvictionPolicy';
import { TTLManager } from './managers/TTLManager';
import { expireKeyRecursively, initializeEvictionPolicy, isInternalKey, isWeak, validateKey, validateOptions } from '../utils';
import { ObserverManager } from './managers/ObserverManager';
import { DependencyManager } from './managers/DependencyManager';
import { PatternMatcher } from '../utils/PatternMatcher';
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
      swr: options?.swr
        ? {
            ...options.swr,
            isRunning: false,
            revalidate: async () => {
              const rawValue = await options.swr!.revalidate();
              this.set(key, rawValue);
              return this.options.serializer!.serialize(rawValue);
            },
            lastFetched: Date.now(),
          }
        : undefined,
    };
    this.evictionPolicy.onInsert(key, cacheItem);
    this.event.emit('set', key, value);
  }

  get(key: K, options?: GetOptions<K>): V | [K, V][] | V[] | K[] | null | Promise<V | null> {
    validateKey(key);
    const {
      keys = false,
      values = true,
      pattern = false,
      withTuples = false,
      exclude = null,
      sort = 'ASC',
      minLen = 0,
      maxLen = Infinity,
      prefix = null,
      suffix = null,
      filter = null,
      transform = null,
      limit = Infinity,
    } = options || {};
    if (typeof key === 'string' && pattern) {
      const results = PatternMatcher.findMatches(key, this.storage, options!);
      if (withTuples || (keys && values)) {
        return results as [K, V][];
      }
      if (keys) {
        return results as K[];
      }
      if (values) {
        return results as V[];
      }
      return null;
    }
    const entry = this.options.storage.get(key);
    if (!entry) return null;
    if (this.ttlManager.isExpired(entry)) {
      if (entry.onExpire) {
        const deserializedValue = this.options.serializer!.deserialize<string>(entry.value);
        entry.onExpire(key, deserializedValue);
      }
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
    if (entry.swr) {
      const swrPolicy: SWRPolicy<string> | undefined = entry.swr;
      if (this.isStale(swrPolicy)) {
        const freshEntry = this.storage.get(key);
        if (freshEntry) {
          if (swrPolicy.isRunning) {
            return this.options.serializer.deserialize<V>(freshEntry.value);
          }
          swrPolicy.isRunning = true;
          return new Promise(async (resolve, reject) => {
            try {
              const freshData = await swrPolicy.revalidate();
              const deserializedValue = this.options.serializer.deserialize<V>(freshData);
              freshEntry.value = this.options.serializer.serialize(deserializedValue);
              swrPolicy.lastFetched = Date.now();
              this.storage.set(key, freshEntry);
              resolve(freshData as V);
            } catch (error) {
              reject(new CacheError(`Failed to revalidate key "${key}": ${error}`));
            } finally {
              swrPolicy.isRunning = false;
            }
          });
        }
      }
      return this.options.serializer.deserialize<V>(entry.value);
    }
    const deserializedValue = this.options.serializer!.deserialize<V>(entry.value);
    this.evictionPolicy.onAccess(key);
    this.event.emit('get', key, deserializedValue);
    if (keys) {
      return [key as K];
    }
    if (values) {
      return deserializedValue;
    }
    if (withTuples || (keys && values)) {
      return [[key as K, deserializedValue]] as [K, V][];
    }
    return null;
  }
  private isStale(swrPolicy: SWRPolicy<any>): boolean {
    const now = Date.now();
    return now - (swrPolicy.lastFetched || 0) >= swrPolicy.staleThreshold;
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
