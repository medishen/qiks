import { EvictionPolicyType } from '../../types';
import { StorageAdapter } from '../storage-adapter.interface';
import { CacheEntry } from './cache-entry.interface';

export interface CacheConfig<K, V> {
  /**
   * Maximum size of the cache before eviction starts
   */
  maxSize?: number;

  /**
   * Eviction policy to be applied to the cache when it's full
   */
  evictionPolicy?: EvictionPolicyType;

  /**
   * Defines the type of storage used in the cache system
   * - 'map' for in-memory cache using Map
   * - 'weakmap' for in-memory cache using WeakMap
   * - 'custom' to inject a custom storage adapter
   */
  storage?: 'map' | 'weakmap' | 'custom';

  /**
   * Custom storage adapter to be used for the cache.
   * This must implement the StorageAdapter interface.
   * If no custom adapter is provided, a default one (Map) will be used.
   */
  adapter?: StorageAdapter<K, CacheEntry<K, V>> | undefined;
}
