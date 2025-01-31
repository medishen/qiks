/**
 * Custom error hierarchy for cache-related exceptions
 * @module CacheErrors
 */

import { CacheErrorOptions } from './interfaces';

/**
 * Base class for cache-related exceptions.
 *
 * This class provides a custom error hierarchy that includes a `code`, `timestamp`,
 * and additional `metadata` to provide context to the error. It also supports stack trace parsing
 * and includes helper methods to serialize the error in a consistent format.
 *
 * @template T The type of the error cause (useful for more specific error reporting).
 */
export class CacheException<T extends string = 'GENERIC_CACHE_ERROR'> extends Error {
  readonly code: string;
  readonly timestamp: string;
  readonly metadata?: Record<string, any>;
  readonly cause?: T;
  readonly line?: number;
  readonly fileName?: string;

  /**
   * Constructs a new `CacheException` instance.
   *
   * @param message The error message to describe the exception.
   * @param options Additional options for the exception, such as `code`, `metadata`, and `cause`.
   */
  constructor(message: string, options: CacheErrorOptions<T> = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = options.code || 'GENERIC_CACHE_ERROR';
    this.timestamp = new Date().toISOString();
    this.metadata = options.metadata;

    // Capture stack trace (V8 engine/Node.js only)
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }

    // Parse the stack trace to retrieve the file and line number.
    const stackDetails = this.parseStackTrace();
    if (stackDetails) {
      this.line = stackDetails.line;
      this.fileName = stackDetails.fileName;
    }
  }

  /**
   * Parses the stack trace of the error to extract file name and line number.
   *
   * @returns An object containing `fileName` and `line` if the stack trace could be parsed, or `null` otherwise.
   */
  private parseStackTrace(): { fileName: string; line: number } | null {
    const stackLines = this.stack?.split('\n');
    if (!stackLines || stackLines.length < 2) return null;

    const traceLine = stackLines[1]; // Second line usually contains the location.
    return this.parseV8Trace(traceLine);
  }

  /**
   * Parses a V8-formatted stack trace line (Node.js/Chromium engines).
   *
   * @param line A single line from the stack trace.
   * @returns An object with the `fileName` and `line` of the error location, or `null` if it couldn't be parsed.
   */
  private parseV8Trace(line: string): { fileName: string; line: number } | null {
    const v8Pattern = /at (?:(.+?)\s+\()?(?:(?:async )?(.+?):(\d+):(\d+))|at (?:async )?(.+?):(\d+):(\d+)/;
    const match = line.match(v8Pattern);

    if (!match) return null;

    // Return the parsed file name and line number.
    return {
      fileName: match[2] || match[5] || 'unknown', // Fallback to 'unknown' if not found.
      line: parseInt(match[3] || match[6], 10) || 0, // Fallback to 0 if line number is missing.
    };
  }

  /**
   * Serializes the error to a JSON object.
   *
   * @returns A plain object representation of the error with essential information.
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      timestamp: this.timestamp,
      stack: this.stack,
      fileName: this.fileName,
      line: this.line,
      metadata: this.metadata,
    };
  }
}
