import { CacheEvent, EventCallback } from '../types/CacheTypes';

export class EventManager<K, V> {
  constructor(private storage: Map<string, Set<EventCallback<K, V>>>) {}

  on(event: CacheEvent, callback: EventCallback<K, V>): void {
    const eventKey = this.getEventKey(event);
    if (!this.storage.has(eventKey)) {
      this.storage.set(eventKey, new Set());
    }
    this.storage.get(eventKey)!.add(callback);
  }

  off(event: CacheEvent, callback: EventCallback<K, V>): void {
    const eventKey = this.getEventKey(event);
    const listeners = this.storage.get(eventKey);
    if (!listeners) return;
    listeners.delete(callback);
    if (listeners.size === 0) {
      this.storage.delete(eventKey);
    }
  }
  emit(event: CacheEvent, key: K, value?: V): void {
    const eventKey = this.getEventKey(event);
    const listeners = this.storage.get(eventKey);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(key, value);
        } catch (error) {
          console.error(`Error executing callback for event: ${event}`, error);
        }
      });
    }
  }
  private getEventKey(event: CacheEvent): string {
    return `event:${event}`;
  }
}
