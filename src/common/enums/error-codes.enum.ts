/**
 * Enum for cache-related error codes.
 * These error codes are used to classify and identify different types of cache-related errors in the system.
 * @module ErrorCodes
 */

export enum CacheErrorCodes {
  MISSING_KEY = 'MISSING_KEY', // Cache key not found
  INVALID_TTL = 'INVALID_TTL', // Invalid TTL value
  STORAGE_FULL = 'STORAGE_FULL', // Cache storage exceeded
  SERIALIZATION_FAILED = 'SERIALIZATION_FAILED', // Serialization failed
  DESERIALIZATION_FAILED = 'DESERIALIZATION_FAILED', // Deserialization failed
  CONCURRENCY_CONFLICT = 'CONCURRENCY_CONFLICT', // Concurrency conflict while accessing cache
  CACHE_OVERFLOW = 'CACHE_OVERFLOW', // Cache overflow error
  INVALID_KEY_FORMAT = 'INVALID_KEY_FORMAT', // Invalid cache key format
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR', // Unexpected error in cache operations
  INVALID_OPERATION = 'INVALID_OPERATION', // Invalid cache operation (e.g., illegal state)
  TIMEOUT = 'TIMEOUT', // Operation timed out
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS', // Unauthorized access to cache
  CACHE_LOCKED = 'CACHE_LOCKED', // Cache is locked due to ongoing operation
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED', // Rate limit exceeded for cache operations
}
