import { CacheItem, StorageAdapter } from '../types/CacheTypes';
import { EvictionPolicy } from '../types/EvictionPolicy';
export class LFU<K, V> implements EvictionPolicy<K, V> {
  constructor(private storage: StorageAdapter<K, CacheItem<K, V>>) {}

  onAccess(key: K): void {
    const entry = this.storage.get(key);
    if (entry) {
      entry.frequency = (entry.frequency ?? 0) + 1;
      this.storage.set(key, entry);
    }
  }

  onInsert(key: K, value: CacheItem<K, V>): void {
    this.storage.set(key, { ...value, frequency: 1 });
  }

  onRemove(key: K): void {
    this.storage.delete(key);
  }

  evict(): K | null {
    let leastFrequentKey: K | null = null;
    let leastFrequency = Infinity;
    let lowestPriority = Infinity;
    for (const [key, entry] of this.storage.entries()) {
      const frequency = entry.frequency ?? 0;
      const priority = entry.priority ?? 0;

      if (frequency < leastFrequency || (frequency === leastFrequency && priority < lowestPriority)) {
        leastFrequency = frequency;
        lowestPriority = priority;
        leastFrequentKey = key;
      }
    }
    if (leastFrequentKey !== null) {
      const entry = this.storage.get(leastFrequentKey);
      if (entry && entry.onExpire) {
        entry.onExpire(leastFrequentKey, entry.value);
      }
      this.storage.delete(leastFrequentKey);
      return leastFrequentKey;
    }
    return null;
  }
}
