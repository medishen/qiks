export interface CacheItem<V> {
  value: V;
  expiry?: number | null;
  frequency?: number;
  dependents?: Set<string>;
  onExpire?: (key: any, value: V) => void;
}

export interface CacheItemOptions<K, V> {
  ttl?: number;
  dependsOn?: K;
  onExpire?: (key: K, value: V) => void;
}
export interface CacheSerializer {
  serialize<V>(data: V): string;
  deserialize<V>(data: string): V;
}
export type CacheEventType = 'set' | 'get' | 'delete' | 'expire' | 'evict';
export type EventCallback<K, V> = (key: K, value?: V) => void;
export type EvictionPolicyType = 'LRU' | 'MRU' | 'LFU';
export interface StorageAdapter<K, V> {
  type: 'Map' | 'WeakMap' | 'Custom';
  set(key: K, value?: V): void;
  get(key: K): V | undefined;
  delete(key: K): void;
  has(key: K): boolean;
  size?(): number;
  clear?(): void;
  keys(): IterableIterator<K>;
  entries(): IterableIterator<[K, V]>;
}
export type CacheStorage<K> = Map<K, CacheItem<string>> | WeakMap<object, CacheItem<string>>;
interface BaseCacheConfig {
  maxSize?: number;
  serializer: CacheSerializer;
  policy?: EvictionPolicyType;
}
export interface CacheConfig<K> extends BaseCacheConfig {
  storage: StorageAdapter<K, CacheItem<string>>;
}
export interface CacheConfigQiks<K> extends BaseCacheConfig {
  storage: CacheStorage<K>;
}
export interface NamespaceCacheConfig<K, V> extends BaseCacheConfig {
  parentStorage: StorageAdapter<string, CacheItem<string>>;
  namespace: string;
}
