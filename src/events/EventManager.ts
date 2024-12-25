import { Cache } from '../core/Cache';
import { CacheEventType, EventCallback, StorageAdapter } from '../types/CacheTypes';

export class EventManager<K, V> {
  constructor(private storage: StorageAdapter<string, Set<EventCallback<K, V>>>) {}
  on(event: CacheEventType, callback: EventCallback<K, V>): void {
    const eventKey = this.getEventKey(event);
    let listeners = this.storage.get(eventKey);
    if (!listeners) {
      listeners = new Set<EventCallback<K, V>>();
      this.storage.set(eventKey, listeners);
    }
    listeners.add(callback);
  }
  off(event: CacheEventType, callback: EventCallback<K, V>): void {
    const eventKey = this.getEventKey(event);
    const listeners = this.storage.get(eventKey);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.storage.delete(eventKey);
      }
    }
  }
  emit(event: CacheEventType, key: K, value?: V): void {
    const eventKey = this.getEventKey(event);
    const listeners = this.storage.get(eventKey);
    if (listeners) {
      for (const callback of listeners) {
        try {
          callback(key, value);
        } catch (error) {
          console.error(`Error executing callback for event: ${event}`, error);
        }
      }
    }
  }
  private getEventKey(event: CacheEventType): string {
    return `${Cache.INTERNAL_PREFIX}event:${event}`;
  }
}
