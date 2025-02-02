import { EvictionStrategy, ExecutionMode, isNull, ReturnTypeForMode, StorageAdapter } from '../common';
import { MapStorageAdapter } from '../storage';
interface LFUCacheEntry {
  frequency: number;
}
/**
 * LFU (Least Frequently Used) Eviction Policy Implementation.
 */
export class LFUEvictionPolicy<M extends ExecutionMode, K, V> implements EvictionStrategy<M, K, V> {
  private frequencyStorage: MapStorageAdapter<K, LFUCacheEntry>;
  constructor(private mainStorage: StorageAdapter<M, K, V>) {
    this.frequencyStorage = new MapStorageAdapter<K, LFUCacheEntry>();
  }
  recordAccess(key: K): ReturnTypeForMode<M, void> {
    const entry = this.frequencyStorage.get(key) ?? { frequency: 0 };
    entry.frequency += 1;
    this.frequencyStorage.set(key, entry);
    return undefined as ReturnTypeForMode<M, void>;
  }

  recordInsertion(key: K, value: V): ReturnTypeForMode<M, void> {
    const newEntry: LFUCacheEntry = {
      frequency: 1,
    };
    this.frequencyStorage.set(key, newEntry);
    return this.mainStorage.set(key, value);
  }

  recordRemoval(key: K): ReturnTypeForMode<M, void> {
    this.frequencyStorage.delete(key);
    return this.mainStorage.delete(key);
  }

  evict(): ReturnTypeForMode<M, K | null> {
    let leastFrequentKey: K | null = null;
    let leastFrequency = Infinity;

    // Iterate through the frequency storage to find the least frequently used key
    for (const [key, entry] of this.frequencyStorage.entries()) {
      if (entry.frequency < leastFrequency) {
        leastFrequency = entry.frequency;
        leastFrequentKey = key;
      }
    }

    // Evict the least frequently used key if found
    if (!isNull(leastFrequentKey)) {
      this.frequencyStorage.delete(leastFrequentKey);
      this.mainStorage.delete(leastFrequentKey);
    }

    return leastFrequentKey as ReturnTypeForMode<M, K | null>;
  }

  reset(): ReturnTypeForMode<M, void> {
    this.frequencyStorage.clear();
    return this.mainStorage.clear();
  }
}
