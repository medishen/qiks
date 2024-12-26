import { Serializer } from '../core/managers/Serializer';
import { CacheItem, StorageAdapter } from '../types/CacheTypes';
import { EvictionPolicy } from '../types/EvictionPolicy';

export class LRU<K> implements EvictionPolicy<K> {
  constructor(private storage: StorageAdapter<K, CacheItem<any>>) {}

  onAccess(key: K): void {
    if (this.storage.has(key)) {
      const value = this.storage.get(key)!;
      this.storage.delete(key);
      this.storage.set(key, value);
    }
  }

  onInsert<V>(key: K, value: CacheItem<V>): void {
    this.storage.set(key, value);
  }

  onRemove(key: K): void {
    this.storage.delete(key);
  }

  evict(): K | null {
    const keys = this.storage.keys();
    const oldestKey = keys.next().value;
    if (oldestKey !== undefined) {
      const entry = this.storage.get(oldestKey);
      if (entry && entry.onExpire) {
        const deserializedValue = Serializer.deserialize(entry.value);
        entry.onExpire(oldestKey, deserializedValue);
      }
      this.storage.delete(oldestKey);
      return oldestKey;
    }
    return null;
  }
}
