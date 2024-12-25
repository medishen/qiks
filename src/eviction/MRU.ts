import { CacheItem, StorageAdapter } from '../types/CacheTypes';
import { EvictionPolicy } from '../types/EvictionPolicy';

export class MRU<K> implements EvictionPolicy<K> {
  constructor(private storage: StorageAdapter<K, CacheItem<any>>) {}

  onAccess(key: K): void {
    // MRU does not require changes on access
  }

  onInsert<V>(key: K, value: CacheItem<V>): void {
    this.storage.set(key, value);
  }

  onRemove(key: K): void {
    this.storage.delete(key);
  }

  evict(): K | null {
    const keys = Array.from(this.storage.keys());
    const mostRecentKey = keys[keys.length - 1];
    if (mostRecentKey !== undefined) {
      this.storage.delete(mostRecentKey);
      return mostRecentKey;
    }
    return null;
  }
}
