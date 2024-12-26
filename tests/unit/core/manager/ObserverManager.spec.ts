import { expect } from 'chai';
import { CacheItem, StorageAdapter } from '../../../../src/types/CacheTypes';
import { ObserverManager } from '../../../../src/core/managers/ObserverManager';
import { beforeEach, describe, it } from 'mocha';
import { createStorageAdapter } from '../../../../src/utils';
import { CacheError } from '../../../../src/errors/CacheError';

describe('ObserverManager', () => {
  let storage: StorageAdapter<string, any>;
  let observerManager: ObserverManager<string, string>;
  const mapStorage = new Map<any, CacheItem<string>>();
  beforeEach(() => {
    storage = createStorageAdapter<any, CacheItem<string>>(mapStorage);
    observerManager = new ObserverManager(storage);
  });

  describe('observeKey', () => {
    it('should register an observer for an existing key', () => {
      const key = 'user:1';
      const callback: (key: string, value?: string) => void = (key, value) => {
        expect(key).to.equal('user:1');
        expect(value).to.equal('John');
      };
      storage.set(key, { value: 'John', observers: [] });
      observerManager.observeKey(key, callback);

      const cacheItem = storage.get(key);
      expect(cacheItem.observers).to.include(callback);
    });

    it('should throw an error if the key does not exist', () => {
      const key = 'user:1';
      const callback: (key: string, value?: string) => void = (key, value) => {};
      const getStub = storage.get;
      storage.get = () => undefined;
      expect(() => observerManager.observeKey(key, callback)).to.throw(CacheError, `Key "${key}" does not exist in the cache.`);
      storage.get = getStub;
    });

    it('should throw an error if the observer is already registered', () => {
      const key = 'user:1';
      const callback: (key: string, value?: string) => void = (key, value) => {};

      storage.set(key, { value: 'John', observers: [callback] });

      expect(() => observerManager.observeKey(key, callback)).to.throw(CacheError, `Observer already registered for key "${key}".`);
    });
  });

  describe('unobserveKey', () => {
    it('should remove an observer for an existing key', () => {
      const key = 'user:1';
      const callback: (key: string, value?: string) => void = (key, value) => {};

      storage.set(key, { value: 'John', observers: [callback] });

      observerManager.unobserveKey(key, callback);
      const cacheItem = storage.get(key);
      expect(cacheItem.observers).to.not.include(callback);
    });

    it('should throw an error if the observer is not registered for the key', () => {
      const key = 'user:1';
      const callback: (key: string, value?: string) => void = (key, value) => {};

      storage.set(key, { value: 'John', observers: [] });

      expect(() => observerManager.unobserveKey(key, callback)).to.throw(CacheError, `Observer not found for key "${key}".`);
    });

    it('should throw an error if no observers are found for the key', () => {
      const key = 'user:1';
      const callback: (key: string, value?: string) => void = (key, value) => {};

      expect(() => observerManager.unobserveKey(key, callback)).to.throw(CacheError, `Observer not found for key "${key}".`);
    });
  });

  describe('triggerObservers', () => {
    it('should trigger all observers for a key with the correct value', () => {
      const key = 'user:1';
      const callback = (key: string, value: string) => {
        expect(key).to.equal('user:1');
        expect(value).to.equal('John');
      };

      storage.set(key, { value: 'John', observers: [callback] });

      observerManager.triggerObservers(key, 'John');
    });

    it('should not trigger observers if the key does not exist', () => {
      const key = 'user:1';
      const callback: (key: string, value?: string) => void = (key, value) => {};

      storage.set(key, { value: 'John', observers: [] });

      observerManager.triggerObservers('nonexistentKey', 'John');
      // Ensure no errors and no triggers occur
    });

    it('should not trigger any observers if no observers are registered', () => {
      const key = 'user:1';
      const callback: (key: string, value?: string) => void = (key, value) => {};

      storage.set(key, { value: 'John', observers: [] });

      let triggered = false;
      observerManager.triggerObservers(key, 'John');
      // No observers should be triggered
      expect(triggered).to.be.false;
    });
  });
});
