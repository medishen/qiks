import { CacheError } from '../errors/CacheError';
import { EventCallback, StorageAdapter } from '../types/CacheTypes';
import { validateKey } from '../utils';
export class ObserverManager<K, V> {
  constructor(private storage: StorageAdapter<K, any>) {}
  observeKey(key: K, callback: EventCallback<K, V>): void {
    validateKey(key);

    const cacheItem = this.storage.get(key);
    if (!cacheItem) {
      throw new CacheError(`Key "${key}" does not exist in the cache.`);
    }
    const existingObservers = cacheItem.observers || [];
    if (existingObservers.includes(callback)) {
      throw new CacheError(`Observer already registered for key "${key}".`);
    }

    existingObservers.push(callback);
    cacheItem.observers = existingObservers;
    this.storage.set(key, cacheItem);
  }
  unobserveKey(key: K, callback: EventCallback<K, V>): void {
    validateKey(key);

    const cacheItem = this.storage.get(key);
    if (!cacheItem || !cacheItem.observers) {
      throw new CacheError(`No observers found for key "${key}".`);
    }

    const index = cacheItem.observers.indexOf(callback);
    if (index === -1) {
      throw new CacheError(`Observer not found for key "${key}".`);
    }

    cacheItem.observers.splice(index, 1);
    this.storage.set(key, cacheItem);
  }
  triggerObservers(key: K, value?: V): void {
    const cacheItem = this.storage.get(key);
    if (cacheItem && cacheItem.observers) {
      cacheItem.observers.forEach((callback: EventCallback<K, V>) => {
        callback(key, value);
      });
    }
  }
}
