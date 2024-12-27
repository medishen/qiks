import { Serializer } from '../core/managers/Serializer';
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
        const deserializedValue = Serializer.deserialize(entry.value);
        entry.onExpire(mostRecentKey, deserializedValue);
      }
      this.storage.delete(mostRecentKey);
      return mostRecentKey;
    }

    return null;
  }
}
