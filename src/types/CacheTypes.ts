export interface CacheEntry<V> {
  value: V;
  expiry?: number;
}
