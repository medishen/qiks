/**
 * Factory class for creating cache-related exceptions with specific codes and messages.
 * @module CacheExceptionFactory
 */

import { CacheException } from './cache-exception';
import { CacheErrorCodes } from '../common';

export class CacheExceptionFactory {
  static missingKey<K>(key: K) {
    return new CacheException(`Cache key '${key}' not found`, {
      code: CacheErrorCodes.MISSING_KEY,
      metadata: { key },
    });
  }

  static invalidTTL(ttl: number) {
    return new CacheException(`Invalid TTL value: ${ttl}`, {
      code: CacheErrorCodes.INVALID_TTL,
      metadata: { ttl },
    });
  }

  static storageFull(maxSize: number) {
    return new CacheException(`Cache storage full (max ${maxSize} items)`, {
      code: CacheErrorCodes.STORAGE_FULL,
      metadata: { maxSize },
    });
  }

  static serializationFailed() {
    return new CacheException('Serialization of cache value failed', {
      code: CacheErrorCodes.SERIALIZATION_FAILED,
    });
  }

  static deserializationFailed() {
    return new CacheException('Deserialization of cache value failed', {
      code: CacheErrorCodes.DESERIALIZATION_FAILED,
    });
  }

  static concurrencyConflict<K>(key: K) {
    return new CacheException(`Concurrency conflict while accessing cache key '${key}'`, {
      code: CacheErrorCodes.CONCURRENCY_CONFLICT,
      metadata: { key },
    });
  }

  static cacheOverflow() {
    return new CacheException('Cache overflow error: Maximum cache size exceeded', {
      code: CacheErrorCodes.CACHE_OVERFLOW,
    });
  }

  static invalidKeyFormat<K>(key: K) {
    return new CacheException(`Invalid cache key format: '${key}'`, {
      code: CacheErrorCodes.INVALID_KEY_FORMAT,
      metadata: { key },
    });
  }

  static unexpectedError(cause: string) {
    return new CacheException('An unexpected error occurred', {
      code: CacheErrorCodes.UNEXPECTED_ERROR,
      cause,
    });
  }

  static rateLimitExceeded() {
    return new CacheException('Rate limit exceeded for cache operations', {
      code: CacheErrorCodes.RATE_LIMIT_EXCEEDED,
    });
  }

  static cacheLocked() {
    return new CacheException('Cache is locked due to ongoing operation', {
      code: CacheErrorCodes.CACHE_LOCKED,
    });
  }
}
