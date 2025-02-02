import { StorageAdapter } from '../../src/common/interfaces';
export class MockStorageAdapter<K, V> implements StorageAdapter<K, V> {
  private store: Map<K, V> = new Map();

  set(key: K, value: V): void {
    this.store.set(key, value);
  }

  get(key: K): V | undefined {
    return this.store.get(key);
  }

  delete(key: K): void {
    this.store.delete(key);
  }

  size(): number {
    return this.store.size;
  }
  clear(): void {
    this.store.clear();
  }
  entries(): IterableIterator<[K, V]> {
    return this.store.entries();
  }
  has(key: K): boolean {
    return this.store.has(key);
  }
  keys(): IterableIterator<K> {
    return this.store.keys();
  }
  forEach(callback: (value: V, key: K, storage: StorageAdapter<K, V>) => void): void {
    this.store.forEach((value, key) => {
      callback(value, key, this);
    });
  }
  values(): IterableIterator<V> {
    return this.store.values();
  }
}
