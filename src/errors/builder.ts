import { CacheErrorCodes } from "../common";
import { CacheException } from "./cache-exception";
import { CacheErrorMetadata } from "./interfaces";

/**
 * Builder class for constructing CacheException instances with type safety
 * @template TCode - Error code type from CacheErrorCode
 */
export class CacheExceptionBuilder<TCode extends CacheErrorCodes> {
  private code: TCode;
  private message: string;
  private metadata?: CacheErrorMetadata[TCode];
  private cause?: unknown;

  constructor(code: TCode, message: string) {
    this.code = code;
    this.message = message;
  }

  /**
   * Adds metadata to the error instance
   * @param metadata - Type-safe metadata matching the error code
   */
  withMetadata(metadata: CacheErrorMetadata[TCode]): this {
    this.metadata = { ...this.metadata, ...metadata };
    return this;
  }

  /**
   * Adds error cause
   * @param cause - Original error that caused this exception
   */
  withCause(cause: unknown): this {
    this.cause = cause;
    return this;
  }

  /**
   * Constructs the final CacheException instance
   */
  build(): CacheException<TCode> {
    return new CacheException(this.message, {
      code: this.code,
      metadata: this.metadata,
      cause: this.cause,
    });
  }
}