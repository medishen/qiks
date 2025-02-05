import { CacheStorageAdapter } from "../common";

export class Cloner<K, V> {
  constructor(private adapter: CacheStorageAdapter<K, V>) {}

  clone(): CacheStorageAdapter<K, V> {
    const clonedAdapter: any = {}; // Create a new adapter instance
    clonedAdapter.merge(this.adapter);
    return clonedAdapter;
  }
}
