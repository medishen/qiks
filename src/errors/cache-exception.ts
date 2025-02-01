/**
 * Custom error hierarchy for cache-related exceptions
 * @module CacheErrors
 */

import { CacheErrorCodes } from '../common';
import { CacheErrorMetadata, CacheErrorOptions } from './interfaces';

/**
 * Base class for cache-related exceptions.
 *
 * This class provides a custom error hierarchy that includes a `code`, `timestamp`,
 * and additional `metadata` to provide context to the error. It also supports stack trace parsing
 * and includes helper methods to serialize the error in a consistent format.
 *
 * @template T The type of the error cause (useful for more specific error reporting).
 */
export class CacheException<TCode extends CacheErrorCodes = CacheErrorCodes> extends Error {
  public readonly code: TCode;
  public readonly timestamp: string;
  public readonly metadata?: CacheErrorMetadata[TCode];
  public readonly cause?: unknown;
  public readonly line?: number;
  public readonly fileName?: string;

  constructor(message: string, options: CacheErrorOptions<TCode>) {
    super(message);
    this.name = this.constructor.name;
    this.code = options.code;
    this.timestamp = new Date().toISOString();
    this.metadata = options.metadata;
    this.cause = options.cause;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    const stackDetails = this.parseStackTrace();
    if (stackDetails) {
      this.line = stackDetails.line;
      this.fileName = stackDetails.fileName;
    }
  }

  /**
   * Serializes the error to a plain object
   */
  public toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      timestamp: this.timestamp,
      metadata: this.metadata,
      cause: this.cause,
      fileName: this.fileName,
      line: this.line,
      stack: this.stack,
    };
  }

  private parseStackTrace() {
    const stackLines = this.stack?.split('\n');
    if (!stackLines || stackLines.length < 2) return null;

    return this.parseTraceLine(stackLines[1]);
  }

  private parseTraceLine(line: string) {
    const v8Pattern = /at (?:async )?(?:.*? )?\(?(.*?):(\d+):(\d+)\)?$/;
    const match = line.match(v8Pattern);
    if (!match) return null;

    const lineNumber = parseInt(match[2], 10);
    return isNaN(lineNumber) ? null : { fileName: match[1], line: lineNumber };
  }
}
