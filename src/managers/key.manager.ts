import { CacheEntry, CacheStorageAdapter, EntryItem, EventType, QueryOptions } from '../common';
import { EventSystem } from '../events';
import { MonitoringAdapter } from '../monitoring';
import { isNull } from '../utils';
import { DependencyManager } from './dependency.manager';
import { CacheEntryManager } from './entry.maanger';
import { PatternManager } from './pattern.manager';
import { TTLManager } from './ttl.manager';
/**
 * The KeyManager class is responsible for managing individual cache keys.
 * It handles key validation, expiration, and retrieving cache entries.
 */
export class CacheKeyManager<K, V> {
  private readonly ttlManager: TTLManager;
  private readonly entryManager: CacheEntryManager<K, V>;
  private readonly dependencyManager: DependencyManager<K, V>;
  private readonly patternManager: PatternManager<K, V>;

  constructor(private storage: CacheStorageAdapter<K, V>, private events: EventSystem<EventType, K, V>, private monitoring: MonitoringAdapter) {
    this.dependencyManager = new DependencyManager(storage);
    this.ttlManager = new TTLManager();
    this.entryManager = new CacheEntryManager(storage);
    this.patternManager = new PatternManager(storage);
  }
  /**
   * Extracts the value from a CacheEntry or a tuple [K, V].
   *
   * @param entry - The cache entry or a tuple.
   * @returns The extracted value.
   */
  public extractValue(entry: CacheEntry<K, V> | [K, V]): V {
    return Array.isArray(entry) ? entry[1] : entry.value;
  }

  /**
   * Type guard: Checks if a value is a CacheEntry.
   *
   * @param entry - The value to check.
   * @returns `true` if the value is a CacheEntry, otherwise `false`.
   */
  public isCacheEntry(entry: unknown): entry is CacheEntry<K, V> {
    return entry !== null && typeof entry === 'object' && 'value' in entry;
  }

  /**
   * Type guard: Checks if a value is a tuple [K, V].
   *
   * @param entry - The value to check.
   * @returns `true` if the value is a tuple, otherwise `false`.
   */
  public isTuple(entry: unknown): entry is [K, V] {
    return Array.isArray(entry) && entry.length === 2 && entry[0] !== undefined && entry[1] !== undefined;
  }

  /**
   * Normalizes a value into a CacheEntry.
   * - If the value is already a CacheEntry, it is returned unchanged.
   * - If the value is a tuple, it is converted into a CacheEntry.
   * - If the value is neither, it is returned as is.
   *
   * @param entry - The value to normalize.
   * @returns A CacheEntry or the original value.
   */
  public normalizeToCacheEntry(entry: CacheEntry<K, V>): CacheEntry<K, V> | { key: K; value: CacheEntry<K, V>['value'] } {
    if (this.isCacheEntry(entry)) {
      return entry;
    }

    if (this.isTuple(entry)) {
      return { key: entry[0], value: entry[1] };
    }

    return entry;
  }
  /**
   * Initializes a new cache entry with the specified value and options.
   */
  initializeCacheEntry(key: K, value: V, options?: EntryItem<K, V>) {
    return this.entryManager.createEntry(key, value, options);
  }
  /**
   * Checks if a cache key is valid and whether it has expired.
   *
   * @param key The key of the cache entry.
   * @returns An object containing a boolean indicating expiry status and the entry itself.
   */
  isKeyValid(key: K): { isValid: boolean; entry: CacheEntry<K, V> | null } {
    const entry = this.storage.get(key);
    if (isNull(entry)) {
      return {
        isValid: false,
        entry: null,
      };
    }

    const isExpired = this.isCacheEntryExpired(entry);
    if (isExpired) {
      entry.status = 'expired';
      this.events.emit({ type: EventType.Expire, entry, key });
      this.handleCacheExpiry(key, entry);
    }
    return {
      isValid: !isExpired,
      entry,
    };
  }

  /**
   * Checks whether the cache entry has expired based on its TTL.
   */
  private isCacheEntryExpired(entry: CacheEntry<K, V>): boolean {
    return entry.expiry ? this.ttlManager.isExpired(entry) : false;
  }

  /**
   * Applies query options to determine if a cache entry should be included.
   * This method filters and transforms entries based on query constraints such as prefix, length, and custom filters.
   *
   * @param key - The cache key being checked.
   * @param entry - The cache entry associated with the key.
   * @param options - Query options for filtering and transforming the entry.
   * @returns The processed entry, a tuple, or null if the entry does not meet criteria.
   */
  private applyQueryOptions(key: K, entry: CacheEntry<K, V>, options?: QueryOptions<K>): CacheEntry<K, V> | { key: K; value: CacheEntry<K, V>['value'] }[] | null {
    if (isNull(entry)) return null;

    const { filter, maxLen, minLen, prefix, withTuple } = options ?? {};

    const keyStr = String(key);

    // Apply prefix filtering
    if (prefix && !keyStr.startsWith(prefix)) {
      return null;
    }

    // Apply length constraints
    if ((minLen && keyStr.length < minLen) || (maxLen && keyStr.length > maxLen)) {
      return null;
    }

    // Apply custom filter function
    if (filter && !filter(key, entry.value)) {
      return null;
    }

    return withTuple ? [{ key, value: entry.value }] : entry;
  }

  /**
   * Processes the cache entry based on its TTL, checking whether it has expired and should be handled.
   */
  verifyCacheEntry(key: K, options?: QueryOptions<K>): CacheEntry<K, V> | { key: K; value: CacheEntry<K, V>['value'] }[] | null {
    let keys: K | K[] = key;

    if (typeof key === 'string' && this.patternManager.isPatternKey(key)) {
      keys = this.patternManager.findMatches(key);
    }

    if (Array.isArray(keys) && typeof key === 'string' && this.patternManager.isPatternKey(key)) {
      const results: { key: K; value: V }[] = [];

      for (const matchedKey of keys) {
        const result = this.verifyCacheEntry(matchedKey, options);
        if (result !== null) {
          if (Array.isArray(result)) {
            result.forEach((r) => results.push({ key: matchedKey, value: this.extractValue(r) }));
          } else {
            results.push({ key: matchedKey, value: this.extractValue(result) });
          }
        }
      }
      return results.length > 0 ? results : null;
    }
    const { entry, isValid } = this.isKeyValid(key);
    if (isNull(entry)) return null;

    const processedEntry = this.applyQueryOptions(key, entry, options);

    if (!isNull(processedEntry)) {
      return processedEntry;
    }

    return isValid ? entry : null;
  }
  private handleCacheExpiry(key: K, entry: CacheEntry<K, V>) {
    if (entry.onExpire) {
      entry.onExpire(key, entry.value);
    }
    if (entry.dependents) {
      this.monitoring.incrementDeletes(entry.dependents?.size);
      this.dependencyManager.clearDependencies(entry);
    }
  }
  verifyCacheEntryDelete(key: K): CacheEntry<K, V> | null {
    const { entry, isValid } = this.isKeyValid(key);
    if (isNull(entry)) return null;
    const value = entry.value;
    if (entry.onExpire) {
      entry.onExpire(key, value);
    }
    if (entry.dependents) {
      this.monitoring.incrementDeletes(entry.dependents?.size);
      this.dependencyManager.clearDependencies(entry);
    }
    return isValid ? entry : null;
  }
}
