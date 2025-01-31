export interface CacheErrorOptions<T> {
  code?: string;
  cause?: T;
  metadata?: Record<string, any>;
}
