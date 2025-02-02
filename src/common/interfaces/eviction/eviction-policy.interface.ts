import { ExecutionMode, ReturnTypeForMode } from '../../types';

/**
 * Represents a generic eviction strategy for a cache.
 */
export interface EvictionStrategy<M extends ExecutionMode, K, V> {
  /**
   * Called when an item is accessed in the cache.
   */
  recordAccess(key: K): ReturnTypeForMode<M, void>;

  /**
   * Called when an item is inserted into the cache.
   */
  recordInsertion(key: K, value: V): ReturnTypeForMode<M, void>;

  /**
   * Called when an item is removed from the cache.
   */
  recordRemoval(key: K): ReturnTypeForMode<M, void>;

  /**
   * Evicts the least eligible key based on the eviction policy.
   * @returns The evicted key or null if no eviction occurred.
   */
  evict(): ReturnTypeForMode<M, K | null>;

  /**
   * Clears all stored eviction-related data.
   */
  reset(): ReturnTypeForMode<M, void>;
}
