/**
 * interface for storage adapters in Qiks. This class defines the core API for custom storage implementations,
 * including support for advanced features such as snapshot management, serialization, and metrics tracking.
 *
 * @template K - Type for keys
 * @template V - Type for values
 */
export interface StorageAdapter<K, V> {
  /**
   * Sets a value in the storage for a given key.
   */
  set: (key: K, value: V) => void;

  /**
   * Retrieves the value for a given key.
   */
  get: (key: K) => V | undefined;

  /**
   * Deletes the value for a given key.
   */
  delete: (key: K) => void;

  /**
   * Checks if the storage contains a value for the given key.
   */
  has: (key: K) => boolean;

  /**
   * Returns an iterator over the keys in the storage.
   */
  keys: () => IterableIterator<K>;

  /**
   * Returns an iterator over the entries (key-value pairs) in the storage.
   */
  entries: () => IterableIterator<[K, V]>;

  /**
   * Clears all entries in the storage.
   */
  clear: () => void;

  /**
   * Returns the number of entries in the storage.
   */
  size: () => number;

  /**
   * Returns an iterator over the values in the storage.
   */
  values: () => IterableIterator<V>;

  /**
   * Executes a function for each entry in the storage.
   *
   * @param callback - The function to execute for each value in the storage.
   */
  forEach: (callback: (value: V, key: K, storage: StorageAdapter<K, V>) => void) => void;
}
