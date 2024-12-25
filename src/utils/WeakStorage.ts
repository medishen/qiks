import { CacheError } from '../errors/CacheError';

export class WeakStorage<K extends object, V = undefined> {
  private storage: WeakMap<K, V | undefined> | WeakSet<K>;
  private metadata: Array<{ key: K; value?: V }> = [];
  constructor() {
    this.storage = new WeakMap<K, V | undefined>();
  }
  set(key: K, value?: V): void {
    if (typeof key !== 'object' || key === null) {
      throw new CacheError('Keys must be non-null objects.');
    }

    (this.storage as WeakMap<K, V | undefined>).set(key, value);

    const existingIndex = this.metadata.findIndex((entry) => entry.key === key);
    if (existingIndex >= 0) {
      this.metadata[existingIndex] = { key, value };
    } else {
      this.metadata.push({ key, value });
    }
  }
  get(key: K): V | undefined {
    return (this.storage as WeakMap<K, V | undefined>).get(key);
  }
  delete(key: K): void {
    (this.storage as WeakMap<K, V | undefined>).delete(key);

    const index = this.metadata.findIndex((entry) => entry.key === key);
    if (index >= 0) {
      this.metadata.splice(index, 1);
    }
  }
  has(key: K): boolean {
    return (this.storage as WeakMap<K, V | undefined>).has(key);
  }
  keys(): IterableIterator<K> {
    return this.metadata.map((entry) => entry.key)[Symbol.iterator]();
  }
  entries(): IterableIterator<[K, V]> {
    return this.metadata.map((entry) => [entry.key, entry.value!] as [K, V])[Symbol.iterator]();
  }
  clear(): void {
    this.metadata.forEach((entry) => {
      (this.storage as WeakMap<K, V | undefined>).delete(entry.key);
    });
    this.metadata = [];
  }
  size(): number {
    return this.metadata.length;
  }
}
