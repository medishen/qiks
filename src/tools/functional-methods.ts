import { StorageAdapter } from '../common/interfaces';
import { CacheExceptionFactory } from '../errors';
import { MapStorageAdapter } from '../storage';

export class FunctionalMethods<K, V> {
  constructor(private adapter: StorageAdapter<K, V>) {}

  every(predicate: (value: V, key: K) => boolean): boolean {
    try {
      return Array.from(this.adapter.entries()).every(([key, value]) => predicate(value, key));
    } catch (error: any) {
      throw CacheExceptionFactory.unexpectedError('Error during "every" operation: ' + error.message);
    }
  }

  some(predicate: (value: V, key: K) => boolean): boolean {
    try {
      return Array.from(this.adapter.entries()).some(([key, value]) => predicate(value, key));
    } catch (error: any) {
      throw CacheExceptionFactory.unexpectedError('Error during "some" operation: ' + error.message);
    }
  }

  map<T>(callback: (value: V, key: K) => T): T[] {
    try {
      const results: T[] = [];
      this.adapter.forEach((value, key) => {
        results.push(callback(value, key));
      });
      return results;
    } catch (error: any) {
      throw CacheExceptionFactory.unexpectedError('Error during "map" operation: ' + error.message);
    }
  }

  reduce<T>(callback: (acc: T, value: V, key: K) => T, initialValue: T): T {
    try {
      let accumulator = initialValue;
      this.adapter.forEach((value, key) => {
        accumulator = callback(accumulator, value, key);
      });
      return accumulator;
    } catch (error: any) {
      throw CacheExceptionFactory.unexpectedError('Error during "reduce" operation: ' + error.message);
    }
  }

  filter(callback: (value: V, key: K) => boolean): StorageAdapter<K, V> {
    try {
      const filteredAdapter: StorageAdapter<K, V> = new MapStorageAdapter(); // Creating a new adapter for filtered data
      this.adapter.forEach((value, key) => {
        if (callback(value, key)) {
          filteredAdapter.set(key, value);
        }
      });
      return filteredAdapter;
    } catch (error: any) {
      throw CacheExceptionFactory.unexpectedError('Error during "filter" operation: ' + error.message);
    }
  }

  groupBy<T>(keySelector: (value: V, key: K) => T): Map<T, V[]> {
    try {
      const groups = new Map<T, V[]>();
      this.adapter.forEach((value, key) => {
        const groupKey = keySelector(value, key);
        const group = groups.get(groupKey) || [];
        group.push(value);
        groups.set(groupKey, group);
      });
      return groups;
    } catch (error: any) {
      throw CacheExceptionFactory.unexpectedError('Error during "groupBy" operation: ' + error.message);
    }
  }
  find(callback: (value: V, key: K) => boolean): V | undefined {
    try {
      for (const [key, value] of this.adapter.entries()) {
        if (callback(value, key)) {
          return value;
        }
      }
      return undefined;
    } catch (error: any) {
      throw CacheExceptionFactory.unexpectedError('Error during "find" operation: ' + error.message);
    }
  }

  merge(other: StorageAdapter<K, V>): void {
    other.forEach((value, key) => {
      this.adapter.set(key, value);
    });
  }

  toArray(opts: { keys: boolean; values: boolean; entries: boolean }): [K, V][] {
    return Array.from(this.adapter.entries());
  }
  // Get the maximum value based on a comparator
  max(comparator: (valueA: V, valueB: V) => number): V | undefined {
    try {
      let maxValue: V | undefined;
      for (const [_, value] of this.adapter.entries()) {
        if (maxValue === undefined || comparator(value, maxValue) > 0) {
          maxValue = value;
        }
      }
      return maxValue;
    } catch (error: any) {
      throw CacheExceptionFactory.unexpectedError('Error during "max" operation: ' + error.message);
    }
  }
  // Get the minimum value based on a comparator
  min(comparator: (valueA: V, valueB: V) => number): V | undefined {
    try {
      let minValue: V | undefined;
      for (const [_, value] of this.adapter.entries()) {
        if (minValue === undefined || comparator(value, minValue) < 0) {
          minValue = value;
        }
      }
      return minValue;
    } catch (error: any) {
      throw CacheExceptionFactory.unexpectedError('Error during "min" operation: ' + error.message);
    }
  }

  // Calculate the average value of numerical data
  average(callback: (value: V) => number): number {
    try {
      let total = 0;
      let count = 0;
      this.adapter.forEach((value) => {
        total += callback(value);
        count++;
      });
      return count === 0 ? 0 : total / count;
    } catch (error: any) {
      throw CacheExceptionFactory.unexpectedError('Error during "average" operation: ' + error.message);
    }
  }

  // Find the first key satisfying a condition
  findKey(callback: (value: V, key: K) => boolean): K | undefined {
    try {
      for (const [key, value] of this.adapter.entries()) {
        if (callback(value, key)) {
          return key;
        }
      }
      return undefined;
    } catch (error: any) {
      throw CacheExceptionFactory.unexpectedError('Error during "findKey" operation: ' + error.message);
    }
  }
}
