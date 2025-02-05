/**
 * Factory class for creating cache-related exceptions with specific codes and messages.
 * @module CacheExceptionFactory
 */

import { CacheException } from './cache-exception';
import { CacheErrorCodes } from '../common';
export class CacheExceptionFactory {
  static createException(code: CacheErrorCodes, message: string, metadata?: Record<string, any>) {
    return new CacheException(message, { code, metadata });
  }
}
