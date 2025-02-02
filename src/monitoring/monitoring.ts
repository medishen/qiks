export interface StorageMetrics {
  hits: number; // Successful cache reads
  misses: number; // Cache misses
  writes: number; // Write operations
  deletes: number; // Delete operations
  expires: number; // Expired keys
  evictions: number; // Items evicted from the cache due to capacity limits
  totalItems: number; // Total items currently in the cache
  cacheSize: number; // Total size of the cached data (if applicable, such as in memory-based caches)
}
export class MonitoringAdapter {
  protected metrics: StorageMetrics = {
    hits: 0,
    misses: 0,
    writes: 0,
    evictions: 0,
    totalItems: 0,
    cacheSize: 0,
    deletes: 0,
    expires: 0,
  };

  // Increment methods
  incrementHits(): void {
    this.metrics.hits += 1;
  }

  incrementMisses(): void {
    this.metrics.misses += 1;
  }

  incrementWrites(): void {
    this.metrics.writes += 1;
  }

  incrementDeletes(count: number = 1): void {
    this.metrics.deletes += count;
  }

  incrementExpires(count: number = 1): void {
    this.metrics.expires += count;
  }

  incrementEvictions(count: number = 1): void {
    this.metrics.evictions += count;
  }

  // Cache size management
  incrementCacheSize(size: number): void {
    this.metrics.cacheSize += size;
  }

  decrementCacheSize(size: number): void {
    this.metrics.cacheSize = Math.max(0, this.metrics.cacheSize - size);
  }

  setTotalItems(count: number): void {
    this.metrics.totalItems = count;
  }

  // Metrics management
  getMetrics(): StorageMetrics {
    return { ...this.metrics };
  }

  resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      writes: 0,
      deletes: 0,
      expires: 0,
      evictions: 0,
      totalItems: 0,
      cacheSize: 0,
    };
  }
}
