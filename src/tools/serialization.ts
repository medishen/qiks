import { StorageAdapter } from '../common/interfaces';
import { CacheExceptionFactory } from '../errors';
import { BatchOperations } from './batch-operations';

export class Serialization<K, V> {
  constructor(private adapter: StorageAdapter<K, V>, private batchOperations: BatchOperations<K, V>) {}
  /**
   * Converts the current state of the adapter into a plain object
   */
  toObject(): Record<string, V> {
    const obj: Record<string, V> = {};
    try {
      for (const [key, value] of this.adapter.entries()) {
        obj[String(key)] = value;
      }
    } catch (error: any) {
      throw CacheExceptionFactory.unexpectedError(error.message);
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
      throw CacheExceptionFactory.serializationFailed();
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
        throw CacheExceptionFactory.unexpectedError('Invalid data structure in snapshot');
      }
      this.batchOperations.setBatch(Object.entries(data) as [K, V][]);
    } catch (error: any) {
      throw CacheExceptionFactory.jsonParseError(error.message);
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
      throw CacheExceptionFactory.serializationFailed();
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
        throw CacheExceptionFactory.unexpectedError('Invalid data structure in JSON');
      }
      this.batchOperations.setBatch(Object.entries(data) as [K, V][]);
    } catch (error: any) {
      throw CacheExceptionFactory.jsonParseError(error.message);
    }
  }
}
