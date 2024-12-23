import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import { TTLManager } from '../../../src/utils/TTLManager';
describe('TTL MANAGER', () => {
  let ttlManager: TTLManager<string>;

  beforeEach(() => {
    ttlManager = new TTLManager();
  });
  it('sets and checks TTL expiration', async () => {
    ttlManager.setTTL('test', 100);
    expect(ttlManager.isExpired('test')).to.be.false;
    await new Promise((resolve) => setTimeout(resolve, 110));
    expect(ttlManager.isExpired('test')).to.be.true;
  });
  it('clears TTL for a key', () => {
    ttlManager.setTTL('test', 1000);
    ttlManager.clearTTL('test');
    expect(ttlManager.isExpired('test')).to.be.false;
  });

  it('handles non-existent keys gracefully', () => {
    expect(ttlManager.isExpired('non-existent')).to.be.false;
    ttlManager.clearTTL('non-existent');
  });

  it('clears all TTLs', () => {
    ttlManager.setTTL('test1', 1000);
    ttlManager.setTTL('test2', 2000);
    ttlManager.clearAll();
    expect(ttlManager.isExpired('test1')).to.be.false;
    expect(ttlManager.isExpired('test2')).to.be.false;
  });
  describe('Edge Cases', () => {
    it('throws an error for TTL less than or equal to 0', () => {
      expect(() => ttlManager.setTTL('test', 0)).to.throw('TTL must be greater than 0');
      expect(() => ttlManager.setTTL('test', -100)).to.throw('TTL must be greater than 0');
    });

    it('handles repeated setTTL calls for the same key', async () => {
      ttlManager.setTTL('test', 100);
      ttlManager.setTTL('test', 200);
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(ttlManager.isExpired('test')).to.be.false;
      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(ttlManager.isExpired('test')).to.be.true;
    });

    it('handles large TTL values correctly', async () => {
      const largeTTL = 10 * 60 * 1000;
      ttlManager.setTTL('test', largeTTL);
      expect(ttlManager.isExpired('test')).to.be.false;
    });

    it('works correctly with multiple keys having different TTLs', async () => {
      ttlManager.setTTL('key1', 100);
      ttlManager.setTTL('key2', 200);
      await new Promise((resolve) => setTimeout(resolve, 110));
      expect(ttlManager.isExpired('key1')).to.be.true;
      expect(ttlManager.isExpired('key2')).to.be.false;
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(ttlManager.isExpired('key2')).to.be.true;
    });

    it('removes TTL on key deletion', () => {
      ttlManager.setTTL('test', 1000);
      ttlManager.clearTTL('test');
      expect(ttlManager.isExpired('test')).to.be.false;
    });

    it('does not throw error on clearing TTL for non-existent keys', () => {
      expect(() => ttlManager.clearTTL('non-existent')).to.not.throw();
    });

    it('handles rapid set and delete operations without errors', () => {
      ttlManager.setTTL('test', 100);
      ttlManager.clearTTL('test');
      ttlManager.setTTL('test', 200);
      ttlManager.clearTTL('test');
      expect(ttlManager.isExpired('test')).to.be.false;
    });

    it('handles empty key gracefully', () => {
      expect(() => ttlManager.setTTL('', 100)).to.not.throw();
    });
  });
});
