// export type ObserverCallback<K, V> = EventCallback<K, V>;
// export type CacheStorage<K> = Map<K, CacheItem<K, string>> | WeakMap<object, CacheItem<K, string>>;

import { CacheStore } from '../../../cache';
import { CacheEntry, StorageAdapter } from '../../interfaces';

/**
 * CacheStorageAdapter is a specialized type for a storage adapter used in cache systems.
 * It manages entries that are of type CacheEntry, which include advanced metadata.
 *
 * @template K - The type for keys in the cache.
 * @template V - The type for the underlying value stored in the cache.
 */
export type CacheStorageAdapter<K, V> = StorageAdapter<K, CacheEntry<K, V>>;

export type CacheStoreWithNamespace<K, V> = Omit<CacheStore<K, V>, 'namespace'>;
