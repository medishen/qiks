import { describe, it } from 'mocha';
import { expect } from 'chai';
import { TTLManager } from '../../../../src/core/managers/TTLManager';
import { CacheItem } from '../../../../src/types/CacheTypes';
import { CacheError } from '../../../../src/errors/CacheError';

describe('TTLManager', () => {
  let ttlManager: TTLManager;

  beforeEach(() => {
    ttlManager = new TTLManager();
  });

  it('sets a valid TTL and returns the correct expiry time', () => {
    const ttl = 1000;
    const expiry = ttlManager.setTTL(ttl);
    expect(expiry).to.be.a('number').and.to.be.greaterThan(Date.now());
  });

  it('throws an error when TTL is zero or negative', () => {
    expect(() => ttlManager.setTTL(0)).to.throw(CacheError, 'TTL must be greater than 0');
    expect(() => ttlManager.setTTL(-100)).to.throw(CacheError, 'TTL must be greater than 0');
  });

  it('correctly identifies expired entries', async () => {
    const ttl = 100;
    const expiry = ttlManager.setTTL(ttl);
    const entry: CacheItem<string> = { value: 'test', expiry };

    expect(ttlManager.isExpired(entry)).to.be.false;

    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(ttlManager.isExpired(entry)).to.be.true;
  });

  it('handles entries with no expiry set', () => {
    const entry: CacheItem<string> = { value: 'test', expiry: null };
    expect(ttlManager.isExpired(entry)).to.be.false;
  });

  it('handles edge case when expiry time is exactly the current time', () => {
    const expiry = Date.now();
    const entry: CacheItem<string> = { value: 'test', expiry };

    expect(ttlManager.isExpired(entry)).to.be.true;
  });

  it('handles entries where expiry time is in the past', () => {
    const expiry = Date.now() - 1000;
    const entry: CacheItem<string> = { value: 'test', expiry };
    expect(ttlManager.isExpired(entry)).to.be.true;
  });

  it('handles large TTL values', () => {
    const ttl = 10 ** 8;
    const expiry = ttlManager.setTTL(ttl);
    expect(expiry).to.be.a('number').and.to.be.greaterThan(Date.now());
  });

  it('handles small TTL values accurately', async () => {
    const ttl = 1;
    const expiry = ttlManager.setTTL(ttl);
    const entry: CacheItem<string> = { value: 'test', expiry };
    expect(ttlManager.isExpired(entry)).to.be.false;
    await new Promise((resolve) => setTimeout(resolve, 2));
    expect(ttlManager.isExpired(entry)).to.be.true;
  });

  describe('Edge Cases', () => {
    it('handles undefined expiry gracefully', () => {
      const entry: CacheItem<string> = { value: 'test' };
      expect(ttlManager.isExpired(entry)).to.be.false;
    });

    it('handles boundary case where TTL is just 1ms', async () => {
      const ttl = 1;
      const expiry = ttlManager.setTTL(ttl);
      const entry: CacheItem<string> = { value: 'test', expiry };
      expect(ttlManager.isExpired(entry)).to.be.false;
      await new Promise((resolve) => setTimeout(resolve, 1));
      expect(ttlManager.isExpired(entry)).to.be.true;
    });

    it('handles entries with null value but valid expiry', () => {
      const ttl = 1000;
      const expiry = ttlManager.setTTL(ttl);
      const entry: CacheItem<null> = { value: null, expiry };

      expect(ttlManager.isExpired(entry)).to.be.false;
    });

    it('handles entries with complex value and valid expiry', () => {
      const ttl = 1000;
      const expiry = ttlManager.setTTL(ttl);
      const entry: CacheItem<object> = { value: { key: 'value' }, expiry };

      expect(ttlManager.isExpired(entry)).to.be.false;
    });

    it('handles rapid successive calls to check expiration', async () => {
      const ttl = 10;
      const expiry = ttlManager.setTTL(ttl);
      const entry: CacheItem<string> = { value: 'test', expiry };
      for (let i = 0; i < 5; i++) {
        expect(ttlManager.isExpired(entry)).to.be.false;
        await new Promise((resolve) => setTimeout(resolve, 1));
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(ttlManager.isExpired(entry)).to.be.true;
    });
  });
});
