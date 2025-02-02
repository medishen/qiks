import { EvictionStrategy, ExecutionMode, isNull, ReturnTypeForMode, StorageAdapter } from '../common';

/**
 * Represents a single cache entry in the LRU policy.
 */
interface LRUCacheEntry<V> {
  value: V; // Cached value
}

/**
 * Least Recently Used (LRU) Eviction Policy Implementation.
 * This class implements an eviction strategy where the least recently used cache entry is removed first.
 * It interacts with the provided storage adapter to track and manage cache entries.
 */
export class LRUEvictionPolicy<M extends ExecutionMode, K, V> implements EvictionStrategy<M, K, V> {
  constructor(private mainStorage: StorageAdapter<M, K, LRUCacheEntry<V>>) {}

  /**
   * Updates the access timestamp of an existing cache entry.
   */
  recordAccess(key: K): ReturnTypeForMode<M, void> {
    const maybeEntry = this.mainStorage.get(key)!;
    if (maybeEntry instanceof Promise) {
      return maybeEntry.then((entry) => {
        if (!entry) return;
        this.mainStorage.delete(key);
        return this.mainStorage.set(key, { value: entry.value });
      }) as ReturnTypeForMode<M, void>;
    }

    if (!maybeEntry) return undefined as ReturnTypeForMode<M, void>;

    this.mainStorage.delete(key);
    return this.mainStorage.set(key, { value: maybeEntry.value });
  }

  /**
   * Inserts a new cache entry with the current timestamp.
   */
  recordInsertion(key: K, value: V): ReturnTypeForMode<M, void> {
    return this.mainStorage.set(key, { value });
  }

  /**
   * Removes a specific cache entry.
   */
  recordRemoval(key: K): ReturnTypeForMode<M, void> {
    return this.mainStorage.delete(key);
  }

  /**
   * Evicts the least recently used (LRU) cache entry.
   */
  evict(): ReturnTypeForMode<M, K | null> {
    const maybeKeys = this.mainStorage.keys();
    if (maybeKeys instanceof Promise) {
      return maybeKeys.then((keys) => {
        const firstKey = keys.next().value ?? null;
        if (!isNull(firstKey)) this.mainStorage.delete(firstKey);
        return firstKey;
      }) as ReturnTypeForMode<M, K | null>;
    }

    const firstKey = maybeKeys.next().value ?? null;
    if (!isNull(firstKey)) this.mainStorage.delete(firstKey);
    return firstKey as ReturnTypeForMode<M, K | null>;
  }

  /**
   * Clears all entries in the cache.
   */
  reset(): ReturnTypeForMode<M, void> {
    return this.mainStorage.clear();
  }
}
