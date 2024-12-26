import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import { CacheItem, StorageAdapter } from '../../../../src/types/CacheTypes';
import { createStorageAdapter } from '../../../../src/utils';
import { CacheError } from '../../../../src/errors/CacheError';
import { NamespaceCache } from '../../../../src/core/managers/NamespaceManager';
describe('NamespaceCache', () => {
  let storage: StorageAdapter<string, CacheItem<string>>;
  let namespaceCache: NamespaceCache<string, object>;
  const serializer = {
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  };

  beforeEach(() => {
    const rawStorage = new Map<string, CacheItem<string>>();
    storage = createStorageAdapter<string, CacheItem<string>>(rawStorage);
    namespaceCache = new NamespaceCache({
      namespace: 'testNamespace',
      parentStorage: storage,
      serializer: serializer,
      policy: 'LRU',
    });
  });

  describe('Basic Functionality', () => {
    it('should set and retrieve a value by key within namespace', () => {
      const value = { name: 'Alice' };
      namespaceCache.set('user1', value);
      expect(namespaceCache.get('user1')).to.deep.equal(value);
    });

    it('should return null when getting a non-existent key', () => {
      expect(namespaceCache.get('nonExistentKey')).to.be.null;
    });

    it('should delete a key-value pair within namespace', () => {
      const value = { name: 'Alice' };
      namespaceCache.set('user1', value);
      expect(namespaceCache.get('user1')).to.deep.equal(value);

      namespaceCache.delete('user1');
      expect(namespaceCache.get('user1')).to.be.null;
    });

    it('should only clear keys within its namespace', () => {
      const anotherNamespaceCache = new NamespaceCache({
        namespace: 'anotherNamespace',
        parentStorage: storage,
        serializer: serializer,
        policy: 'LRU',
      });

      namespaceCache.set('user1', { name: 'Alice' });
      anotherNamespaceCache.set('user2', { name: 'Bob' });

      expect(namespaceCache.size()).to.equal(1);
      expect(anotherNamespaceCache.size()).to.equal(1);

      namespaceCache.clear();

      expect(namespaceCache.size()).to.equal(0);
      expect(anotherNamespaceCache.size()).to.equal(1);
    });

    it('should correctly determine the size of the namespace', () => {
      namespaceCache.set('user1', { name: 'Alice' });
      namespaceCache.set('user2', { name: 'Bob' });

      expect(namespaceCache.size()).to.equal(2);
    });

    it('should return true for existing keys in the namespace', () => {
      namespaceCache.set('user1', { name: 'Alice' });
      expect(namespaceCache.has('user1')).to.equal(true);
    });

    it('should return false for non-existent keys', () => {
      expect(namespaceCache.has('nonExistentKey')).to.equal(false);
    });
  });

  describe('TTL Expiration', () => {
    it('should respect TTL expiration for set keys', async () => {
      namespaceCache.set('user1', { name: 'Alice' }, { ttl: 100 });
      expect(namespaceCache.get('user1')).to.deep.equal({ name: 'Alice' });

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(namespaceCache.get('user1')).to.be.null;
    });

    it('should not count expired keys in size', async () => {
      namespaceCache.set('user1', { name: 'Alice' }, { ttl: 100 });
      namespaceCache.set('user2', { name: 'Bob' });

      expect(namespaceCache.size()).to.equal(2);

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(namespaceCache.size()).to.equal(1);
    });

    it('should clear expired keys only in size calculation', async () => {
      namespaceCache.set('user1', { name: 'Alice' }, { ttl: 100 });
      namespaceCache.set('user2', { name: 'Bob' }, { ttl: 200 });

      expect(namespaceCache.size()).to.equal(2);

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(namespaceCache.size()).to.equal(1);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(namespaceCache.size()).to.equal(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle namespaces with special characters', () => {
      const specialNamespaceCache = new NamespaceCache({
        namespace: 'special@namespace!',
        parentStorage: storage,
        serializer: serializer,
        policy: 'LRU',
      });
      specialNamespaceCache.set('user1', { name: 'Alice' });

      expect(specialNamespaceCache.get('user1')).to.deep.equal({ name: 'Alice' });
      expect(specialNamespaceCache.size()).to.equal(1);
    });

    it('should handle keys with special characters', () => {
      namespaceCache.set('user@1!', { name: 'Alice' });
      expect(namespaceCache.get('user@1!')).to.deep.equal({ name: 'Alice' });
    });

    it('should throw error when setting a key with an empty namespace', () => {
      expect(() => {
        new NamespaceCache({
          namespace: '',
          parentStorage: storage,
          serializer: serializer,
          policy: 'LRU',
        });
      }).to.throw(CacheError, 'Namespace name must not be empty');
    });

    it('should throw error when setting a key with an empty key name', () => {
      expect(() => {
        namespaceCache.set('', { name: 'Alice' });
      }).to.throw(CacheError, 'Key must not be empty');
    });

    it('should handle clearing an empty namespace gracefully', () => {
      expect(namespaceCache.size()).to.equal(0);
      namespaceCache.clear();
      expect(namespaceCache.size()).to.equal(0);
    });

    it('should handle a large number of keys efficiently', () => {
      for (let i = 0; i < 10000; i++) {
        namespaceCache.set(`user${i}`, { id: i });
      }
      expect(namespaceCache.size()).to.equal(10000);
      expect(namespaceCache.get('user9999')).to.deep.equal({ id: 9999 });
    });

    it('should handle concurrent namespace operations', () => {
      const anotherNamespaceCache = new NamespaceCache({
        namespace: 'anotherNamespace',
        parentStorage: storage,
        serializer: serializer,
        policy: 'LRU',
      });

      namespaceCache.set('user1', { name: 'Alice' });
      anotherNamespaceCache.set('user1', { name: 'Bob' });

      expect(namespaceCache.get('user1')).to.deep.equal({ name: 'Alice' });
      expect(anotherNamespaceCache.get('user1')).to.deep.equal({ name: 'Bob' });
    });

    it('should handle case sensitivity in keys', () => {
      namespaceCache.set('User1', { name: 'Alice' });
      namespaceCache.set('user1', { name: 'Bob' });

      expect(namespaceCache.get('User1')).to.deep.equal({ name: 'Alice' });
      expect(namespaceCache.get('user1')).to.deep.equal({ name: 'Bob' });
    });

    it('should not clear keys with similar prefixes in other namespaces', () => {
      const anotherNamespaceCache = new NamespaceCache({
        namespace: 'testNamespaceExtra',
        parentStorage: storage,
        serializer: serializer,
        policy: 'LRU',
      });
      namespaceCache.set('user1', { name: 'Alice' });
      anotherNamespaceCache.set('user1', { name: 'Bob' });

      namespaceCache.clear();

      expect(namespaceCache.size()).to.equal(0);
      expect(anotherNamespaceCache.size()).to.equal(1);
    });
  });
});
