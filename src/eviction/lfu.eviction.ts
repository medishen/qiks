import { CacheEntry, CacheStorageAdapter, EvictionStrategy } from '../common';
import { MapStorageAdapter } from '../storage';
import { isNull } from '../utils';

/**
 * LFU (Least Frequently Used) Cache Entry.
 */
interface LFUCacheEntry {
  frequency: number;
  lastAccessTime?: number;
  lastUpdated?: number;
  modifiedAt?: number;
}

/**
 * LFU (Least Frequently Used) Eviction Policy Implementation.
 */
export class LFUEvictionPolicy<K, V> implements EvictionStrategy<K, V> {
  private frequencyStorage: MapStorageAdapter<K, LFUCacheEntry>;
  constructor(
    public storage: CacheStorageAdapter<K, V>,
    private options: {
      capacity: number;
    },
  ) {
    this.frequencyStorage = new MapStorageAdapter<K, LFUCacheEntry>();
  }

  /**
   * Records an access to a specific cache entry, increasing its access frequency.
   * @param key The key of the cache entry being accessed
   */
  recordAccess(key: K): void {
    const entry = this.frequencyStorage.get(key);
    if (entry) {
      entry.frequency += 1;
      entry.lastAccessTime = Date.now();
      this.frequencyStorage.set(key, entry);
    }
  }

  /**
   * Records the insertion of a new cache entry and tracks its frequency.
   * @param key The key of the new cache entry
   * @param value The value of the new cache entry
   */
  recordInsertion(key: K, entry: CacheEntry<K, V>): void {
    if (this.isFull()) {
      this.evict();
    }
    const newEntry: LFUCacheEntry = {
      frequency: 1,
      lastAccessTime: entry.lastAccessTime,
      lastUpdated: entry.lastUpdated,
      modifiedAt: entry.modifiedAt,
    };
    this.storage.set(key, entry);
    this.frequencyStorage.set(key, newEntry);
  }

  /**
   * Records the removal of a cache entry, including its frequency.
   * @param key The key of the cache entry to remove
   */
  recordRemoval(key: K): void {
    this.frequencyStorage.delete(key);
    return this.storage.delete(key);
  }

  /**
   * Evicts the least frequently used item from the cache.
   * @returns The key of the evicted item, or null if no eviction occurred
   */
  evict(): K | null {
    let leastFrequentKey: K | null = null;
    let leastFrequency = Infinity;

    for (const [key, entry] of this.frequencyStorage.entries()) {
      if (entry.frequency < leastFrequency) {
        leastFrequency = entry.frequency;
        leastFrequentKey = key;
      }
    }

    if (!isNull(leastFrequentKey)) {
      this.frequencyStorage.delete(leastFrequentKey);
      this.storage.delete(leastFrequentKey);
    }

    return leastFrequentKey;
  }

  /**
   * Resets the cache, clearing all stored items and frequency data.
   */
  reset(): void {
    this.frequencyStorage.clear(); // Clear frequency data
    this.storage.clear(); // Clear main storage
  }

  /**
   * Returns cache usage statistics, including the current state of frequency tracking.
   * @returns A record containing the frequency of all cache entries
   */
  getUsageStats(): Record<string, any> {
    return {
      frequencyStorage: Array.from(this.frequencyStorage.entries()).map(([key, entry]) => ({
        key,
        frequency: entry.frequency,
        lastAccessTime: entry.lastAccessTime,
        lastUpdated: entry.lastUpdated,
        modifiedAt: entry.modifiedAt,
      })),
    };
  }

  /**
   * Retrieves all the keys currently in the cache.
   * @returns An array of keys in the cache
   */
  getKeys(): K[] {
    return Array.from(this.storage.keys()); // Get all keys from main storage
  }

  /**
   * Checks if the cache has reached its maximum capacity.
   * @returns True if the cache is full, false otherwise
   */
  isFull(): boolean {
    return this.storage.size() >= this.options.capacity;
  }
}
