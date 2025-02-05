import { CacheEntry, CacheStorageAdapter, EvictionStrategy } from '../common';
import { isNull } from '../utils';

/**
 * Least Recently Used (LRU) Eviction Policy Implementation.
 * This class implements an eviction strategy where the least recently used cache entry is removed first.
 * It interacts with the provided storage adapter to track and manage cache entries.
 */
export class LRUEvictionPolicy<K, V> implements EvictionStrategy<K, V> {
  constructor(
    public storage: CacheStorageAdapter<K, V>,
    private options: {
      capacity: number;
    },
  ) {}

  /**
   * When a key is accessed, update its position in the storage by removing and re-inserting it.
   * This ensures that the key becomes the most recently used.
   */
  recordAccess(key: K): void {
    const entry = this.storage.get(key)!;
    if (!entry) return;
    entry.lastAccessTime = Date.now();
    this.storage.delete(key);
    this.storage.set(key, entry);
  }

  /**
   * When a new key-value pair is inserted, add it to the storage.
   * The key is considered the most recently used.
   */
  recordInsertion(key: K, entry: CacheEntry<K, V>): void {
    if (this.isFull()) {
      this.evict();
    }
    entry.lastAccessTime = Date.now();
    this.storage.set(key, entry);
  }

  /**
   * Removes a specific cache entry.
   */
  recordRemoval(key: K): void {
    return this.storage.delete(key);
  }

  /**
   * Evicts the least recently used (LRU) cache entry.
   * This is done by retrieving the first key from the storage's iterator.
   * If a key is found it is removed from the storage and returned.
   * If no keys are present null is returned.
   */
  evict(): K | null {
    let leastRecentlyUsedKey: K | null = null;
    let oldestAccessTime = Infinity;

    // Iterate through all keys to find the least recently used key
    for (const [key, entry] of this.storage.entries()) {
      if (entry.lastAccessTime! < oldestAccessTime) {
        oldestAccessTime = entry.lastAccessTime!;
        leastRecentlyUsedKey = key;
      }
    }

    // Evict the least recently used key
    if (!isNull(leastRecentlyUsedKey)) {
      this.storage.delete(leastRecentlyUsedKey);
    }

    return leastRecentlyUsedKey;
  }

  /**
   * Clears all entries in the cache.
   */
  reset(): void {
    return this.storage.clear();
  }

  /**
   * Retrieves cache usage statistics.
   * For LRU, this includes the last accessed key and the total number of items.
   */
  getUsageStats(): Record<string, any> {
    const keys = Array.from(this.storage.keys());
    const lastAccessedKey = keys.length > 0 ? keys[keys.length - 1] : null;

    return {
      currentSize: this.storage.size(),
      maxSize: this.options.capacity,
      lastAccessedKey,
    };
  }

  /**
   * Retrieves all the keys in the cache in the order of access.
   */
  getKeys(): K[] {
    return Array.from(this.storage.keys());
  }

  /**
   * Determines if the cache is full based on the capacity.
   */
  isFull(): boolean {
    return this.storage.size() >= this.options.capacity;
  }
}
