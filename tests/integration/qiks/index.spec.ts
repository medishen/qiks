import { expect } from 'chai';
import { Qiks } from '../../../src/index';
import { beforeEach, describe, it } from 'mocha';
import { CacheStoreWithNamespace, EventType } from '../../../src/common';

describe('QIKS Integration Tests', () => {
  let cache: Qiks<string, any>;

  beforeEach(() => {
    cache = new Qiks<string, any>();
  });

  describe('Basic In-Memory Caching', () => {
    it('should set and get a value', () => {
      cache.set('key1', 'value1');
      const result = cache.get('key1');
      expect(result).to.equal('value1');
    });

    it('should return null for a non-existent key', () => {
      const result = cache.get('nonExistentKey');
      expect(result).to.be.null;
    });

    it('should overwrite an existing key', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'newValue');
      const result = cache.get('key1');
      expect(result).to.equal('newValue');
    });

    it('should delete a key', () => {
      cache.set('key1', 'value1');
      cache.delete('key1');
      const result = cache.get('key1');
      expect(result).to.be.null;
    });

    it('should clear all keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.get('key1')).to.be.null;
      expect(cache.get('key2')).to.be.null;
    });
  });

  describe('TTL Support', () => {
    it('should expire a key after the TTL', (done) => {
      cache.set('key1', 'value1', { ttl: 100 });
      setTimeout(() => {
        const result = cache.get('key1');
        expect(result).to.be.null;
        done();
      }, 150);
    });

    it('should not expire a key before the TTL', (done) => {
      cache.set('key1', 'value1', { ttl: 200 });
      setTimeout(() => {
        const result = cache.get('key1');
        expect(result).to.equal('value1');
        done();
      }, 100);
    });

    it('should emit an "expire" event when a key expires', () => {
      cache.on(EventType.Expire, (key) => {
        expect(key).to.equal('key1');
      });
      cache.set('key1', 'value1', { ttl: 100 });
    });
  });

  describe('Serialization', () => {
    it('should serialize and deserialize objects correctly', () => {
      const complexObject = { name: 'QIKS', features: ['cache', 'ttl', 'events'] };
      cache.set('key1', complexObject);
      const result = cache.get('key1');
      expect(result).to.deep.equal(complexObject);
    });
  });

  describe('Namespaces', () => {
    let namespace1: CacheStoreWithNamespace<string, any>;
    let namespace2: CacheStoreWithNamespace<string, any>;

    beforeEach(() => {
      namespace1 = cache.namespace('ns1');
      namespace2 = cache.namespace('ns2');
    });

    it('should isolate keys between namespaces', () => {
      namespace1.set('key1', 'value1');
      namespace2.set('key1', 'value2');
      expect(namespace1.get('key1')).to.equal('value1');
      expect(namespace2.get('key1')).to.equal('value2');
    });

    it('should handle TTL within namespaces', (done) => {
      namespace1.set('key1', 'value1', { ttl: 100 });
      namespace2.set('key1', 'value2', { ttl: 200 });

      setTimeout(() => {
        expect(namespace1.get('key1')).to.be.null;
        expect(namespace2.get('key1')).to.equal('value2');
        done();
      }, 150);
    });

    it('should clear keys within a namespace', () => {
      namespace1.set('key1', 'value1');
      namespace1.set('key2', 'value2');
      namespace1.clear();
      expect(namespace1.get('key1')).to.be.null;
      expect(namespace1.get('key2')).to.be.null;
    });
  });

  describe('Cache Events', () => {
    it('should emit a "change" event on setting a value', () => {
      const myKey = 'key1';
      cache.set(myKey, 'value'); // Initial set

      cache.on(EventType.Change, (params) => {
        expect(params.key).to.equal(myKey);
        expect(params.newEntry?.value).to.equal('newValue');
        expect(params.oldEntry?.value).to.equal('value');
      });

      cache.set(myKey, 'newValue'); // This should trigger the event
    });

    it('should emit a "set" event on setting a value', () => {
      cache.on(EventType.Set, (params) => {
        expect(params.key).to.equal('key1');
        expect(params.entry.value).to.equal('value1');
      });
      cache.set('key1', 'value1');
    });

    it('should emit a "get" event on getting a value', () => {
      cache.set('key1', 'value1');
      cache.on(EventType.Get, (params) => {
        expect(params.key).to.deep.equal('key1');
        expect(params.entry?.value).to.deep.equal('value1');
      });
      cache.get('key1');
    });

    it('should emit a "delete" event on deleting a value', () => {
      cache.set('key1', 'value1');
      cache.on(EventType.Delete, (params) => {
        expect(params.key).to.equal('key1');
        expect(params.entry?.value).to.equal('value1');
      });
      cache.delete('key1');
    });
  });
});
