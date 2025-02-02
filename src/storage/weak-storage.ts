import { StorageAdapter } from '../common/interfaces';

export class WeakMapStorageAdapter<K extends object, V> implements StorageAdapter<K, V> {
  private storage: WeakMap<K, V>;
  private primitiveMap: Map<K, V>;
  constructor() {
    this.storage = new WeakMap();
    this.primitiveMap = new Map();
  }

  set(key: K, value: V): void {
    this.primitiveMap.set(key, value);
    this.storage.set(key, value);
  }

  get(key: K): V | undefined {
    return this.storage.get(key);
  }

  delete(key: K): boolean {
    this.primitiveMap.delete(key);
    return this.storage.delete(key);
  }

  has(key: K): boolean {
    return this.storage.has(key);
  }
  clear(): void {
    this.storage = new WeakMap();
    this.primitiveMap.clear();
  }

  keys(): IterableIterator<K> {
    return this.primitiveMap.keys();
  }

  entries(): IterableIterator<[K, V]> {
    return this.primitiveMap.entries();
  }

  size(): number {
    return this.primitiveMap.size;
  }

  forEach(callback: (value: V, key: K, storage: StorageAdapter<K, V>) => void): void {
    this.primitiveMap.forEach((value, key) => {
      callback(value, key, this);
    });
  }
  values(): IterableIterator<V> {
    return this.primitiveMap.values();
  }
}
