export interface CacheItem<V> {
  value: V;
  expiry?: number | null;
  frequency?: number;
  dependents?: Set<string>;
  onExpire?: (key: any, value: V) => void;
  swr?: SWRPolicy<V>;
  priority?: number;
}
export interface CacheItemOptions<K, V> {
  ttl?: number;
  dependsOn?: K;
  onExpire?: (key: K, value: V) => void;
  priority?: number;
  swr?: SWROptions<V>;
}
export interface SWROptions<V> {
  revalidate: () => Promise<V>;
  staleThreshold: number;
}
export interface SWRPolicy<V> extends SWROptions<V> {
  isRunning: boolean;
  lastFetched?: number;
}
export interface CacheSerializer {
  serialize<V>(data: V): string;
  deserialize<V>(data: string): V;
}
export type CacheEventType = 'set' | 'get' | 'delete' | 'expire' | string;
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
  policy?: EvictionPolicyType;
}
export interface CacheConfig<K> extends BaseCacheConfig {
  serializer: CacheSerializer;
  storage: StorageAdapter<K, CacheItem<string>>;
}
export interface CacheConfigQiks<K> extends BaseCacheConfig {
  serializer?: CacheSerializer;
  storage?: CacheStorage<K>;
}
export interface NamespaceCacheConfig<K, V> extends BaseCacheConfig {
  serializer: CacheSerializer;
  parentStorage: StorageAdapter<K, CacheItem<string>>;
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
