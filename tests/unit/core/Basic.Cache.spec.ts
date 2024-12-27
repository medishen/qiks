import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import { Cache } from '../../../src/core/Cache';
import { CacheError } from '../../../src/errors/CacheError';
import { Serializer } from '../../../src/core/managers/Serializer';
import { CacheItem } from '../../../src/types/CacheTypes';
import { createStorageAdapter } from '../../../src/utils';
describe('Cache Class - Basic Tests', () => {
  let cache: Cache<string, number>;
  beforeEach(() => {
    const rawStorage = new Map<string, CacheItem<string>>();
    const storage = createStorageAdapter<string, CacheItem<string>>(rawStorage);
    cache = new Cache({
      serializer: Serializer,
      storage,
      policy: 'LRU',
    });
  });

  describe('Basic Operations', () => {
    it('should set and get values', () => {
      cache.set('a', 1);
      expect(cache.get('a')).to.equal(1);
    });

    it('should return null for non-existent keys', () => {
      expect(cache.get('non-existent')).to.be.null;
    });

    it('should delete a key and its value', () => {
      cache.set('key', 42);
      cache.delete('key');
      expect(cache.get('key')).to.be.null;
    });

    it('should clear all keys and values', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.clear();
      expect(cache.get('a')).to.be.null;
      expect(cache.get('b')).to.be.null;
    });
  });

  describe('TTL (Time-to-Live)', () => {
    it('should respect TTL and remove expired keys', async () => {
      cache.set('temp', 123, { ttl: 100 });
      expect(cache.get('temp')).to.equal(123);

      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(cache.get('temp')).to.be.null;
    });

    it('should not set values with invalid TTL', () => {
      expect(() => cache.set('invalid', 123, { ttl: -1 })).to.throw(CacheError, 'TTL must be greater than 0');
    });
  });

  describe('Error Handling', () => {
    it('should throw an error for empty keys on set', () => {
      expect(() => cache.set('', 123)).to.throw(CacheError, 'Key must not be empty');
    });

    it('should throw an error for empty keys on get', () => {
      expect(() => cache.get('')).to.throw(CacheError, 'Key must not be empty');
    });

    it('should throw an error for empty keys on delete', () => {
      expect(() => cache.delete('')).to.throw(CacheError, 'Key must not be empty');
    });
  });

  describe('Edge Cases', () => {
    it('should handle overwriting values for the same key', () => {
      cache.set('duplicate', 1);
      expect(cache.get('duplicate')).to.equal(1);

      cache.set('duplicate', 2);
      expect(cache.get('duplicate')).to.equal(2);
    });
    it('should handle non-string keys correctly', () => {
      const objectKey = { id: 1 };
      const arrayKey = ['key'];

      cache.set(objectKey as unknown as string, 100);
      expect(cache.get(objectKey as unknown as string)).to.equal(100);

      cache.set(arrayKey as unknown as string, 200);
      expect(cache.get(arrayKey as unknown as string)).to.equal(200);
    });

    it('should allow setting null as a value', () => {
      cache.set('null-value', null as unknown as number);
      expect(cache.get('null-value')).to.equal(null);
    });

    it('should allow special characters in keys', () => {
      const specialKey = '!@#$%^&*()_+';
      cache.set(specialKey, 123);
      expect(cache.get(specialKey)).to.equal(123);
    });

    it('should not throw when clearing an already empty cache', () => {
      cache.clear();
      cache.clear();
      expect(cache.get('any-key')).to.be.null;
    });

    it('should handle extremely large values', () => {
      const largeValue = 'a'.repeat(10 ** 6);
      cache.set('large-value', largeValue as unknown as number);
      expect(cache.get('large-value')).to.equal(largeValue);
    });

    it('should allow setting a value to itself as a key', () => {
      const valueKey = 'value-as-key';
      cache.set(valueKey, valueKey as unknown as number);
      expect(cache.get(valueKey)).to.equal(valueKey);
    });

    it('should respect TTL when set multiple times for the same key', async () => {
      cache.set('temp', 1, { ttl: 100 });
      cache.set('temp', 2, { ttl: 200 });

      expect(cache.get('temp')).to.equal(2);

      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(cache.get('temp')).to.equal(2);

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(cache.get('temp')).to.be.null;
    });

    it('should handle rapid consecutive operations correctly', () => {
      for (let i = 0; i < 1000; i++) {
        cache.set(`key-${i}`, i);
      }
      for (let i = 0; i < 1000; i++) {
        expect(cache.get(`key-${i}`)).to.equal(i);
      }
      cache.clear();
      for (let i = 0; i < 1000; i++) {
        expect(cache.get(`key-${i}`)).to.be.null;
      }
    });

    it('should not throw an error when retrieving a key after clearing the cache', () => {
      cache.set('key-to-clear', 123);
      cache.clear();
      expect(() => cache.get('key-to-clear')).not.to.throw();
      expect(cache.get('key-to-clear')).to.be.null;
    });

    it('should return null for expired keys even when re-inserting with no TTL', async () => {
      cache.set('temp', 1, { ttl: 50 });
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(cache.get('temp')).to.be.null;

      cache.set('temp', 2);
      expect(cache.get('temp')).to.equal(2);
    });

    it('should handle removal of multiple keys without error', () => {
      cache.set('key1', 1);
      cache.set('key2', 2);
      cache.delete('key1');
      cache.delete('key2');
      expect(cache.get('key1')).to.be.null;
      expect(cache.get('key2')).to.be.null;
    });

    it('should handle simultaneous TTL expiration for multiple keys', async () => {
      cache.set('key1', 1, { ttl: 100 });
      cache.set('key2', 2, { ttl: 100 });
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(cache.get('key1')).to.be.null;
      expect(cache.get('key2')).to.be.null;
    });

    it('should handle keys with spaces', () => {
      const spacedKey = 'key with spaces';
      cache.set(spacedKey, 42);
      expect(cache.get(spacedKey)).to.equal(42);
    });
  });
});
