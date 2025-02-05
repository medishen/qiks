import { CacheErrorCodes, EventParams, EventType } from '../../common';
import { CacheExceptionFactory } from '../../errors';
import { EventRegistry } from '../systems/event-registry';

export class EventEmitter<E extends EventType, K, V> {
  constructor(private _registry: EventRegistry<E, K, V>) {}
  /**
   * Emits an event, triggering the registered listeners with the provided parameters.
   * @param event - The event type to emit.
   * @param params - The parameters to pass to the event listeners.
   */
  emit(event: E, params: EventParams<E, K, V>): void;
  async emit(event: E, params: EventParams<E, K, V>): Promise<void>;
  emit(event: E, params: EventParams<E, K, V>): any {
    const listeners = this._registry.getListeners(event);
    const listenerPromises: Promise<void>[] = [];
    // Invoke all listeners
    listeners.forEach((listener) => {
      try {
        const result: any = listener(params); // Explicitly typing result
        if (result instanceof Promise) {
          listenerPromises.push(result); // If it's a promise, push it to the array
        }
      } catch (error: any) {
        throw CacheExceptionFactory.createException(CacheErrorCodes.UNEXPECTED_ERROR, `Error executing listener for event: ${event}`, { event, error: error.message });
      }
    });
    if (listenerPromises.length > 0) {
      return Promise.all(listenerPromises).then(() => {});
    }
  }
}
