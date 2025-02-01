import { StorageAdapter } from '../common/interfaces/';

export class MapStorageAdapter<K, V> implements StorageAdapter<K, V> {
  private storage: Map<K, V>;
  constructor() {
    this.storage = new Map();
  }
  get(key: K): V | undefined {
    return this.storage.get(key);
  }
  set(key: K, value: V): void {
    this.storage.set(key, value);
  }
  has(key: K): boolean {
    return this.storage.has(key);
  }
  keys(): IterableIterator<K> {
    return this.storage.keys();
  }
  size(): number {
    return this.storage.size;
  }
  clear(): void {
    this.storage.clear();
  }
  delete(key: K): void {
    this.storage.delete(key);
  }
  entries(): IterableIterator<[K, V]> {
    return this.storage.entries();
  }
  forEach(callback: (value: V, key: K, storage: StorageAdapter<K, V>) => void): void {
    this.storage.forEach((value, key) => {
      callback(value, key, this);
    });
  }
  values(): IterableIterator<V> {
    return this.storage.values();
  }
}
