import { Cache } from '../dist/core/Cache';
import { createStorageAdapter } from '../dist/utils/index';
import { performance } from 'perf_hooks';
// Custom Storage Adapter (Map)
const storage = new Map<string, any>();
const storageAdapter = createStorageAdapter<string, any>(storage);

// Benchmark Cache
const cache = new Cache<string, any>({
  storage: storageAdapter,
  maxSize: 1000,
  serializer: {
    serialize: (data: any) => JSON.stringify(data),
    deserialize: (data: string) => JSON.parse(data),
  },
  policy: 'LRU',
});

const benchmarkSet = (count: number) => {
  const start = performance.now();
  for (let i = 0; i < count; i++) {
    cache.set(`key-${i}`, `value-${i}`);
  }
  const end = performance.now();
  console.log(`Set Benchmark: ${end - start}ms`);
};

const benchmarkGet = (count: number) => {
  const start = performance.now();
  for (let i = 0; i < count; i++) {
    cache.get(`key-${i}`);
  }
  const end = performance.now();
  console.log(`Get Benchmark: ${end - start}ms`);
};

const benchmarkDelete = (count: number) => {
  const start = performance.now();
  for (let i = 0; i < count; i++) {
    cache.delete(`key-${i}`);
  }
  const end = performance.now();
  console.log(`Delete Benchmark: ${end - start}ms`);
};

const benchmarkEviction = (count: number) => {
  const start = performance.now();
  for (let i = 0; i < count; i++) {
    cache.set(`key-${i}`, `value-${i}`, { ttl: 100 });
  }
  // Simulate a TTL expiration
  setTimeout(() => {
    const end = performance.now();
    console.log(`Eviction Benchmark: ${end - start}ms`);
  }, 200);
};

const benchmarkMixedOperations = (count: number) => {
  const start = performance.now();
  for (let i = 0; i < count; i++) {
    cache.set(`key-${i}`, `value-${i}`);
    cache.get(`key-${i}`);
    if (i % 2 === 0) {
      cache.delete(`key-${i}`);
    }
  }
  const end = performance.now();
  console.log(`Mixed Operations Benchmark: ${end - start}ms`);
};

// Run benchmark for 1000 operations
const operationCount = 1000;

// Run individual benchmarks
benchmarkSet(operationCount);
benchmarkGet(operationCount);
benchmarkDelete(operationCount);

// Run eviction benchmark
benchmarkEviction(operationCount);

// Run mixed operation benchmark
benchmarkMixedOperations(operationCount);

// To simulate a cache operation stress test
const stressTest = (iterations: number, operations: number) => {
  const start = performance.now();
  console.log(`Running stress test with ${iterations} iterations and ${operations} operations per iteration...`);
  for (let i = 0; i < iterations; i++) {
    console.log(`Running stress test iteration: ${i + 1}`);
    benchmarkSet(operations);
    benchmarkGet(operations);
    benchmarkDelete(operations);
  }
  const end = performance.now();
  console.log(`Cache Stress Test: ${(end - start).toFixed(3)}ms`);
};

// Running stress test with 5 iterations and 1000 operations per iteration
stressTest(5, 1000);
