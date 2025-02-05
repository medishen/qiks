import { EventType } from '../../enums';
import { EventPlayLoads } from '../../interfaces';

export type EventParams<E extends EventType, K, V> = {
  [T in E]: { type: T } & EventPlayLoads<K, V>[T];
}[E];

// interfaces.ts
export type EventCallback<E extends EventType, K, V> = (params: EventParams<E, K, V>) => void | Promise<void>;
