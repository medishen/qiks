import { expect } from 'chai';
import { CacheItem, StorageAdapter } from '../../../src/types/CacheTypes';
import { LRU } from '../../../src/eviction/LRU';
import { MRU } from '../../../src/eviction/MRU';
import { LFU } from '../../../src/eviction/LFU';

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
    let storage: StorageAdapter<string, CacheItem<any>>;
    let lru: LRU<string>;

    beforeEach(function () {
      storage = createMockStorage();
      lru = new LRU(storage);
    });

    it('should evict the least recently used item', function () {
      lru.onInsert('a', { value: 'item1' });
      lru.onInsert('b', { value: 'item2' });
      lru.onInsert('c', { value: 'item3' });

      lru.onAccess('a');
      lru.onInsert('d', { value: 'item4' });

      const evictedKey = lru.evict();
      expect(evictedKey).to.equal('b');
    });

    it('should reorder items when accessed', function () {
      lru.onInsert('a', { value: 'item1' });
      lru.onInsert('b', { value: 'item2' });
      lru.onInsert('c', { value: 'item3' });

      lru.onAccess('a');
      const evictedKey = lru.evict();
      expect(evictedKey).to.equal('b');
    });

    it('should evict the oldest item when capacity is reached', function () {
      lru.onInsert('a', { value: 'item1' });
      lru.onInsert('b', { value: 'item2' });
      lru.onInsert('c', { value: 'item3' });

      lru.onInsert('d', { value: 'item4' });
      const evictedKey = lru.evict();
      expect(evictedKey).to.equal('a');
    });
  });

  describe('MRU (Most Recently Used)', function () {
    let storage: StorageAdapter<string, CacheItem<any>>;
    let mru: MRU<string>;

    beforeEach(function () {
      storage = createMockStorage();
      mru = new MRU(storage);
    });

    it('should evict the most recently used item', function () {
      mru.onInsert('a', { value: 'item1' });
      mru.onInsert('b', { value: 'item2' });
      mru.onInsert('c', { value: 'item3' });
      mru.onInsert('d', { value: 'item4' });

      const evictedKey = mru.evict();
      expect(evictedKey).to.equal('d');
    });

    it('should evict the most recent item when capacity is reached', function () {
      mru.onInsert('a', { value: 'item1' });
      mru.onInsert('b', { value: 'item2' });
      mru.onInsert('c', { value: 'item3' });

      mru.onInsert('d', { value: 'item4' });
      const evictedKey = mru.evict();
      expect(evictedKey).to.equal('d');
    });
  });

  describe('LFU (Least Frequently Used)', function () {
    let storage: StorageAdapter<string, { value: any; frequency: number }>;
    let lfu: LFU<string>;

    beforeEach(function () {
      storage = createMockStorage();
      lfu = new LFU(storage);
    });

    it('should evict the least frequently used item', function () {
      lfu.onInsert('a', { value: 'item1', frequency: 1 });
      lfu.onInsert('b', { value: 'item2', frequency: 1 });
      lfu.onInsert('c', { value: 'item3', frequency: 1 });

      lfu.onAccess('a');
      lfu.onInsert('d', { value: 'item4', frequency: 1 });

      const evictedKey = lfu.evict();
      expect(evictedKey).to.equal('b');
    });

    it('should evict the item with the lowest frequency after multiple accesses', function () {
      lfu.onInsert('a', { value: 'item1', frequency: 1 });
      lfu.onInsert('b', { value: 'item2', frequency: 1 });

      lfu.onAccess('a');
      lfu.onAccess('a');
      lfu.onInsert('c', { value: 'item3', frequency: 1 });

      const evictedKey = lfu.evict();
      expect(evictedKey).to.equal('b');
    });
  });
});
