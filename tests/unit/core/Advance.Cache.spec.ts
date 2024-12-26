import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import { Cache } from '../../../src/core/Cache';
import { CacheError } from '../../../src/errors/CacheError';
import { Serializer } from '../../../src/core/managers/Serializer';
import { CacheItem, EventCallback, StorageAdapter } from '../../../src/types/CacheTypes';
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

      objKey = null;
      global.gc?.();

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
  describe('Cache Dependency Management', () => {
    it('should delete dependent keys when the parent is deleted', () => {
      const mapStorage = new Map<any, CacheItem<string>>();
      const storage = createStorageAdapter<any, CacheItem<string>>(mapStorage);
      const cache = new Cache<string, string>({ storage, serializer: Serializer, policy: 'LRU' });
      cache.set('parent', 'value1');
      cache.set('child1', 'value2', { dependsOn: 'parent' });
      cache.set('child2', 'value3', { dependsOn: 'parent' });

      cache.delete('parent');

      expect(cache.has('parent')).to.be.false;
      expect(cache.has('child1')).to.be.false;
      expect(cache.has('child2')).to.be.false;
    });

    it('should handle complex dependency chains', () => {
      const mapStorage = new Map<any, CacheItem<string>>();
      const storage = createStorageAdapter<any, CacheItem<string>>(mapStorage);
      const cache = new Cache<string, string>({ storage, serializer: Serializer, policy: 'LRU' });
      cache.set('key1', 'value1');
      cache.set('key2', 'value2', { dependsOn: 'key1' });
      cache.set('key3', 'value3', { dependsOn: 'key2' });

      cache.delete('key1');

      expect(cache.has('key1')).to.be.false;
      expect(cache.has('key2')).to.be.false;
      expect(cache.has('key3')).to.be.false;
    });

    it('should throw an error if the parent key does not exist', () => {
      const mapStorage = new Map<any, CacheItem<string>>();
      const storage = createStorageAdapter<any, CacheItem<string>>(mapStorage);
      const cache = new Cache<string, string>({ storage, serializer: Serializer, policy: 'LRU' });

      expect(() => cache.set('child', 'value', { dependsOn: 'nonexistent' })).to.throw(CacheError, 'Parent key "nonexistent" does not exist.');
    });
  });
  it('should trigger onExpire callback when the item expires', (done) => {
    const mapStorage = new Map<any, CacheItem<string>>();
    const storage = createStorageAdapter<any, CacheItem<string>>(mapStorage);
    const cache = new Cache<string, string>({ storage, serializer: Serializer, policy: 'LRU' });
    const onExpireSpy = (key: string, value: string | null) => {
      expect(key).to.deep.equal('testKey');
      expect(value).to.deep.equal('testValue');
      done();
    };

    cache.set('testKey', 'testValue', { ttl: 50, onExpire: onExpireSpy });

    setTimeout(() => {
      expect(cache.get('testKey')).to.be.null;
    }, 100);
  });

  it('should handle onExpire when multiple items expire simultaneously', (done) => {
    const mapStorage = new Map<any, CacheItem<string>>();
    const storage = createStorageAdapter<any, CacheItem<string>>(mapStorage);
    const cache = new Cache<string, string>({ storage, serializer: Serializer, policy: 'LRU' });
    const onExpireSpy = (key: string, value: string | null) => {
      expect(['key1', 'key2']).to.include(key);
      expect(['value1', 'value2']).to.include(value);
    };

    cache.set('key1', 'value1', { ttl: 50, onExpire: onExpireSpy });
    cache.set('key2', 'value2', { ttl: 50, onExpire: onExpireSpy });

    setTimeout(() => {
      expect(cache.get('key1')).to.be.null;
      expect(cache.get('key2')).to.be.null;
      done();
    }, 100);
  });

  it('should work with dependent keys and trigger onExpire for all dependents', (done) => {
    const mapStorage = new Map<any, CacheItem<string>>();
    const storage = createStorageAdapter<any, CacheItem<string>>(mapStorage);
    const cache = new Cache<string, string>({ storage, serializer: Serializer, policy: 'LRU' });
    const expiredKeys: string[] = [];

    const onExpireSpy = (key: string, value: string | null) => {
      expiredKeys.push(key);
      if (expiredKeys.length === 3) {
        expect(expiredKeys).to.have.members(['parent', 'child1', 'child2']);
        done();
      }
    };

    cache.set('parent', 'value1', { ttl: 50, onExpire: onExpireSpy });
    cache.set('child1', 'value2', { dependsOn: 'parent', onExpire: onExpireSpy });
    cache.set('child2', 'value3', { dependsOn: 'parent', onExpire: onExpireSpy });

    setTimeout(() => {
      expect(cache.get('parent')).to.be.null;
      expect(cache.get('child1')).to.be.null;
      expect(cache.get('child2')).to.be.null;
    }, 100);
  });
  describe('Cache - Observer Management', () => {
    let storage: StorageAdapter<string, CacheItem<string>>;
    let cache: Cache<string, string>;
    const mapStorage = new Map<string, CacheItem<string>>();

    beforeEach(() => {
      storage = createStorageAdapter<string, CacheItem<string>>(mapStorage);
      cache = new Cache<string, string>({
        storage,
        serializer: { serialize: JSON.stringify, deserialize: JSON.parse },
        policy: 'LRU',
      });
      mapStorage.clear();
    });

    describe('observeKey', () => {
      it('should register an observer for a given key', () => {
        const key = 'user:1';
        const callback: EventCallback<string, string> = (key, value) => {
          expect(key).to.equal('user:1');
          expect(value).to.equal('John Doe');
        };
        cache.set(key, 'John Doe');
        cache.observeKey(key, callback);
        cache.set(key, 'John Doe');
      });

      it('should trigger the observer when the key is updated', (done) => {
        const key = 'user:1';
        const callback: EventCallback<string, string> = (key, value) => {
          expect(key).to.equal('user:1');
          expect(value).to.equal('Jane Doe');
          done();
        };
        cache.set(key, 'John Doe');
        cache.observeKey(key, callback);
        cache.set(key, 'Jane Doe');
      });

      it('should throw an error if the key does not exist when observing', () => {
        const key = 'user:1';
        const callback: EventCallback<string, string> = () => {};
        expect(() => cache.observeKey(key, callback)).to.throw(CacheError, `Key "${key}" does not exist in the cache.`);
      });

      it('should throw an error if the observer is already registered for the key', () => {
        const key = 'user:1';
        const callback: EventCallback<string, string> = () => {};

        cache.set(key, 'John Doe');

        cache.observeKey(key, callback);

        expect(() => cache.observeKey(key, callback)).to.throw(CacheError, `Observer already registered for key "${key}".`);
      });
    });

    describe('unobserveKey', () => {
      it('should unregister an observer for a given key', () => {
        const key = 'user:1';
        const callback: EventCallback<string, string> = () => {};

        cache.set(key, 'John Doe');

        cache.observeKey(key, callback);

        cache.unobserveKey(key, callback);

        expect(() => cache.set(key, 'Jane Doe')).to.not.throw();
      });

      it('should throw an error if the observer was not previously registered', () => {
        const key = 'user:1';
        const callback: EventCallback<string, string> = () => {};

        cache.set(key, 'John Doe');

        expect(() => cache.unobserveKey(key, callback)).to.throw(CacheError, `No observers found for key "${key}".`);
      });
    });
  });
});
