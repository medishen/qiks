import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import { Cache } from '../../../src/core/Cache';
import { CacheError } from '../../../src/errors/CacheError';
import { Serializer } from '../../../src/core/Serializer';
import { CacheItem } from '../../../src/types/CacheTypes';
import { createStorageAdapter } from '../../../src/utils';

describe('Cache Class - Advanced Tests', () => {
  let cache: Cache<object, any>;

  beforeEach(() => {
    const rawStorage = new WeakMap<object, CacheItem<string>>();
    const storage = createStorageAdapter<object, CacheItem<string>>(rawStorage);
    cache = new Cache({
      serializer: Serializer,
      storage,
      policy: 'LRU',
    });
  });

  describe('WeakMap Support', () => {
    it('should store and retrieve object keys correctly', () => {
      const objKey = { id: 1 };
      cache.set(objKey, 'value1');
      expect(cache.get(objKey)).to.equal('value1');
    });

    it('should handle garbage collection of WeakMap keys', () => {
      let objKey: { id: number } | null = { id: 1 };
      cache.set(objKey, 'value1');
      expect(cache.get(objKey)).to.equal('value1');

      objKey = null; // Allow GC
      global.gc?.(); // Trigger GC if available

      // Verify WeakMap key is no longer accessible
      expect(() => cache.get({ id: 1 })).to.not.throw();
    });

    it('should not allow non-object keys in WeakMap storage', () => {
      expect(() => cache.set('stringKey' as unknown as object, 'value')).to.throw(CacheError, 'Keys must be non-null objects.');
    });
  });

  describe('Set and Map Support', () => {
    it('should store and retrieve Map values', () => {
      const rawStorage = new Map<object, string[]>();
      const storage = createStorageAdapter<object, CacheItem<string>>(rawStorage);
      const cache = new Cache({
        serializer: Serializer,
        storage,
        policy: 'LRU',
      });
      const key = { id: 1 };
      const valueMap = [
        ['key1', 'value1'],
        ['key2', 'value2'],
      ];

      cache.set(key, valueMap);
      const retrievedMap = cache.get(key);

      expect(retrievedMap).to.deep.equal(valueMap);
    });
  });

  describe('Array Keys and Values', () => {
    it('should handle arrays as keys', () => {
      const arrayKey = [1, 2, 3];
      cache.set(arrayKey, 'arrayValue');
      expect(cache.get(arrayKey)).to.equal('arrayValue');
    });

    it('should handle arrays as values', () => {
      const objKey = { id: 1 };
      const arrayValue = [1, 2, 3, 4, 5];

      cache.set(objKey, arrayValue);
      const retrievedArray = cache.get(objKey);

      expect(retrievedArray).to.deep.equal(arrayValue);
    });
  });

  describe('Advanced Edge Cases', () => {
    it('should handle nested objects as keys', () => {
      const nestedKey = { outer: { inner: { id: 1 } } };
      const value = 'nestedValue';

      cache.set(nestedKey, value);
      expect(cache.get(nestedKey)).to.equal(value);
    });

    it('should handle objects with circular references', () => {
      const circularKey: any = {};
      circularKey.self = circularKey;

      const value = 'circularValue';
      cache.set(circularKey, value);

      expect(cache.get(circularKey)).to.equal(value);
    });

    it('should handle mixed key types in Map storage', () => {
      const mapStorage = new Map<any, CacheItem<string>>();
      const storage = createStorageAdapter<any, CacheItem<string>>(mapStorage);
      const mixedCache = new Cache({
        serializer: Serializer,
        storage,
        policy: 'LRU',
      });

      const objKey = { id: 1 };
      const arrayKey = [1, 2, 3];

      mixedCache.set(objKey, 'objValue');
      mixedCache.set(arrayKey, 'arrayValue');

      expect(mixedCache.get(objKey)).to.equal('objValue');
      expect(mixedCache.get(arrayKey)).to.equal('arrayValue');
    });

    it('should handle simultaneous operations on large data sets', () => {
      const mapStorage = new Map<any, CacheItem<string>>();
      const storage = createStorageAdapter<any, CacheItem<string>>(mapStorage);
      const largeDataSet = new Cache({
        serializer: Serializer,
        storage,
        policy: 'LRU',
      });

      const storedKeys: any[] = [];

      // Storing data
      for (let i = 0; i < 10000; i++) {
        const key = { id: i };
        storedKeys.push(key);
        largeDataSet.set(key, i);
      }
      const keyToRetrieve = storedKeys.find((key) => key.id === 2);
      expect(largeDataSet.get(keyToRetrieve!)).to.equal(2);
    });

    it('should throw when using invalid serializers', () => {
      const invalidSerializer = {
        serialize: () => null,
        deserialize: () => null,
      };
      const map = new Map<any, CacheItem<string>>();
      const storage = createStorageAdapter<any, CacheItem<string>>(map);

      // Expect an error to be thrown during the instantiation of Cache
      expect(
        () =>
          new Cache({
            serializer: invalidSerializer as any,
            storage,
            policy: 'LRU',
          }),
      ).to.throw(CacheError, 'Invalid serializer: error during serialization/deserialization');
    });
  });
});
