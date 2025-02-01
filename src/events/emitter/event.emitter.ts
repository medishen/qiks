import { EventParams, EventType } from '../../common';
import { CacheExceptionFactory } from '../../errors';
import { EventRegistry } from '../systems/event-registry';

export class EventEmitter<K extends EventType, V> {
  constructor(private _registry: EventRegistry<K, V>) {}
  /**
   * Emits an event, triggering the registered listeners with the provided parameters.
   * @param event - The event type to emit.
   * @param params - The parameters to pass to the event listeners.
   */
  emit(event: K, params: EventParams<K, V>): void;
  async emit(event: K, params: EventParams<K, V>): Promise<void>;
  emit(event: K, params: EventParams<K, V>): any {
    const listeners = this._registry.getListeners(event);

    // Invoke all listeners
    listeners.forEach((listener) => {
      try {
        listener(params.key, params.value);
      } catch (error) {
        throw CacheExceptionFactory.unexpectedError(`Error executing listener for event: ${event}`);
      }
    });
  }
}
