import { expect } from 'chai';
import { StorageAdapter } from '../../../dist/types/CacheTypes';
import { CacheEntry } from '../../../src/common/interfaces/cache/cache-entry.interface';
import { LRUEvictionPolicy } from '../../../src/eviction/lru.eviction';
import { CacheStorageAdapter } from '../../../src/common';
import { MapStorageAdapter } from '../../../src/storage';
import { LFUEvictionPolicy, MRUEvictionPolicy } from '../../../src/eviction';

function createMockStorage() {
  let store = new Map();
  return {
    type: 'Map',
    set: (key: any, value: any) => store.set(key, value),
    get: (key: any) => store.get(key),
    delete: (key: any) => store.delete(key),
    has: (key: any) => store.has(key),
    size: () => store.size,
    keys: () => store.keys(),
    entries: () => store.entries(),
  } as StorageAdapter<any, any>;
}

describe('Eviction Policies', function () {
  describe('LRU (Least Recently Used)', function () {
    let storage: CacheStorageAdapter<string, any>;
    let lru: LRUEvictionPolicy<string, string>;

    beforeEach(function () {
      storage = new MapStorageAdapter();
      lru = new LRUEvictionPolicy(storage, { capacity: 5 });
    });

    it('should evict the least recently used item', function () {
      lru.recordInsertion('a', { value: 'item1' });
      lru.recordInsertion('b', { value: 'item2' });
      lru.recordInsertion('c', { value: 'item3' });

      lru.recordAccess('a');
      lru.recordInsertion('d', { value: 'item4' });

      const evictedKey = lru.evict();

      expect(evictedKey).to.equal('b');
    });

    it('should reorder items when accessed', function () {
      lru.recordInsertion('a', { value: 'item1' });
      lru.recordInsertion('b', { value: 'item2' });
      lru.recordInsertion('c', { value: 'item3' });

      lru.recordAccess('a');
      const evictedKey = lru.evict();
      expect(evictedKey).to.equal('b');
    });

    it('should evict the oldest item when capacity is reached', function () {
      lru.recordInsertion('a', { value: 'item1' });
      lru.recordInsertion('b', { value: 'item2' });
      lru.recordInsertion('c', { value: 'item3' });

      lru.recordInsertion('d', { value: 'item4' });
      const evictedKey = lru.evict();
      expect(evictedKey).to.equal('a');
    });
  });

  describe('MRU (Most Recently Used)', function () {
    let storage: CacheStorageAdapter<string, any>;
    let mru: MRUEvictionPolicy<string, string>;

    beforeEach(function () {
      storage = new MapStorageAdapter();
      mru = new MRUEvictionPolicy(storage, { capacity: 10 });
    });

    it('should evict the most recently used item', function () {
      mru.recordInsertion('a', { value: 'item1' });
      mru.recordInsertion('b', { value: 'item2' });
      mru.recordInsertion('c', { value: 'item3' });
      mru.recordInsertion('d', { value: 'item4' });

      const evictedKey = mru.evict();
      expect(evictedKey).to.equal('d');
    });

    it('should evict the most recent item when capacity is reached', function () {
      mru.recordInsertion('a', { value: 'item1' });
      mru.recordInsertion('b', { value: 'item2' });
      mru.recordInsertion('c', { value: 'item3' });

      mru.recordInsertion('d', { value: 'item4' });
      const evictedKey = mru.evict();
      expect(evictedKey).to.equal('d');
    });
  });

  describe('LFU (Least Frequently Used)', function () {
    let storage: CacheStorageAdapter<string, any>;
    let lfu: LFUEvictionPolicy<string, string>;

    beforeEach(function () {
      storage = new MapStorageAdapter();
      lfu = new LFUEvictionPolicy(storage, { capacity: 10 });
    });

    it('should evict the least frequently used item', function () {
      lfu.recordInsertion('a', { value: 'item1' });
      lfu.recordInsertion('b', { value: 'item2' });
      lfu.recordInsertion('c', { value: 'item3' });

      lfu.recordAccess('a');
      lfu.recordInsertion('d', { value: 'item4' });

      const evictedKey = lfu.evict();
      expect(evictedKey).to.equal('b');
    });

    it('should evict the item with the lowest frequency after multiple accesses', function () {
      lfu.recordInsertion('a', { value: 'item1' });
      lfu.recordInsertion('b', { value: 'item2' });

      lfu.recordAccess('a');
      lfu.recordAccess('a');
      lfu.recordInsertion('c', { value: 'item3' });

      const evictedKey = lfu.evict();
      expect(evictedKey).to.equal('b');
    });
  });
});
