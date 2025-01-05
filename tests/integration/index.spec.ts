import { expect } from 'chai';
import { Qiks } from '../../src/index';
import { CacheError } from '../../src/errors/CacheError';
import { NamespaceCache } from '../../src/core/managers/NamespaceManager';
import { beforeEach, describe, it } from 'mocha';

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
      cache.on('expire', (key) => {
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
    let namespace1: NamespaceCache<string, any>;
    let namespace2: NamespaceCache<string, any>;

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
    it('should emit a "change" event on setting a value', (done) => {
      const myKey = 'key1';
      cache.set(myKey, 'value');
      cache.on(
        'change',
        (key, value) => {
          expect(key).to.equal(myKey);
          expect(value).to.equal('newValue');
          done();
        },
        { key: myKey },
      );
      cache.set(myKey, 'newValue');
    });
    it('should emit and handle a custom event', (done) => {
      const customEvent = 'customEvent';
      const myKey = 'key1';
      const myValue = 'customValue';
      const customEventCallback = (key: string, value: string) => {
        expect(key).to.equal(myKey);
        expect(value).to.equal(myValue);
        done();
      };

      cache.on(customEvent, customEventCallback);
      cache.emit(customEvent, myKey, myValue);
    });
    it('should emit a "set" event on setting a value', (done) => {
      cache.on('set', (key, value) => {
        expect(key).to.equal('key1');
        expect(value).to.equal('value1');
        done();
      });
      cache.set('key1', 'value1');
    });

    it('should emit a "get" event on getting a value', (done) => {
      cache.set('key1', 'value1');
      cache.on('get', (key, value) => {
        expect(key).to.deep.equal('key1');
        expect(value).to.deep.equal('value1');
        done();
      });
      cache.get('key1');
    });

    it('should emit a "delete" event on deleting a value', (done) => {
      cache.set('key1', 'value1');
      cache.on('delete', (key, value) => {
        expect(key).to.equal('key1');
        expect(value).to.equal('value1');
        done();
      });
      cache.delete('key1');
    });
    it('should remove a listener with "off"', (done) => {
      const customEvent = 'customEvent';
      const myKey = 'key1';
      const myValue = 'customValue';

      const customEventCallback = (key: string, value: string) => {
        expect(key).to.equal(myKey);
        expect(value).to.equal(myValue);
        done();
      };
      cache.on(customEvent, customEventCallback);
      cache.emit(customEvent, myKey, myValue);
      cache.off(customEvent, customEventCallback);
      cache.emit(customEvent, myKey, myValue);
    });
  });

  describe('Edge Cases', () => {
    it('should throw an error for empty key on set', () => {
      expect(() => cache.set('', 'value1')).to.throw('Key must not be empty');
    });

    it('should throw an error for empty namespace', () => {
      expect(() => cache.namespace('')).to.throw(CacheError, 'Namespace name must not be empty');
    });

    it('should handle a large number of keys efficiently', () => {
      for (let i = 0; i < 10000; i++) {
        cache.set(`key${i}`, `value${i}`);
      }
      expect(cache.size()).to.equal(100);
    });
  });
});
