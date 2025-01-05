import { CacheItem, StorageAdapter } from '../types/CacheTypes';
import { EvictionPolicy } from '../types/EvictionPolicy';

export class LRU<K, V> implements EvictionPolicy<K, V> {
  constructor(private storage: StorageAdapter<K, CacheItem<K, V>>) {}

  onAccess(key: K): void {
    if (this.storage.has(key)) {
      const value = this.storage.get(key)!;
      this.storage.delete(key);
      this.storage.set(key, value);
    }
  }

  onInsert(key: K, value: CacheItem<K, V>): void {
    this.storage.set(key, value);
  }

  onRemove(key: K): void {
    this.storage.delete(key);
  }

  evict(): K | null {
    const keys = this.storage.keys();
    let lowestPriorityKey: K | null = null;
    let lowestPriority: number = Infinity;

    for (const key of keys) {
      const entry = this.storage.get(key);
      if (entry) {
        const priority = entry.priority ?? 0;
        if (priority < lowestPriority) {
          lowestPriority = priority;
          lowestPriorityKey = key;
        }
      }
    }

    if (lowestPriorityKey !== null) {
      const entry = this.storage.get(lowestPriorityKey);
      if (entry && entry.onExpire) {
        entry.onExpire(lowestPriorityKey, entry.value);
      }

      this.storage.delete(lowestPriorityKey);

      return lowestPriorityKey;
    }

    return null;
  }
}
