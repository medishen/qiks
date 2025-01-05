import { beforeEach, describe, it } from 'mocha';
import { performance } from 'perf_hooks';
import { expect } from 'chai';
import { Qiks } from '../../src';

describe('Enhanced Performance Tests for Qiks', function () {
  this.timeout(60000);

  let cache: Qiks<string, string>;

  beforeEach(() => {
    cache = new Qiks({
      maxSize: 10_000,
      storage: new Map(),
      policy: 'LRU',
    });
  });

  afterEach(() => {
    cache.clear();
  });

  function getMemoryUsage() {
    const used = process.memoryUsage();
    return {
      rss: (used.rss / 1024 / 1024).toFixed(2) + ' MB',
      heapTotal: (used.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
      heapUsed: (used.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
      external: (used.external / 1024 / 1024).toFixed(2) + ' MB',
    };
  }

  function logMemoryUsage(label: string) {
    const memoryUsage = getMemoryUsage();
    console.log(`${label} Memory Usage:`, memoryUsage);
    return memoryUsage;
  }

  it('should handle high insertion and retrieval load efficiently', () => {
    const operations = 10_000;
    const keys = Array.from({ length: operations }, (_, i) => `key-${i}`);
    const values = Array.from({ length: operations }, (_, i) => `value-${i}`);

    logMemoryUsage('Before Test');

    const insertionStart = performance.now();
    keys.forEach((key, index) => cache.set(key, values[index]));
    const insertionEnd = performance.now();

    logMemoryUsage('After Insertions');

    const retrievalStart = performance.now();
    keys.forEach((key, index) => {
      const value = cache.get(key);
      expect(value).to.equal(values[index]);
    });
    const retrievalEnd = performance.now();

    logMemoryUsage('After Retrievals');

    console.log(`Insertion Time: ${(insertionEnd - insertionStart).toFixed(2)}ms`);
    console.log(`Retrieval Time: ${(retrievalEnd - retrievalStart).toFixed(2)}ms`);
  });

  it('should handle TTL expiration efficiently under load', (done) => {
    const operations = 5000;
    const keys = Array.from({ length: operations }, (_, i) => `key-${i}`);
    const values = Array.from({ length: operations }, (_, i) => `value-${i}`);

    logMemoryUsage('Before TTL Test');

    const ttlStart = performance.now();
    keys.forEach((key, index) => cache.set(key, values[index], { ttl: 500 }));
    const ttlSetEnd = performance.now();

    logMemoryUsage('After Setting TTLs');

    setTimeout(() => {
      const ttlExpiredStart = performance.now();
      keys.forEach((key) => {
        const value = cache.get(key);
        expect(value).to.be.null;
      });
      const ttlExpiredEnd = performance.now();

      logMemoryUsage('After TTL Expirations');

      console.log(`TTL Set Time: ${(ttlSetEnd - ttlStart).toFixed(2)}ms`);
      console.log(`TTL Expired Retrieval Time: ${(ttlExpiredEnd - ttlExpiredStart).toFixed(2)}ms`);

      done();
    }, 600);
  });

  it('should not exhibit memory leaks after repeated operations', function () {
    this.timeout(10000);
    const operations = 10_000;

    logMemoryUsage('Before Memory Leak Test');

    for (let i = 0; i < operations; i++) {
      cache.set(`key-${i}`, `value-${i}`);
      if (i % 10_000 === 0) {
        cache.delete(`key-${i - 5000}`);
      }
    }

    logMemoryUsage('After Load Test');
    logMemoryUsage('After Garbage Collection');

    const memoryUsage = process.memoryUsage();
    expect(memoryUsage.heapUsed / 1024 / 1024).to.be.within(100, 150);
  });
});
