import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import { Qiks } from '../../../src';
import { CacheExceptionFactory } from '../../../src/errors';

describe('Cache Class - Advanced Tests', () => {
  let cache: Qiks<object, any>;

  beforeEach(() => {
    cache = new Qiks({
      evictionPolicy: 'LRU',
      storage: 'weakmap',
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
  });

  describe('Set and Map Support', () => {
    it('should store and retrieve Map values', () => {
      const cache = new Qiks<object, string[][]>({
        storage: 'map',
        evictionPolicy: 'LRU',
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
      const s = cache.get(arrayKey);
      console.log('S:', s);

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
      const circularKey: any = { self: {} };
      const value = 'circularValue';
      cache.set(circularKey, value);
      expect(cache.get(circularKey)).to.equal(value);
    });

    it('should handle mixed key types in Map storage', () => {
      const mixedCache = new Qiks<object, string>({
        storage: 'map',
        evictionPolicy: 'LRU',
      });

      const objKey = { id: 1 };
      const arrayKey = [1, 2, 3];

      mixedCache.set(objKey, 'objValue');
      mixedCache.set(arrayKey, 'arrayValue');

      expect(mixedCache.get(objKey)).to.equal('objValue');
      expect(mixedCache.get(arrayKey)).to.equal('arrayValue');
    });

    it('should handle simultaneous operations on large data sets', () => {
      const largeDataSet = new Qiks<object, number>({
        maxSize: 10000,
        storage: 'map',
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
  });
  describe('Cache Dependency Management', () => {
    it('should delete dependent keys when the parent is deleted', () => {
      const cache = new Qiks<string, string>({ storage: 'map' });
      cache.set('parent', 'value1');
      cache.set('child1', 'value2', { dependsOn: 'parent' });
      cache.set('child2', 'value3', { dependsOn: 'parent' });

      cache.delete('parent');

      expect(cache.has('parent')).to.be.false;
      expect(cache.has('child1')).to.be.false;
      expect(cache.has('child2')).to.be.false;
    });

    it('should handle complex dependency chains', () => {
      const cache = new Qiks<string, string>({ storage: 'map' });
      cache.set('key1', 'value1');
      cache.set('key2', 'value2', { dependsOn: 'key1' });
      cache.set('key3', 'value3', { dependsOn: 'key2' });

      cache.delete('key1');

      expect(cache.has('key1')).to.be.false;
      expect(cache.has('key2')).to.be.false;
      expect(cache.has('key3')).to.be.false;
    });
  });
  describe('onExpire Option Management', () => {
    it('should trigger onExpire callback when the item expires', () => {
      const cache = new Qiks<string, string>({ storage: 'map' });
      const onExpireSpy = (key: string, value: string | null) => {
        expect(key).to.deep.equal('testKey');
        expect(value).to.deep.equal('testValue');
      };
      cache.set('testKey', 'testValue', { ttl: 50, onExpire: onExpireSpy });
      setTimeout(() => {
        expect(cache.get('testKey')).to.be.null;
      }, 100);
    });
    it('should handle onExpire when multiple items expire simultaneously', () => {
      const cache = new Qiks<string, string>({ storage: 'map' });
      const onExpireSpy = (key: string, value: string | null) => {
        expect(['key1', 'key2']).to.include(key);
        expect(['value1', 'value2']).to.include(value);
      };
      cache.set('key1', 'value1', { ttl: 50, onExpire: onExpireSpy });
      cache.set('key2', 'value2', { ttl: 50, onExpire: onExpireSpy });
      setTimeout(() => {
        expect(cache.get('key1')).to.be.null;
        expect(cache.get('key2')).to.be.null;
      }, 100);
    });
    it('should work with dependent keys and trigger onExpire for all dependents', () => {
      const cache = new Qiks<string, string>({ storage: 'map' });
      const expiredKeys: string[] = [];
      const onExpireSpy = (key: string, value: string | null) => {
        expiredKeys.push(key);
        if (expiredKeys.length === 3) {
          expect(expiredKeys).to.have.members(['parent', 'child1', 'child2']);
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
  });

  describe('Cache - Pattern Matcher', () => {
    let cache: Qiks<string, string>;

    beforeEach(() => {
      cache = new Qiks<string, string>({
        storage: 'map',
      });
    });

    it('should return matching keys for a given pattern', () => {
      cache.set('user:1', 'John Doe');
      cache.set('user:2', 'Jane Doe');
      cache.set('admin:1', 'Admin User');
      const results = cache.get('user:*');

      expect(results).to.have.members(['user:1', 'user:2']);
    });

    it('should return matching values for a given pattern', () => {
      cache.set('user:1', 'John Doe');
      cache.set('user:2', 'Jane Doe');
      cache.set('admin:1', 'Admin User');

      const results = cache.get('user:*', { withTuple: true });

      // Extract only values
      const values = results?.map((entry) => entry.value);

      expect(values).to.have.members(['John Doe', 'Jane Doe']);
    });

    it('should return matching key-value tuples for a given pattern', () => {
      cache.set('user:1', 'John Doe');
      cache.set('user:2', 'Jane Doe');
      cache.set('admin:1', 'Admin User');

      const results = cache.get('user:*', { withTuple: true });
      expect(results).to.deep.equal([
        { key: 'user:1', value: 'John Doe' },
        { key: 'user:2', value: 'Jane Doe' },
      ]);
    });

    it('should handle an empty pattern and return no matches', () => {
      const results = cache.get('nonexistent:*');
      expect(results).to.be.null;
    });
  });
});
