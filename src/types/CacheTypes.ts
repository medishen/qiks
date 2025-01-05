export interface CacheItem<K, V> {
  value: V;
  expiry?: number | null;
  frequency?: number;
  dependents?: Set<K>;
  onExpire?: (key: K, value: V) => void;
  swr?: SWRPolicy<K, V>;
  priority?: number;
}
export interface CacheItemOptions<K, V> {
  ttl?: number;
  dependsOn?: K;
  onExpire?: (key: K, value: V) => void;
  priority?: number;
  swr?: SWROptions<K, V>;
}
export interface SWROptions<K, V> {
  revalidate: () => Promise<V>;
  staleThreshold: number;
}
export interface SWRPolicy<K, V> extends SWROptions<K, V> {
  isRunning: boolean;
  lastFetched?: number;
}
export type CacheEventType = 'set' | 'get' | 'delete' | 'expire' | 'change' | string;
export type EventParams<K> = {
  key: K;
};
export type EventCallback<K, V> = (key: K, value?: V) => void;
export type ObserverCallback<K, V> = EventCallback<K, V>;
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
export type CacheStorage<K> = Map<K, CacheItem<K, string>> | WeakMap<object, CacheItem<K, string>>;
interface BaseCacheConfig {
  maxSize?: number;
  policy?: EvictionPolicyType;
}
export interface CacheConfig<K, V> extends BaseCacheConfig {
  storage: StorageAdapter<K, CacheItem<K, V>>;
}
export interface CacheConfigQiks<K> extends BaseCacheConfig {
  storage?: CacheStorage<K>;
}
export interface NamespaceCacheConfig<K, V> extends BaseCacheConfig {
  parentStorage: StorageAdapter<K, CacheItem<K, V>>;
  namespace: string;
}
export interface GetOptions<K> {
  keys?: boolean;
  values?: boolean;
  pattern?: boolean;
  limit?: number;
  withTuples?: boolean;
  exclude?: string | string[];
  sort?: 'ASC' | 'DESC';
  minLen?: number;
  maxLen?: number;
  suffix?: string;
  prefix?: string;
  filter?: (key: K, value: any) => boolean;
  transform?: (key: K, value: any) => any;
}
