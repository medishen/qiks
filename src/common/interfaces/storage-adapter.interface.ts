/**
 * interface for storage adapters in Qiks. This class defines the core API for custom storage implementations,
 * including support for advanced features such as snapshot management, serialization, and metrics tracking.
 *
 * @template K - Type for keys
 * @template V - Type for values
 */
export interface StorageAdapter<K, V> {
  set(key: K, value: V): void;
  get(key: K): V | undefined;
  delete(key: K): void;
  has(key: K): boolean;
  keys(): IterableIterator<K>;
  entries(): IterableIterator<[K, V]>;
  clear(): void;
  size(): number;
  values(): IterableIterator<V>;
  forEach(callback: (value: V, key: K, storage: StorageAdapter<K, V>) => void): void;
}
