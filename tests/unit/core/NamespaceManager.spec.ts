import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import { CacheEntry } from '../../../src/types/CacheTypes';
import { NamespaceCache } from '../../../src/core/NamespaceManager';
import { CacheError } from '../../../src/errors/CacheError';
describe('NamespaceCache', () => {
  let storage: Map<string, CacheEntry<string>>;
  let namespaceCache: NamespaceCache<string, object>;
  const serializer = {
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  };

  beforeEach(() => {
    storage = new Map();
    namespaceCache = new NamespaceCache(storage, 'testNamespace', serializer);
  });

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
    const anotherNamespaceCache = new NamespaceCache(storage, 'anotherNamespace', serializer);

    namespaceCache.set('user1', { name: 'Alice' });
    anotherNamespaceCache.set('user2', { name: 'Bob' });

    expect(namespaceCache.size()).to.deep.equal(1);
    expect(anotherNamespaceCache.size()).to.deep.equal(1);

    namespaceCache.clear();

    expect(namespaceCache.size()).to.deep.equal(0);
    expect(anotherNamespaceCache.size()).to.deep.equal(1);
  });

  it('should correctly determine the size of the namespace', () => {
    namespaceCache.set('user1', { name: 'Alice' });
    namespaceCache.set('user2', { name: 'Bob' });

    expect(namespaceCache.size()).to.deep.equal(2);
  });

  it('should return true for existing keys in the namespace', () => {
    namespaceCache.set('user1', { name: 'Alice' });

    expect(namespaceCache.has('user1')).to.deep.equal(true);
  });

  it('should return false for non-existent keys', () => {
    expect(namespaceCache.has('nonExistentKey')).to.deep.equal(false);
  });

  it('should respect TTL expiration for set keys', async () => {
    namespaceCache.set('user1', { name: 'Alice' }, { ttl: 100 });

    expect(namespaceCache.get('user1')).to.deep.equal({ name: 'Alice' });

    // Wait for TTL to expire
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(namespaceCache.get('user1')).to.be.null;
  });

  it('should not count expired keys in size', async () => {
    namespaceCache.set('user1', { name: 'Alice' }, { ttl: 100 });
    namespaceCache.set('user2', { name: 'Bob' });

    expect(namespaceCache.size()).to.deep.equal(2);

    // Wait for TTL to expire
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(namespaceCache.size()).to.deep.equal(1);
  });

  it('should handle compound keys correctly across namespaces', () => {
    const anotherNamespaceCache = new NamespaceCache(storage, 'anotherNamespace', serializer);

    namespaceCache.set('user1', { name: 'Alice' });
    anotherNamespaceCache.set('user1', { name: 'Bob' });

    expect(namespaceCache.get('user1')).to.deep.equal({ name: 'Alice' });
    expect(anotherNamespaceCache.get('user1')).to.deep.equal({ name: 'Bob' });

    namespaceCache.delete('user1');

    expect(namespaceCache.get('user1')).to.be.null;
    expect(anotherNamespaceCache.get('user1')).to.deep.equal({ name: 'Bob' });
  });

  it('should throw error when setting a key with an empty namespace', () => {
    expect(() => {
      new NamespaceCache(storage, '', serializer).set('key', { name: 'Alice' });
    }).to.throw(CacheError, 'Namespace name must not be empty');
  });

  it('should throw error when setting a key with an empty key name', () => {
    expect(() => {
      namespaceCache.set('', { name: 'Alice' });
    }).to.throw(CacheError, 'Key must not be empty');
  });

  it('should handle clearing an empty namespace gracefully', () => {
    expect(namespaceCache.size()).to.deep.equal(0);
    namespaceCache.clear();
    expect(namespaceCache.size()).to.deep.equal(0);
  });

  it('should clear expired keys only in size calculation', async () => {
    namespaceCache.set('user1', { name: 'Alice' }, { ttl: 100 });
    namespaceCache.set('user2', { name: 'Bob' }, { ttl: 200 });

    expect(namespaceCache.size()).to.deep.equal(2);

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(namespaceCache.size()).to.deep.equal(1);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(namespaceCache.size()).to.deep.equal(0);
  });

  it('should allow setting duplicate keys across different namespaces', () => {
    const anotherNamespaceCache = new NamespaceCache(storage, 'anotherNamespace', serializer);

    namespaceCache.set('user1', { name: 'Alice' });
    anotherNamespaceCache.set('user1', { name: 'Bob' });

    expect(namespaceCache.get('user1')).to.deep.equal({ name: 'Alice' });
    expect(anotherNamespaceCache.get('user1')).to.deep.equal({ name: 'Bob' });
  });
  describe('Edge Cases', () => {
    it('should behave correctly with an empty parentStorage', () => {
      expect(namespaceCache.size()).to.deep.equal(0);
      expect(namespaceCache.get('anyKey')).to.be.null;
    });
    it('should handle namespaces with special characters', () => {
      const specialNamespaceCache = new NamespaceCache(storage, 'special@namespace!', serializer);
      specialNamespaceCache.set('user1', { name: 'Alice' });

      expect(specialNamespaceCache.get('user1')).to.deep.equal({ name: 'Alice' });
      expect(specialNamespaceCache.size()).to.deep.equal(1);
    });
    it('should handle keys with special characters', () => {
      namespaceCache.set('user@1!', { name: 'Alice' });
      expect(namespaceCache.get('user@1!')).to.deep.equal({ name: 'Alice' });
    });
    it('should handle concurrent namespace operations', () => {
      const anotherNamespaceCache = new NamespaceCache(storage, 'anotherNamespace', serializer);

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
      const anotherNamespaceCache = new NamespaceCache(storage, 'testNamespaceExtra', serializer);

      namespaceCache.set('user1', { name: 'Alice' });
      anotherNamespaceCache.set('user1', { name: 'Bob' });
      namespaceCache.clear();
      expect(namespaceCache.size()).to.deep.equal(0);

      expect(anotherNamespaceCache.size()).to.deep.equal(1);
    });
    it('should handle a large number of keys efficiently', () => {
      for (let i = 0; i < 10000; i++) {
        namespaceCache.set(`user${i}`, { id: i });
      }
      expect(namespaceCache.size()).to.deep.equal(10000);
      expect(namespaceCache.get('user9999')).to.deep.equal({ id: 9999 });
    });
  });
});
