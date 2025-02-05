import { CacheStorageAdapter } from '../common';
import { CacheEntry,  EvictionStrategy } from '../common/interfaces';
import { isEmpty } from '../utils';

/**
 * Most Recently Used (MRU) Eviction Policy Implementation
 * This class evicts the most recently used cache entry first
 * It relies on the storage adapter preserving insertion order
 */
export class MRUEvictionPolicy<K, V> implements EvictionStrategy<K, V> {
  private accessOrder: K[] = [];
  constructor(
    public storage: CacheStorageAdapter<K, V>,
    private options: {
      capacity: number;
    },
  ) {}

  /**
   * Records access to a key by removing it and re-inserting it
   * This marks the key as most recently used by moving it to the end of the order
   */
  recordAccess(key: K): void {
    const entry = this.storage.get(key)!;
    if (!entry) return;

    entry.lastAccessTime = Date.now();
    entry.lastUpdated = entry.lastAccessTime;

    this.accessOrder = this.accessOrder.filter((k) => k !== key);
    this.accessOrder.push(key);
  }

  /**
   * Inserts a new cache entry, marking it as most recently used.
   * If the cache is full, it evicts the most recently used entry.
   * @param key - The key of the new cache entry.
   * @param value - The value of the new cache entry.
   */
  recordInsertion(key: K, entry: CacheEntry<K, V>): void {
    if (this.isFull()) {
      this.evict();
    }
    this.storage.set(key, entry);
    this.accessOrder.push(key);
  }

  /**
   * Removes a specific cache entry.
   * This will also remove the key from the access order list.
   * @param key - The key to remove from the cache.
   */
  recordRemoval(key: K): void {
    this.storage.delete(key);
    this.accessOrder = this.accessOrder.filter((k) => k !== key);
  }

  /**
   * Evicts the most recently used cache entry.
   * This removes the last item from the accessOrder array and deletes the entry from storage.
   * @returns The key that was evicted, or null if there were no items to evict.
   */
  evict(): K | null {
    const mostRecentKey = this.accessOrder.pop();
    if (isEmpty(mostRecentKey)) return null;
    this.storage.delete(mostRecentKey!);
    return mostRecentKey || null;
  }

  /**
   * Resets the eviction policy by clearing the main storage and access order.
   */
  reset(): void {
    this.storage.clear();
    this.accessOrder = [];
  }

  /**
   * Retrieves cache usage statistics, including the most recently accessed key.
   * @returns An object containing usage statistics.
   */
  getUsageStats(): Record<string, any> {
    return {
      mostRecentlyAccessedKey: this.accessOrder[this.accessOrder.length - 1],
      currentSize: this.storage.size(),
      capacity: this.options.capacity,
    };
  }

  /**
   * Retrieves all keys in the cache, based on the eviction policy's access order.
   * @returns An array of keys currently in the cache.
   */
  getKeys(): K[] {
    return Array.from(this.storage.keys());
  }

  /**
   * Checks if the cache has reached its maximum capacity.
   * @returns True if the cache is full, otherwise false.
   */
  isFull(): boolean {
    return this.storage.size() >= this.options.capacity;
  }
}
