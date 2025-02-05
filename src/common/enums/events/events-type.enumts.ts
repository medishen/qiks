/**
 * Enum representing the types of events emitted by QIKS cache system.
 * These events correspond to various cache operations, lifecycle changes, cache hits and misses,
 * cache maintenance, errors, and debugging metrics.
 */
export enum EventType {
  // Cache operations
  Set = 'cache:item:set', // Represents when an item is added to the cache
  Get = 'cache:item:get', // Represents when an item is retrieved from the cache
  Delete = 'cache:item:delete', // Represents when an item is deleted from the cache
  Expire = 'cache:item:expire', // Represents when an item expires from the cache

  // Cache lifecycle and state change events
  Change = 'cache:item:change', // Represents when an item is changed in the cache (e.g., updated or replaced)
  Update = 'cache:item:updated', // General cache update event (e.g., insertion, update)
  Rebuild = 'cache:rebuilding', // Event triggered when the cache is being rebuilt (e.g., after a failover or cache invalidation)

  // Cache hit/miss events
  Miss = 'cache:missed', // Event triggered when a cache miss occurs (an item is not found in the cache)
  Hit = 'cache:hit', // Event triggered when an item is found in the cache

  // Cache management and maintenance events
  Clear = 'cache:cleared', // Event triggered when the entire cache is cleared (manual or automatic)

  // Cache Errors and Failures
  OperationError = 'cache:error:operation', // Event triggered on cache operation errors (read/write failure)
  CriticalFailure = 'cache:error:critical', // Event triggered on critical cache failures (e.g., data corruption)

  // Debugging and Metrics Events
  StatisticsUpdated = 'cache:stats:updated', // Event triggered when cache statistics are updated (e.g., hit rate, eviction counts)

  // General error event
  Error = 'error', // General error event
}
