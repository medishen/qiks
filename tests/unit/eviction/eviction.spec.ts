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
    let storage: StorageAdapter<string, CacheItem<string, any>>;
    let lru: LRU<string, string>;

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
    let storage: StorageAdapter<string, CacheItem<string, any>>;
    let mru: MRU<string, string>;

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
    let lfu: LFU<string, string>;

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
  describe('LRU with Priority', function () {
    let storage: StorageAdapter<string, CacheItem<string, any>>;
    let lru: LRU<string, string>;

    beforeEach(function () {
      storage = createMockStorage();
      lru = new LRU(storage);
    });

    it('should evict the least recently used item considering priority', function () {
      lru.onInsert('a', { value: 'item1', priority: 1 });
      lru.onInsert('b', { value: 'item2', priority: 2 });
      lru.onInsert('c', { value: 'item3', priority: 1 });

      lru.onAccess('a');
      lru.onInsert('d', { value: 'item4', priority: 1 });

      const evictedKey = lru.evict();
      expect(evictedKey).to.equal('c');
    });

    it('should prefer items with higher priority over recency', function () {
      lru.onInsert('a', { value: 'item1', priority: 2 });
      lru.onInsert('b', { value: 'item2', priority: 1 });
      lru.onInsert('c', { value: 'item3', priority: 3 });

      lru.onAccess('b');
      lru.onAccess('a');
      lru.onInsert('d', { value: 'item4', priority: 1 });

      const evictedKey = lru.evict();
      expect(evictedKey).to.equal('b');
    });

    it('should not evict higher priority items, even if accessed less', function () {
      lru.onInsert('a', { value: 'item1', priority: 5 });
      lru.onInsert('b', { value: 'item2', priority: 2 });
      lru.onInsert('c', { value: 'item3', priority: 1 });

      lru.onAccess('a');
      lru.onInsert('d', { value: 'item4', priority: 3 });

      const evictedKey = lru.evict();
      expect(evictedKey).to.equal('c');
    });
  });
  describe('MRU with Priority', function () {
    let storage: StorageAdapter<string, CacheItem<string, any>>;
    let mru: MRU<string, string>;

    beforeEach(function () {
      storage = createMockStorage();
      mru = new MRU(storage);
    });

    it('should evict the most recently used item considering priority', function () {
      mru.onInsert('a', { value: 'item1', priority: 1 });
      mru.onInsert('b', { value: 'item2', priority: 2 });
      mru.onInsert('c', { value: 'item3', priority: 1 });

      mru.onAccess('a');
      mru.onInsert('d', { value: 'item4', priority: 2 });

      const evictedKey = mru.evict();
      expect(evictedKey).to.equal('d');
    });

    it('should evict the most recent item when capacity is reached, considering priority', function () {
      mru.onInsert('a', { value: 'item1', priority: 1 });
      mru.onInsert('b', { value: 'item2', priority: 3 });
      mru.onInsert('c', { value: 'item3', priority: 2 });

      mru.onInsert('d', { value: 'item4', priority: 1 });

      const evictedKey = mru.evict();
      expect(evictedKey).to.equal('d');
    });

    it('should evict the item with the highest priority if the most recent items have equal priority', function () {
      mru.onInsert('a', { value: 'item1', priority: 3 });
      mru.onInsert('b', { value: 'item2', priority: 2 });
      mru.onInsert('c', { value: 'item3', priority: 3 });

      mru.onAccess('a');
      mru.onInsert('d', { value: 'item4', priority: 3 });

      const evictedKey = mru.evict();
      expect(evictedKey).to.equal('d');
    });
  });
  describe('LFU with Priority', function () {
    let storage: StorageAdapter<string, CacheItem<string, any>>;
    let lfu: LFU<string, string>;

    beforeEach(function () {
      storage = createMockStorage();
      lfu = new LFU(storage);
    });

    it('should evict the least frequently used item considering priority', function () {
      lfu.onInsert('a', { value: 'item1', frequency: 2, priority: 1 });
      lfu.onInsert('b', { value: 'item2', frequency: 2, priority: 3 });
      lfu.onInsert('c', { value: 'item3', frequency: 3, priority: 2 });
      lfu.onInsert('d', { value: 'item4', frequency: 1, priority: 2 });

      const evictedKey = lfu.evict();
      expect(evictedKey).to.equal('a');
    });

    it('should prefer items with higher priority over frequency', function () {
      lfu.onInsert('a', { value: 'item1', frequency: 1, priority: 3 });
      lfu.onInsert('b', { value: 'item2', frequency: 2, priority: 1 });
      lfu.onInsert('c', { value: 'item3', frequency: 3, priority: 2 });

      lfu.onAccess('a');
      lfu.onInsert('d', { value: 'item4', frequency: 2, priority: 3 });

      const evictedKey = lfu.evict();
      expect(evictedKey).to.equal('b');
    });

    it('should not evict higher priority items, even if accessed less frequently', function () {
      lfu.onInsert('a', { value: 'item1', frequency: 2, priority: 5 });
      lfu.onInsert('b', { value: 'item2', frequency: 1, priority: 1 });
      lfu.onInsert('c', { value: 'item3', frequency: 1, priority: 3 });

      lfu.onAccess('a');
      lfu.onInsert('d', { value: 'item4', frequency: 1, priority: 2 });

      const evictedKey = lfu.evict();
      expect(evictedKey).to.equal('b');
    });
  });
});
