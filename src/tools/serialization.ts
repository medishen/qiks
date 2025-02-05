import { CacheErrorCodes, CacheStorageAdapter } from '../common';
import { CacheExceptionFactory } from '../errors';
import { BatchOps } from './batch-operations';

export class Serialization<K, V> {
  constructor(private adapter: CacheStorageAdapter<K, V>, private batchOperations: BatchOps<K, V>) {}
  /**
   * Converts the current state of the adapter into a plain object
   */
  toObject(): Record<string, V> {
    const obj: Record<string, V> = {};
    try {
      // Get the entries from the adapter
      const maybeEntry = this.adapter.entries();

      // If entries are returned as a promise (async case)
      if (maybeEntry instanceof Promise) {
        maybeEntry.then((entries) => {
          for (const [key, value] of entries) {
            obj[String(key)] = value;
          }
        });
      } else {
        // If entries are directly available (sync case)
        for (const [key, value] of maybeEntry as any) {
          obj[String(key)] = value;
        }
      }
    } catch (error: any) {
      throw CacheExceptionFactory.createException(CacheErrorCodes.SERIALIZATION_FAILED, `Failed to convert adapter state to object: ${error.message}`, { error });
    }
    return obj;
  }
  /**
   * Takes a snapshot of the current state and serializes it to a string
   */
  snapshot(): string {
    try {
      return JSON.stringify(this.toObject());
    } catch (error: any) {
      throw CacheExceptionFactory.createException(CacheErrorCodes.SERIALIZATION_FAILED, `Failed to convert adapter state to object: ${error.message}`, { error });
    }
  }
  /**
   * Restores the state from a snapshot string
   * Throws an error if parsing or batch operations fail
   */
  restoreSnapshot(snapshot: string): void {
    try {
      const data = JSON.parse(snapshot);
      if (!data || typeof data !== 'object') {
        throw CacheExceptionFactory.createException(CacheErrorCodes.JSON_PARSE_ERROR, 'Invalid data structure in snapshot.', { snapshot });
      }
      this.batchOperations.setBatch(Object.entries(data) as [K, V][]);
    } catch (error: any) {
      throw CacheExceptionFactory.createException(CacheErrorCodes.JSON_PARSE_ERROR, `Failed to convert adapter state to object: ${error.message}`, { error });
    }
  }

  /**
   * Serializes the adapter to JSON
   * Can accept a replacer function and space for formatting
   */
  toJSON(replacer?: (key: string, value: any) => any, space?: string | number): string {
    try {
      return JSON.stringify(this.toObject(), replacer, space);
    } catch (error: any) {
      throw CacheExceptionFactory.createException(CacheErrorCodes.SERIALIZATION_FAILED, `Failed to convert adapter state to object: ${error.message}`, { error });
    }
  }
  /**
   * Deserializes JSON into the adapter and updates the batch operations
   * Handles parsing errors and updates batch operations accordingly
   */
  fromJSON(json: string, reviver?: (key: string, value: any) => any): void {
    try {
      const data = JSON.parse(json, reviver);
      if (!data || typeof data !== 'object') {
        throw CacheExceptionFactory.createException(CacheErrorCodes.JSON_PARSE_ERROR, 'Invalid data structure in JSON.', { json });
      }
      this.batchOperations.setBatch(Object.entries(data) as [K, V][]);
    } catch (error: any) {
      throw CacheExceptionFactory.createException(CacheErrorCodes.JSON_PARSE_ERROR, `Failed to convert adapter state to object: ${error.message}`, { error });
    }
  }
}
