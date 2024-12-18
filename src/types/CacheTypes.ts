export interface CacheOptions {
  ttl?: number;
}
export interface CacheEntry<V> {
  value: V;
  expiry?: number;
}
