import { ExecutionMode, isEmpty, ReturnTypeForMode } from '../common';
import { EvictionStrategy, StorageAdapter } from '../common/interfaces';
/**
 * Represents a single cache entry in the MRU policy.
 */
interface MRUCacheEntry<V> {
  value: V; // Cached value
}

export class MRUEvictionPolicy<M extends ExecutionMode, K, V> implements EvictionStrategy<M, K, V> {
  constructor(private mainStorage: StorageAdapter<M, K, MRUCacheEntry<V>>) {}
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

  recordInsertion(key: K, value: V): ReturnTypeForMode<M, void> {
    const newEntry: MRUCacheEntry<V> = {
      value,
    };
    return this.mainStorage.set(key, newEntry);
  }

  recordRemoval(key: K): ReturnTypeForMode<M, void> {
    return this.mainStorage.delete(key);
  }

  /**
   * Evicts the most recently used (MRU) cache entry.
   */
  evict(): ReturnTypeForMode<M, K | null> {
    const maybeKeys = this.mainStorage.keys();

    if (maybeKeys instanceof Promise) {
      return maybeKeys.then((keys) => {
        const lastKey = Array.from(keys).pop() ?? null;
        if (lastKey !== null) this.mainStorage.delete(lastKey);
        return lastKey;
      }) as ReturnTypeForMode<M, K | null>;
    }

    const lastKey = Array.from(maybeKeys).pop() ?? null;
    if (lastKey !== null) this.mainStorage.delete(lastKey);
    return lastKey as ReturnTypeForMode<M, K | null>;
  }
  reset(): ReturnTypeForMode<M, void> {
    return this.mainStorage.clear();
  }
}
