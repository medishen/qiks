/**
 * Factory class for creating cache-related exceptions with specific codes and messages.
 * @module CacheExceptionFactory
 */

import { CacheException } from './cache-exception';
import { CacheErrorCodes } from '../common';
import { CacheExceptionBuilder } from './builder';

export class CacheExceptionFactory {
  static missingKey<K>(key: K) {
    const message = `Cache key not found: ${String(key)}`;
    return new CacheExceptionBuilder(CacheErrorCodes.MISSING_KEY, message).withMetadata({ key });
  }

  static invalidTTL(ttl: number) {
    return new CacheException(`Invalid TTL value: ${ttl}`, {
      code: CacheErrorCodes.INVALID_TTL,
      metadata: { ttl },
    });
  }

  static storageFull(maxSize: number) {
    const message = `Cache storage full (max ${maxSize} items)`;
    return new CacheExceptionBuilder(CacheErrorCodes.STORAGE_FULL, message).withMetadata({ maxSize });
  }

  static serializationFailed() {
    const message = 'Serialization of cache value failed';
    return new CacheExceptionBuilder(CacheErrorCodes.SERIALIZATION_FAILED, message);
  }

  static deserializationFailed() {
    const message = 'Deserialization of cache value failed';
    return new CacheExceptionBuilder(CacheErrorCodes.DESERIALIZATION_FAILED, message);
  }

  static concurrencyConflict<K>(key: K) {
    const message = `Concurrency conflict while accessing cache key '${key}'`;
    return new CacheExceptionBuilder(CacheErrorCodes.CONCURRENCY_CONFLICT, message).withMetadata({ key });
  }

  static cacheOverflow() {
    const message = 'Cache overflow error: Maximum cache size exceeded';
    return new CacheExceptionBuilder(CacheErrorCodes.CACHE_OVERFLOW, message);
  }

  static invalidKeyFormat<K>(key: K) {
    const message = `Invalid cache key format: '${key}'`;
    return new CacheExceptionBuilder(CacheErrorCodes.INVALID_KEY_FORMAT, message).withMetadata({ key });
  }

  static unexpectedError(cause: string) {
    const message = 'An unexpected error occurred';
    return new CacheExceptionBuilder(CacheErrorCodes.INVALID_KEY_FORMAT, message).withCause(cause);
  }
}
