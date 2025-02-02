import { ExecutionMode, MethodAdapter } from '../types';

/**
 * interface for storage adapters in Qiks. This class defines the core API for custom storage implementations,
 * including support for advanced features such as snapshot management, serialization, and metrics tracking.
 *
 * @template K - Type for keys
 * @template V - Type for values
 */
export interface StorageAdapter<M extends ExecutionMode, K, V> {
  /**
   * Sets a value in the storage for a given key.
   */
  set: MethodAdapter<M, (key: K, value: V) => void>;

  /**
   * Retrieves the value for a given key.
   */
  get: MethodAdapter<M, (key: K) => V | undefined>;

  /**
   * Deletes the value for a given key.
   */
  delete: MethodAdapter<M, (key: K) => void>;

  /**
   * Checks if the storage contains a value for the given key.
   */
  has: MethodAdapter<M, (key: K) => boolean>;

  /**
   * Returns an iterator over the keys in the storage.
   */
  keys: MethodAdapter<M, () => IterableIterator<K>>;

  /**
   * Returns an iterator over the entries (key-value pairs) in the storage.
   */
  entries: MethodAdapter<M, () => IterableIterator<[K, V]>>;

  /**
   * Clears all entries in the storage.
   */
  clear: MethodAdapter<M, () => void>;

  /**
   * Returns the number of entries in the storage.
   */
  size: MethodAdapter<M, () => number>;

  /**
   * Returns an iterator over the values in the storage.
   */
  values: MethodAdapter<M, () => IterableIterator<V>>;

  /**
   * Executes a function for each entry in the storage.
   *
   * @param callback - The function to execute for each value in the storage.
   */
  forEach: MethodAdapter<M, (callback: (value: V, key: K, storage: StorageAdapter<M, K, V>) => void) => void>;
}
