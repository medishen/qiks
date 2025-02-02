/**
 * Enum representing the types of events emitted by QIKS cache system.
 * These events correspond to various cache operations, lifecycle changes, cache hits and misses,
 * cache maintenance, errors, and debugging metrics.
 */
export enum EventType {
  // Cache operations
  CacheSet = 'cache:item:set', // Represents when an item is added to the cache
  CacheGet = 'cache:item:get', // Represents when an item is retrieved from the cache
  CacheDelete = 'cache:item:delete', // Represents when an item is deleted from the cache
  CacheExpire = 'cache:item:expire', // Represents when an item expires from the cache

  // Cache lifecycle and state change events
  CacheChange = 'cache:item:change', // Represents when an item is changed in the cache (e.g., updated or replaced)
  CacheUpdate = 'cache:item:updated', // General cache update event (e.g., insertion, update)
  CacheRebuild = 'cache:rebuilding', // Event triggered when the cache is being rebuilt (e.g., after a failover or cache invalidation)

  // Cache hit/miss events
  CacheMiss = 'cache:missed', // Event triggered when a cache miss occurs (an item is not found in the cache)
  CacheHit = 'cache:hit', // Event triggered when an item is found in the cache

  // Cache management and maintenance events
  CacheEviction = 'cache:eviction', // Event triggered when an item is evicted due to the eviction policy (e.g., LRU, LFU)
  CacheClear = 'cache:cleared', // Event triggered when the entire cache is cleared (manual or automatic)

  // Cache Errors and Failures
  CacheOperationError = 'cache:error:operation', // Event triggered on cache operation errors (read/write failure)
  CacheCriticalFailure = 'cache:error:critical', // Event triggered on critical cache failures (e.g., data corruption)

  // Debugging and Metrics Events
  CacheStatisticsUpdated = 'cache:stats:updated', // Event triggered when cache statistics are updated (e.g., hit rate, eviction counts)

  // General error event
  Error = 'error', // General error event
}
