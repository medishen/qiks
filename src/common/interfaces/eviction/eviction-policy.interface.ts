import { CacheStorageAdapter } from '../../types';
import { CacheEntry } from '../cache';

/**
 * Represents a generic eviction strategy for a cache.
 */
export interface EvictionStrategy<K, V> {
  /**
   * The storage adapter that holds the cache entries.
   * This provides access to the cache storage for eviction strategies to manage entries.
   */
  storage: CacheStorageAdapter<K, V>;

  /**
   * Called when an item is accessed in the cache.
   */
  recordAccess(key: K): void;

  /**
   * Called when an item is inserted into the cache.
   */
  recordInsertion(key: K, value: CacheEntry<K, V>): void;

  /**
   * Called when an item is removed from the cache.
   */
  recordRemoval(key: K): void;

  /**
   * Evicts the least eligible key based on the eviction policy.
   * @returns The evicted key or null if no eviction occurred.
   */
  evict(): K | null;

  /**
   * Clears all stored eviction-related data.
   */
  reset(): void;

  /**
   * Retrieves the cache usage statistics.
   * @returns Usage stats such as access frequency or last access time.
   */
  getUsageStats(): Record<string, any>;

  /**
   * Returns all the keys in the cache based on the eviction policy.
   */
  getKeys(): K[];

  /**
   * Checks if the cache has reached its maximum capacity.
   * @returns True if the cache is full, otherwise false.
   */
  isFull(): boolean;
}
