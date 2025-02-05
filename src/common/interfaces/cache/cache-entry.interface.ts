/**
 * Represents an entry in the cache with advanced features.
 * This interface supports advanced cache management features such as TTL, versioning, compression, etc.
 * It is used for internal cache management.
 */
export interface CacheEntry<K, V> {
  /**
   * The actual cached value.
   */
  value: V;

  /**
   * The expiry timestamp for the cache entry.
   * If `null`, it means the cache does not have an expiration.
   * If `undefined`, it is managed according to the TTL policy.
   */
  expiry?: number | null;

  /**
   * A set of keys that depend on this cache entry.
   * If this entry is deleted or modified, dependent keys can also be invalidated or updated.
   */
  dependents?: Set<K> | undefined;

  /**
   * A callback function to be triggered when the cache entry expires.
   */
  onExpire?: (key: K, value: V) => void;

  /**
   * Timestamp of the last access of this cache entry. Used to track the most recently accessed items.
   * Typically managed by eviction policies like LRU, MRU, etc.
   */
  lastAccessTime?: number;

  /**
   * A flag indicating whether the cache entry is considered "dirty".
   * This can be used to mark entries that are in a pending state, needing to be updated or synchronized.
   */
  isDirty?: boolean;

  /**
   * The current status of the cache entry.
   * - `valid`: The cache entry is valid and can be used.
   * - `expired`: The cache entry has expired.
   * - `stale`: The cache entry is outdated but still usable until fresh data is fetched.
   * - `dirty`: The cache entry has been marked for updating or invalidation.
   */
  status?: 'valid' | 'expired' | 'stale' | 'dirty';

  /**
   * Timestamp of the last time the cache entry was updated.
   * This can be useful for tracking when a cache entry was last modified.
   */
  lastUpdated?: number;

  /**
   * Timestamp of when the cache entry was created.
   */
  createdAt?: number;

  /**
   * Timestamp of when the cache entry was last modified.
   * This can be used to track how frequently cache entries are updated.
   */
  modifiedAt?: number;

  /**
   * A flag indicating whether the cache entry is currently locked.
   * This can be used in scenarios where cache entries are being modified or read by multiple consumers.
   */
  isLocked?: boolean;

  /**
   * Size of the cache entry (in bytes).
   */
  size?: {
    key: number;
    value: number;
  };
}

export interface EntryItem<K, V> {
  /**
   * Time-to-live (TTL) for the cache entry in milliseconds.
   * The cache entry will automatically expire after this period.
   * A value of `0` means the entry never expires.
   * If not provided, the entry does not have an expiration time.
   */
  ttl?: number;
  /**
   * The cache key that this entry depends on.
   * When this dependent key expires or is deleted, this entry will be invalidated or updated accordingly.
   */
  dependsOn?: K;

  /**
   * A callback function that is triggered when the cache entry expires.
   * This function receives the key and value of the expired entry as arguments.
   */
  onExpire?: (key: K, value: V) => void;

  /**
   * Indicates whether the cache entry is "locked" for modification.
   * When set to `true`, the entry is locked, preventing updates or evictions until it is unlocked.
   */
  isLocked?: boolean;
  /**
   * A custom tag or identifier for the cache entry.
   */
  tag?: string;
}
