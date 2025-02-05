import { StorageAdapter } from '../common/interfaces';
import { CacheExceptionFactory } from '../errors';
import { MapStorageAdapter } from '../storage';
import { CacheEntry } from '../common/interfaces/cache/cache-entry.interface';
import { CacheErrorCodes, CacheStorageAdapter } from '../common';

export class Functional<K, V> {
  constructor(private adapter: CacheStorageAdapter<K, V>) {}

  every(predicate: (value: V, key: K) => boolean): boolean {
    try {
      return Array.from(this.adapter.entries()).every(([key, value]) => predicate(value.value, key));
    } catch (error: any) {
      throw CacheExceptionFactory.createException(CacheErrorCodes.UNEXPECTED_ERROR, `Error during "every" operation: ${error.message}`, { method: 'every', errorDetails: error });
    }
  }

  some(predicate: (value: V, key: K) => boolean): boolean {
    try {
      return Array.from(this.adapter.entries()).some(([key, value]) => predicate(value.value, key));
    } catch (error: any) {
      throw CacheExceptionFactory.createException(CacheErrorCodes.UNEXPECTED_ERROR, `Error during "some" operation: ${error.message}`, { method: 'some', errorDetails: error });
    }
  }

  map<T>(callback: (value: V, key: K) => T): T[] {
    try {
      const results: T[] = [];
      this.adapter.forEach((value, key) => {
        results.push(callback(value.value, key));
      });
      return results;
    } catch (error: any) {
      throw CacheExceptionFactory.createException(CacheErrorCodes.UNEXPECTED_ERROR, `Error during "map" operation: ${error.message}`, { method: 'map', errorDetails: error });
    }
  }

  reduce<T>(callback: (acc: T, value: V, key: K) => T, initialValue: T): T {
    try {
      let accumulator = initialValue;
      this.adapter.forEach((value, key) => {
        accumulator = callback(accumulator, value.value, key);
      });
      return accumulator;
    } catch (error: any) {
      throw CacheExceptionFactory.createException(CacheErrorCodes.UNEXPECTED_ERROR, `Error during "reduce" operation: ${error.message}`, { method: 'reduce', errorDetails: error });
    }
  }

  filter(callback: (value: V, key: K) => boolean): StorageAdapter<K, V> {
    try {
      const filteredAdapter: StorageAdapter<K, V> = new MapStorageAdapter();
      this.adapter.forEach((value, key) => {
        if (callback(value.value, key)) {
          filteredAdapter.set(key, value.value);
        }
      });
      return filteredAdapter;
    } catch (error: any) {
      throw CacheExceptionFactory.createException(CacheErrorCodes.UNEXPECTED_ERROR, `Error during "filter" operation: ${error.message}`, { method: 'filter', errorDetails: error });
    }
  }

  groupBy<T>(keySelector: (value: V, key: K) => T): Map<T, V[]> {
    try {
      const groups = new Map<T, V[]>();
      this.adapter.forEach((value, key) => {
        const groupKey = keySelector(value.value, key);
        const group = groups.get(groupKey) || [];
        group.push(value.value);
        groups.set(groupKey, group);
      });
      return groups;
    } catch (error: any) {
      throw CacheExceptionFactory.createException(CacheErrorCodes.UNEXPECTED_ERROR, `Error during "groupBy" operation: ${error.message}`, { method: 'groupBy', errorDetails: error });
    }
  }
  find(callback: (value: V, key: K) => boolean): V | undefined {
    try {
      for (const [key, value] of this.adapter.entries()) {
        if (callback(value.value, key)) {
          return value.value;
        }
      }
      return undefined;
    } catch (error: any) {
      throw CacheExceptionFactory.createException(CacheErrorCodes.UNEXPECTED_ERROR, `Error during "find" operation: ${error.message}`, { method: 'find', errorDetails: error });
    }
  }

  merge(other: StorageAdapter<K, V>): void {
    other.forEach((value, key) => {
      this.adapter.set(key, { value });
    });
  }

  toArray(): [K, CacheEntry<K, V>][] {
    return Array.from(this.adapter.entries());
  }
  // Get the maximum value based on a comparator
  max(comparator: (valueA: V, valueB: V) => number): CacheEntry<K, V> | undefined {
    try {
      let maxValue: CacheEntry<K, V> | undefined;
      for (const [_, value] of this.adapter.entries()) {
        if (maxValue === undefined || comparator(value.value, maxValue.value) > 0) {
          maxValue = value;
        }
      }
      return maxValue;
    } catch (error: any) {
      throw CacheExceptionFactory.createException(CacheErrorCodes.UNEXPECTED_ERROR, `Error during "max" operation: ${error.message}`, { method: 'max', errorDetails: error });
    }
  }
  // Get the minimum value based on a comparator
  min(comparator: (valueA: V, valueB: V) => number): CacheEntry<K, V> | undefined {
    try {
      let minValue: CacheEntry<K, V> | undefined;
      for (const [_, value] of this.adapter.entries()) {
        if (minValue === undefined || comparator(value.value, minValue.value) < 0) {
          minValue = value;
        }
      }
      return minValue;
    } catch (error: any) {
      throw CacheExceptionFactory.createException(CacheErrorCodes.UNEXPECTED_ERROR, `Error during "min" operation: ${error.message}`, { method: 'min', errorDetails: error });
    }
  }

  // Calculate the average value of numerical data
  average(callback: (value: V) => number): number {
    try {
      let total = 0;
      let count = 0;
      this.adapter.forEach((value) => {
        total += callback(value.value);
        count++;
      });
      return count === 0 ? 0 : total / count;
    } catch (error: any) {
      throw CacheExceptionFactory.createException(CacheErrorCodes.UNEXPECTED_ERROR, `Error during "average" operation: ${error.message}`, { method: 'average', errorDetails: error });
    }
  }

  // Find the first key satisfying a condition
  findKey(callback: (value: V, key: K) => boolean): K | undefined {
    try {
      for (const [key, value] of this.adapter.entries()) {
        if (callback(value.value, key)) {
          return key;
        }
      }
      return undefined;
    } catch (error: any) {
      throw CacheExceptionFactory.createException(CacheErrorCodes.UNEXPECTED_ERROR, `Error during "findKey" operation: ${error.message}`, { method: 'findKey', errorDetails: error });
    }
  }
}
