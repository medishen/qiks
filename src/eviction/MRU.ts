import { CacheItem, StorageAdapter } from '../types/CacheTypes';
import { EvictionPolicy } from '../types/EvictionPolicy';

export class MRU<K, V> implements EvictionPolicy<K, V> {
  constructor(private storage: StorageAdapter<K, CacheItem<K, V>>) {}

  onAccess(key: K): void {
    // MRU does not require changes on access
  }

  onInsert(key: K, value: CacheItem<K, V>): void {
    this.storage.set(key, value);
  }

  onRemove(key: K): void {
    this.storage.delete(key);
  }

  evict(): K | null {
    const keys = Array.from(this.storage.keys());
    if (keys.length === 0) return null;

    let mostRecentKey = keys[keys.length - 1];
    let highestPriority = this.storage.get(mostRecentKey)?.priority ?? 0;
    for (let i = keys.length - 2; i >= 0; i--) {
      const key = keys[i];
      const entry = this.storage.get(key);
      const entryPriority = entry?.priority ?? 0;
      if (i > keys.indexOf(mostRecentKey)) {
        mostRecentKey = key;
        highestPriority = entryPriority;
      }
    }

    if (mostRecentKey !== undefined) {
      const entry = this.storage.get(mostRecentKey);
      if (entry && entry.onExpire) {
        entry.onExpire(mostRecentKey, entry.value);
      }
      this.storage.delete(mostRecentKey);
      return mostRecentKey;
    }

    return null;
  }
}
