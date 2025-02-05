import { CacheStorageAdapter } from "../common";

export class BatchOps<K, V> {
  constructor(private adapter: CacheStorageAdapter<K, V>) {}

  // Accepts an array of key-value pairs and sets them in the adapter
  setBatch(entries: [K, V][]): void {
    entries.forEach(([key, value]) => this.adapter.set(key, { value }));
  }

  // Accepts an array of key and partial value pairs to update in the adapter
  updateBatch(updates: [K, Partial<V>][]): void {
    updates.forEach(([key, partialValue]) => {
      const existing = this.adapter.get(key) || ({} as V);

      this.adapter.set(key, { ...(existing as any), ...partialValue });
    });
  }

  // Accepts an array of keys to delete from the adapter
  deleteBatch(keys: K[]): void {
    keys.forEach((key) => this.adapter.delete(key));
  }
}
