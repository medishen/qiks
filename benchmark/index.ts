import { EventType, EvictionPolicyType, Qiks } from '../dist';
import { performance, monitorEventLoopDelay } from 'perf_hooks';
import { writeFile } from 'fs/promises';

// Configure benchmark environment
const CONFIG = {
  ITEM_COUNTS: [1e3, 1e4, 1e5], // Test various cache sizes
  PAYLOAD_SIZES: [64, 512, 4096], // Bytes (small, medium, large)
  EVICTION_POLICIES: ['LRU', 'LFU', 'MRU'] as EvictionPolicyType[],
  DURATION: 30_000, // 30 seconds per test
  WARMUP_CYCLES: 100,
};

// Generate realistic payloads
const generatePayload = (size: number) => ({
  data: Buffer.alloc(size).toString('base64'),
  timestamp: Date.now(),
  metadata: {
    id: crypto.randomUUID(),
    tags: ['test', 'benchmark'],
  },
});

// Benchmark runner
class QiksBenchmark {
  private results: any[] = [];
  private currentConfig: any = {};

  async run() {
    await this.runSuite('LRU', 1e3, 64);
    await this.saveResults();
  }

  private async runSuite(policy: EvictionPolicyType, count: number, size: number) {
    this.currentConfig = { policy, count, size };
    const cache = new Qiks<string, any>({
      maxSize: count * 1.2, // Allow 20% overflow
      evictionPolicy: policy,
    });

    // Warm-up phase
    this.warmup(cache, size);

    // Main benchmarks
    await this.memoryUsageTest(cache, size);

    await this.throughputTest('SET', () => this.setOperations(cache, size));

    await this.throughputTest('GET', () => this.getOperations(cache));

    await this.throughputTest('DELETE', () => this.deleteOperations(cache));

    await this.evictionTest(cache, size);
    await this.concurrencyTest(cache, size);
  }

  private warmup(cache: Qiks<string, any>, size: number) {
    for (let i = 0; i < CONFIG.WARMUP_CYCLES; i++) {
      cache.set(`warmup-${i}`, generatePayload(size));
      cache.get(`warmup-${i}`);
      cache.delete(`warmup-${i}`);
    }
  }

  private async throughputTest(operation: string, testFn: () => void) {
    const latencyHistogram = monitorEventLoopDelay();
    latencyHistogram.enable();

    const start = performance.now();
    let operations = 0;

    while (performance.now() - start < CONFIG.DURATION) {
      testFn();
      operations += CONFIG.ITEM_COUNTS[0];
    }

    latencyHistogram.disable();

    this.recordResult({
      operation,
      ops_sec: operations / (CONFIG.DURATION / 1000),
      latency: {
        p50: latencyHistogram.percentile(50),
        p95: latencyHistogram.percentile(95),
        p99: latencyHistogram.percentile(99),
      },
      ...this.currentConfig,
    });
  }

  private async memoryUsageTest(cache: Qiks<string, any>, size: number) {
    const initialMemory = process.memoryUsage().heapUsed;
    const entries = Array.from({ length: CONFIG.ITEM_COUNTS[0] }, (_, i) => [i.toString(), generatePayload(size)]);

    // Measure memory overhead
    cache.cacheTools.batchOps.setBatch(entries as any);
    const finalMemory = process.memoryUsage().heapUsed;

    this.recordResult({
      operation: 'MEMORY',
      bytes_per_entry: (finalMemory - initialMemory) / CONFIG.ITEM_COUNTS[0],
      ...this.currentConfig,
    });
  }

  private async evictionTest(cache: Qiks<string, any>, size: number) {
    // Fill cache to capacity
    for (let i = 0; i < CONFIG.ITEM_COUNTS[0]; i++) {
      cache.set(`evict-${i}`, generatePayload(size));
    }

    const start = performance.now();
    let evictions = 0;

    cache.on(EventType.StatisticsUpdated, (params) => {
      evictions++;
    });

    // Force evictions by overflow
    for (let i = 0; i < CONFIG.ITEM_COUNTS[0] * 2; i++) {
      cache.set(`overflow-${i}`, generatePayload(size));
    }

    this.recordResult({
      operation: 'EVICTION',
      evictions_sec: evictions / ((performance.now() - start) / 1000),
      ...this.currentConfig,
    });
  }

  private async concurrencyTest(cache: Qiks<string, any>, size: number) {
    const workerCount = 8;
    const promises: Promise<void>[] = [];

    for (let i = 0; i < workerCount; i++) {
      promises.push(this.concurrentWorker(cache, size, i));
    }

    const start = performance.now();
    await Promise.all(promises);
    const duration = performance.now() - start;

    this.recordResult({
      operation: 'CONCURRENCY',
      ops_sec: (CONFIG.ITEM_COUNTS[0] * workerCount) / (duration / 1000),
      ...this.currentConfig,
    });
  }

  private async concurrentWorker(cache: Qiks<string, any>, size: number, id: number): Promise<void> {
    for (let i = 0; i < CONFIG.ITEM_COUNTS[0]; i++) {
      const key = `concurrent-${id}-${i}`;
      cache.set(key, generatePayload(size));
      cache.get(key);
      if (i % 10 === 0) cache.delete(key);
    }
  }

  private setOperations(cache: Qiks<string, any>, size: number) {
    for (let i = 0; i < CONFIG.ITEM_COUNTS[0]; i++) {
      cache.set(`set-${i}`, generatePayload(size), {
        ttl: Math.random() * 5000 + 1000,
      });
    }
  }

  private getOperations(cache: Qiks<string, any>) {
    for (let i = 0; i < CONFIG.ITEM_COUNTS[0]; i++) {
      cache.get(`set-${Math.floor(Math.random() * CONFIG.ITEM_COUNTS[0])}`);
    }
  }

  private deleteOperations(cache: Qiks<string, any>) {
    for (let i = 0; i < CONFIG.ITEM_COUNTS[0]; i++) {
      cache.delete(`set-${i}`);
    }
  }

  private recordResult(data: any) {
    this.results.push({
      timestamp: new Date().toISOString(),
      node_version: process.version,
      ...data,
    });
  }

  private async saveResults() {
    await writeFile('benchmark-results.json', JSON.stringify(this.results, null, 2));
  }
}

// Run benchmark
(async () => {
  try {
    const qiksbench = new QiksBenchmark();
    // .run().catch(console.error);
    console.log('QIKS:BENCH:-> ', qiksbench);
    const result = await qiksbench.run();
    console.log('RESULT:', result);
  } catch (error) {
    console.log('error:', error);
  }
})();
