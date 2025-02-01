import { EventCallback, EventType, generateEventKey } from '../../common';
import { extractKey } from '../../common/utils/extract-keys.utils';
/**
 * EventRegistry is responsible for managing event listeners for specific event types.
 * It allows adding, removing, and retrieving listeners for various cache events
 */
export class EventRegistry<K extends EventType, V> {
  private _listeners: Map<string, EventCallback<K, V>[]>;

  constructor() {
    this._listeners = new Map();
  }

  /**
   * Adds a listener for a specified event type.
   * @param event - The event type to listen to.
   * @param listener - The callback function to be invoked when the event occurs.
   */
  addListener<T extends K>(event: T, listener: EventCallback<K, V>): void {
    const existingListeners = this._listeners.get(event) ?? [];
    const eventKey = generateEventKey(event);
    this._listeners.set(eventKey, [listener, ...existingListeners]);
  }

  /**
   * Removes a listener for a specified event type.
   * @param event - The event type from which to remove the listener.
   * @param listener - The callback function to be removed.
   */
  removeListener<T extends K>(event: T, listener: EventCallback<K, V>): void {
    const eventKey = generateEventKey(event);
    const listeners = this._listeners.get(eventKey);
    if (listeners) {
      const updatedListeners = listeners.filter((l) => l !== listener);
      this._listeners.set(eventKey, updatedListeners);
    }
  }

  /**
   * Retrieves all listeners for a specified event.
   * @param event - The event type for which to retrieve listeners.
   * @returns An array of listeners for the event, or an empty array if no listeners are found.
   */
  getListeners<T extends K>(event: T): EventCallback<K, V>[] {
    const eventKey = generateEventKey(event);
    return this._listeners.get(eventKey) ?? [];
  }

  /**
   * Retrieves all events that have listeners attached.
   * @returns An array of event types that currently have listeners.
   */
  getAllEvents(): string[] {
    const allKeys: string[] = [];
    const keys = Array.from(this._listeners.keys());
    keys.forEach((key) => {
      allKeys.push(extractKey(key).event);
    });
    return allKeys;
  }
}
