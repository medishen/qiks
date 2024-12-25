import { CacheItem } from './CacheTypes';

export interface EvictionPolicy<K> {
  /**
   * Invoked when a key is accessed.
   */
  onAccess(key: K): void;

  /**
   * Invoked when a key is inserted.
   */
  onInsert<V>(key: K, value: CacheItem<V>): void;

  /**
   * Invoked when a key is removed.
   */
  onRemove(key: K): void;

  /**
   * Evicts a key from the cache and returns the evicted key.
   */
  evict(): K | null;
}
