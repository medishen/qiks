import { expect } from 'chai';
import { WeakStorage } from '../../../src/utils/WeakStorage';
import { beforeEach, describe, it } from 'mocha';
import { CacheError } from '../../../src/errors/CacheError';

describe('WeakStorage', () => {
  let storage: WeakStorage<object, string>;

  // Before each test, we initialize a fresh WeakStorage instance
  beforeEach(() => {
    storage = new WeakStorage<object, string>();
  });

  describe('set() method', () => {
    it('should add a new key-value pair to the storage', () => {
      const key = { id: 1 };
      const value = 'value1';

      storage.set(key, value);
      const retrievedValue = storage.get(key);
      expect(retrievedValue).to.equal(value);
    });

    it('should throw error if key is not an object', () => {
      expect(() => storage.set('stringKey' as any, 'value')).to.throw(CacheError, 'Keys must be non-null objects.');
    });

    it('should overwrite the value if key already exists', () => {
      const key = { id: 2 };
      storage.set(key, 'value1');
      storage.set(key, 'value2');
      const retrievedValue = storage.get(key);
      expect(retrievedValue).to.equal('value2');
    });
  });

  describe('get() method', () => {
    it('should retrieve the value associated with the key', () => {
      const key = { id: 3 };
      const value = 'value3';
      storage.set(key, value);
      const retrievedValue = storage.get(key);
      expect(retrievedValue).to.equal(value);
    });

    it('should return undefined if the key does not exist', () => {
      const key = { id: 4 };
      const retrievedValue = storage.get(key);
      expect(retrievedValue).to.be.undefined;
    });
  });

  describe('delete() method', () => {
    it('should delete a key-value pair from the storage', () => {
      const key = { id: 5 };
      storage.set(key, 'value5');
      storage.delete(key);
      const retrievedValue = storage.get(key);
      expect(retrievedValue).to.be.undefined;
    });

    it('should not throw error when deleting a non-existent key', () => {
      const key = { id: 6 };
      expect(() => storage.delete(key)).to.not.throw();
    });
  });

  describe('has() method', () => {
    it('should return true if the key exists', () => {
      const key = { id: 7 };
      storage.set(key, 'value7');
      const result = storage.has(key);
      expect(result).to.be.true;
    });

    it('should return false if the key does not exist', () => {
      const key = { id: 8 };
      const result = storage.has(key);
      expect(result).to.be.false;
    });
  });

  describe('keys() method', () => {
    it('should return an iterator of all keys', () => {
      const key1 = { id: 9 };
      const key2 = { id: 10 };
      storage.set(key1, 'value9');
      storage.set(key2, 'value10');
      const keys: object[] = Array.from(storage.keys());
      expect(keys).to.deep.equal([key1, key2]);
    });
  });

  describe('entries() method', () => {
    it('should return an iterator of all key-value pairs', () => {
      const key1 = { id: 11 };
      const key2 = { id: 12 };
      storage.set(key1, 'value11');
      storage.set(key2, 'value12');
      const entries: [object, string][] = Array.from(storage.entries());
      expect(entries).to.deep.equal([
        [key1, 'value11'],
        [key2, 'value12'],
      ]);
    });
  });

  describe('clear() method', () => {
    it('should clear all entries from the storage', () => {
      const key1 = { id: 13 };
      const key2 = { id: 14 };
      storage.set(key1, 'value13');
      storage.set(key2, 'value14');
      storage.clear();
      expect(storage.get(key1)).to.be.undefined;
      expect(storage.get(key2)).to.be.undefined;
    });
  });

  describe('size() method', () => {
    it('should return the correct size of the storage', () => {
      const key1 = { id: 15 };
      const key2 = { id: 16 };
      storage.set(key1, 'value15');
      storage.set(key2, 'value16');
      expect(storage.size()).to.equal(2);
    });

    it('should return 0 when storage is empty', () => {
      expect(storage.size()).to.equal(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle storing null or undefined values as values', () => {
      const key = { id: 17 };
      storage.set(key, undefined);
      expect(storage.get(key)).to.be.undefined;

      storage.set(key, undefined);
      expect(storage.get(key)).to.be.undefined;
    });

    it('should handle storing complex objects as keys', () => {
      const key = { id: 18, nested: { prop: 'value' } };
      storage.set(key, 'complexValue');
      const retrievedValue = storage.get(key);
      expect(retrievedValue).to.equal('complexValue');
    });

    it('should throw error when non-object key is used (like null or primitive values)', () => {
      const invalidKey = null;
      expect(() => storage.set(invalidKey as any, 'value')).to.throw(CacheError, 'Keys must be non-null objects.');
    });
  });
});
