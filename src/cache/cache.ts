import { CacheConfig, CacheEntry, CacheStorageAdapter, CacheStoreWithNamespace, EntryItem, EventCallback, EvictionStrategy, QueryOptions } from '../common/';
import { ConfigManager } from '../config';
import { EventSystem } from '../events';
import { CacheTools } from '../tools';
import { EventType } from '../common/enums/events/events-type.enumts';
import { extractNamespaceKey, generateNamespaceKey, generatePrefixNamespaceKey, isNull, namespaceKey } from '../utils';
import { CacheKeyManager } from '../managers/key.manager';
import { MonitoringAdapter } from '../monitoring';

export class CacheStore<K, V> {
  private readonly eviction: EvictionStrategy<K, V>;
  private readonly events: EventSystem<EventType, K, V>;
  public readonly cacheTools: CacheTools<K, V>;
  private readonly keyManager: CacheKeyManager<K, V>;
  private readonly storage: CacheStorageAdapter<K, V>;
  private readonly monitoring: MonitoringAdapter;
  constructor(config?: CacheConfig<K, V>) {
    const configManager = new ConfigManager(config);
    this.eviction = configManager.getDriver();
    this.storage = this.eviction.storage;
    this.cacheTools = new CacheTools(this.eviction.storage);
    this.events = new EventSystem();
    this.monitoring = new MonitoringAdapter();
    this.keyManager = new CacheKeyManager(this.eviction.storage, this.events, this.monitoring);
  }

  set<KeyT extends K, ValueT extends V>(key: KeyT, value: ValueT, options?: EntryItem<K, V>): void {
    try {
      const existingEntry = this.keyManager.verifyCacheEntry(key);

      const entry = this.keyManager.initializeCacheEntry(key, value, options);

      this.monitoring.incrementWrites();
      this.monitoring.incrementCacheSize(entry.size?.value!);
      this.monitoring.setTotalItems(this.monitoring.getMetrics().totalItems + 1);

      this.events.emit({ type: EventType.Set, key, entry });
      this.eviction.recordInsertion(key, entry);
      if (existingEntry) {
        if (Array.isArray(existingEntry)) {
          // Handle when existingEntry is an array
          existingEntry.forEach((oldEntry) => {
            if (this.keyManager.isCacheEntry(oldEntry)) {
              this.events.emit({ type: EventType.Change, key, oldEntry, newEntry: entry });
            }
          });
        } else {
          if (this.keyManager.isCacheEntry(existingEntry)) {
            this.events.emit({ type: EventType.Change, key, oldEntry: existingEntry, newEntry: entry });
          }
        }
      }

      this.events.emit({ type: EventType.Update, key, entry });
      this.updateStatistics();
    } catch (error) {
      this.events.emit({
        type: EventType.OperationError,
        key,
        message: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }
  get<T extends K>(key: T, options: { withTuple: true } & QueryOptions<K>): Array<{ key: K; value: V }> | null;
  get<T extends K>(key: T, options?: QueryOptions<K>): V | null;
  get<T extends K>(key: T, options?: QueryOptions<K>) {
    try {
      const entry = this.keyManager.verifyCacheEntry(key, options);

      if (isNull(entry)) {
        this.monitoring.incrementMisses();
        this.events.emit({ type: EventType.Miss, key });
        return null;
      }
      if (Array.isArray(entry)) {
        const result = entry.map((cacheEntry) => {
          this.events.emit({ type: EventType.Get, key, entry: cacheEntry });
          this.eviction.recordAccess(cacheEntry.key);
          this.events.emit({ type: EventType.Hit, key, entry: cacheEntry });
          return options?.withTuple ? { key: cacheEntry.key, value: cacheEntry.value } : cacheEntry.key;
        });

        this.monitoring.incrementHits();
        this.updateStatistics();
        return result;
      }
      if (entry.status === 'expired') {
        this.delete(key);
        return null;
      }
      this.events.emit({ type: EventType.Get, key, entry });
      this.eviction.recordAccess(key);
      this.events.emit({ type: EventType.Hit, key, entry });
      this.monitoring.incrementHits();
      this.updateStatistics();
      return entry.value;
    } catch (error) {
      this.events.emit({
        type: EventType.Error,
        message: error instanceof Error ? error : new Error(String(error)),
      });
      return null;
    }
  }
  delete<T extends K>(key: T) {
    try {
      const entry = this.keyManager.verifyCacheEntryDelete(key);
      if (entry) {
        this.monitoring.incrementDeletes();
        this.monitoring.decrementCacheSize(entry.size?.value!);
        this.monitoring.setTotalItems(this.monitoring.getMetrics().totalItems - 1);

        this.events.emit({ type: EventType.Delete, key, entry: entry! });
        this.eviction.recordRemoval(key);
        this.updateStatistics();
      } else {
        this.events.emit({ type: EventType.OperationError, key, message: 'Cache entry not found' });
      }
    } catch (error) {
      this.events.emit({
        type: EventType.OperationError,
        key,
        message: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }
  has<T extends K>(key: T) {
    try {
      const entry = this.keyManager.verifyCacheEntry(key);
      const exists = !isNull(entry);
      if (exists) {
        if (Array.isArray(entry)) {
          const cacheEntries: CacheEntry<K, V>[] = entry.map((e) => this.keyManager.normalizeToCacheEntry(e)).filter((e): e is CacheEntry<K, V> => e !== undefined); // Type assertion

          cacheEntries.forEach((cacheEntry) => {
            this.events.emit({ type: EventType.Hit, key, entry: cacheEntry });
          });
        } else {
          // Single cache entry found
          this.events.emit({ type: EventType.Hit, key, entry });
        }
      } else {
        this.events.emit({ type: EventType.Miss, key });
      }
      return exists;
    } catch (error) {
      this.events.emit({
        type: EventType.OperationError,
        key,
        message: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  keys() {
    return this.storage.keys();
  }

  entries() {
    return this.storage.entries();
  }

  clear() {
    try {
      const entries = Array.from(this.storage.entries());
      this.monitoring.incrementDeletes(entries.length);
      this.monitoring.setTotalItems(0);
      this.monitoring.decrementCacheSize(this.monitoring.getMetrics().cacheSize);
      this.events.emit({ type: EventType.Clear, entries });
      this.storage.clear();
      this.events.emit({ type: EventType.Rebuild, entries });
      this.updateStatistics();
    } catch (error) {
      this.events.emit({
        type: EventType.CriticalFailure,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  values() {
    return this.storage.values();
  }
  size() {
    return this.storage.size();
  }
  sizeOf(prefix: string) {
    if (namespaceKey(prefix)) {
      prefix = extractNamespaceKey(prefix).namespace;
    }
    // console.log('prefix->', prefix);
    let count = 0;
    const prefixLower = prefix.toLowerCase();

    for (const key of this.storage.keys()) {
      let keyString = String(key).toLowerCase();
      if (namespaceKey(keyString)) {
        keyString = extractNamespaceKey(keyString).namespace;
      }
      // console.log('keyString->', keyString);
      if (keyString.startsWith(prefixLower)) {
        count++;
      }
    }

    return count;
  }
  forEach(callback: (value: V, key: K, cache: CacheStore<K, V>) => void) {
    this.storage.forEach((value, key, _) => {
      callback(value.value, key, this);
    });
  }

  //======================= Eviction Methods =======================//
  getCacheStats() {
    return {
      ...this.monitoring.getMetrics(), // Include monitoring metrics
      ...this.eviction.getUsageStats(),
    };
  }

  isCacheFull() {
    return this.eviction.isFull();
  }

  // Add this method to emit statistics updates
  private updateStatistics(): void {
    const stats = this.getCacheStats();
    this.events.emit({
      type: EventType.StatisticsUpdated,
      stats,
    });
  }

  //======================= Event System Methods =======================//
  on<T extends EventType>(event: T, listener: EventCallback<T, K, V>) {
    this.events.addListener(event, listener);
  }

  off<T extends EventType>(event: T, listener: EventCallback<T, K, V>) {
    this.events.removeListener(event, listener);
  }

  getListeners(event: EventType) {
    return this.events.getListeners(event);
  }

  getAllEvents() {
    return this.events.getAllEvents();
  }

  namespace<T extends string = string>(namespace: T): CacheStoreWithNamespace<K, V> {
    const nsPrefix = generatePrefixNamespaceKey(namespace);
    const self = this;

    // Create namespaced versions of key-based methods
    return {
      ...this,
      set(key: K, value: V, options?: EntryItem<K, V>): void {
        const namespacedKey = generateNamespaceKey(nsPrefix, key) as K;
        return self.set(namespacedKey, value, options);
      },

      get(key: K, options?: QueryOptions<K>) {
        const namespacedKey = generateNamespaceKey(nsPrefix, key) as K;
        return self.get(namespacedKey, options);
      },

      delete(key: K): void {
        const namespacedKey = generateNamespaceKey(nsPrefix, key) as K;
        return self.delete(namespacedKey);
      },

      has(key: K) {
        const namespacedKey = generateNamespaceKey(nsPrefix, key) as K;
        return self.has(namespacedKey);
      },

      keys(): K[] {
        return Array.from(self.keys()).filter((k) => String(k).startsWith(nsPrefix)) as K[];
      },

      entries(): IterableIterator<[K, CacheEntry<K, V>]> {
        const originalEntries = self.entries();
        const filteredEntries = Array.from(originalEntries)
          .filter(([k]) => String(k).startsWith(nsPrefix))
          .values();

        return {
          [Symbol.iterator]() {
            return this;
          },
          next: () => filteredEntries.next(),
        };
      },

      values(): IterableIterator<V> {
        const allEntries = Array.from(self.storage.entries());
        const namespaceValues = allEntries.filter(([key]) => String(key).startsWith(nsPrefix)).map(([_, entry]) => entry.value);
        return namespaceValues.values();
      },

      forEach(callback: (value: V, key: K, cache: CacheStore<K, V>) => void): void {
        self.forEach((value, key, cache) => {
          if (String(key).startsWith(nsPrefix)) {
            callback(value, key, cache);
          }
        });
      },
      clear(): void {
        Array.from(this.keys()).forEach((k) => self.delete(k));
      },
      size(): number {
        return Array.from(this.keys()).length;
      },
    };
  }
}
