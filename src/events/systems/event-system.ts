import { EventCallback, EventParams, EventType } from '../../common';
import { EventEmitter } from '../emitter/event.emitter';
import { EventRegistry } from './event-registry';

/**
 * The EventSystem class integrates the EventRegistry and EventManager.
 * It provides a unified interface to register events, add listeners, and emit events.
 */
export class EventSystem<E extends EventType, K, V> {
  private _registry: EventRegistry<E, K, V>;
  private _emitter: EventEmitter<E, K, V>;

  constructor() {
    this._registry = new EventRegistry<E, K, V>();
    this._emitter = new EventEmitter<E, K, V>(this._registry);
  }

  /**
   * Adds a listener for a specified event type.
   * @param event - The event type to listen to.
   * @param listener - The callback function to be invoked when the event occurs.
   */
  addListener<T extends E>(event: T, listener: EventCallback<T, K, V>): void {
    this._registry.addListener(event, listener);
  }

  /**
   * Removes a listener for a specified event type.
   * @param event - The event type from which to remove the listener.
   * @param listener - The callback function to be removed.
   */
  removeListener<T extends E>(event: T, listener: EventCallback<T, K, V>): void {
    this._registry.removeListener(event, listener);
  }

  /**
   * Retrieves all listeners for a specified event.
   * @param event - The event type for which to retrieve listeners.
   * @returns An array of listeners for the event, or an empty array if no listeners are found.
   */
  getListeners<T extends E>(event: T): EventCallback<T, K, V>[] {
    return this._registry.getListeners(event);
  }

  /**
   * Retrieves all events that have listeners attached.
   * @returns An array of event types that currently have listeners.
   */
  getAllEvents(): string[] {
    return this._registry.getAllEvents();
  }

  /**
   * Emits an event, triggering the registered listeners with the provided parameters.
   * @param event - The event type to emit.
   * @param params - The parameters to pass to the event listeners.
   */
  emit(params: EventParams<E, K, V>): void {
    this._emitter.emit(params.type, params);
  }
}
