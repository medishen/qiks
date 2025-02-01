import { CacheErrorCodes } from '../../common';

/**
 * Type mapping between error codes and their metadata shapes
 */
export interface CacheErrorMetadata {
  [CacheErrorCodes.MISSING_KEY]: { key: unknown } & Record<string, unknown>;
  [CacheErrorCodes.INVALID_TTL]: { ttl: number } & Record<string, unknown>;
  [CacheErrorCodes.STORAGE_FULL]: { maxSize: number } & Record<string, unknown>;
  [CacheErrorCodes.SERIALIZATION_FAILED]: { value?: unknown } & Record<string, unknown>;
  [CacheErrorCodes.DESERIALIZATION_FAILED]: { rawValue?: unknown } & Record<string, unknown>;
  [CacheErrorCodes.CONCURRENCY_CONFLICT]: { key: unknown } & Record<string, unknown>;
  [CacheErrorCodes.CACHE_OVERFLOW]: { currentSize?: number; maxSize?: number } & Record<string, unknown>;
  [CacheErrorCodes.INVALID_KEY_FORMAT]: { key: unknown } & Record<string, unknown>;
  [CacheErrorCodes.UNEXPECTED_ERROR]: { cause?: unknown } & Record<string, unknown>;
  [CacheErrorCodes.INVALID_OPERATION]: { operation?: string } & Record<string, unknown>;
  [CacheErrorCodes.TIMEOUT]: { timeout?: number } & Record<string, unknown>;
  [CacheErrorCodes.UNAUTHORIZED_ACCESS]: { user?: string } & Record<string, unknown>;
  [CacheErrorCodes.FILE_NOT_FOUND]: { filePath: string } & Record<string, unknown>;
  [CacheErrorCodes.JSON_PARSE_ERROR]: { errorMessage: string } & Record<string, unknown>;
  [CacheErrorCodes.FILE_WRITE_ERROR]: { filePath: string; errorMessage: string } & Record<string, unknown>;
}

export interface CacheErrorOptions<TCode extends CacheErrorCodes> {
  code: TCode;
  cause?: unknown;
  metadata?: CacheErrorMetadata[TCode];
}
