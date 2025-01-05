import { Cache } from '../core/Cache';
import { ObserverManager } from '../core/managers/ObserverManager';
import { CacheEventType, CacheItem, EventCallback, EventParams, StorageAdapter } from '../types/CacheTypes';

export class EventManager<K, V> {
  constructor(private storage: StorageAdapter<K, CacheItem<K, V>>, private observerManager?: ObserverManager<K, V>) {}
  on(event: CacheEventType, callback: EventCallback<K, V>, params?: EventParams<K>): void {
    if (event === 'change') {
      return this.observerManager?.observeKey(params!.key, callback);
    }
    const eventKey = this.getEventKey(event);
    let listenersItem = this.storage.get(eventKey);
    if (!listenersItem) {
      listenersItem = { value: new Set<EventCallback<K, V>>() } as CacheItem<K, V>;
      this.storage.set(eventKey, listenersItem);
    }

    const listeners = listenersItem.value as Set<EventCallback<K, V>>;
    listeners.add(callback);
  }
  off(event: CacheEventType, callback: EventCallback<K, V>, params?: EventParams<K>): void {
    if (event === 'change') {
      return this.observerManager?.unobserveKey(params!.key, callback);
    }
    const eventKey = this.getEventKey(event);
    const listenersItem = this.storage.get(eventKey);
    if (listenersItem) {
      const listeners = listenersItem.value as Set<EventCallback<K, V>>;
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.storage.delete(eventKey);
      }
    }
  }
  emit(event: CacheEventType, key: K, value?: V): void {
    const eventKey = this.getEventKey(event);
    const listenersItem = this.storage.get(eventKey);

    if (listenersItem) {
      const listeners = listenersItem.value as Set<EventCallback<K, V>>;
      for (const callback of listeners) {
        try {
          callback(key, value);
        } catch (error) {
          console.error(`Error executing callback for event: ${event}`, error);
        }
      }
    }
  }
  private getEventKey(event: CacheEventType): K {
    return `${Cache.INTERNAL_PREFIX}event:${event}` as K;
  }
}
