import { EventType } from '../../enums';
import { CacheEntry } from '../cache';

export interface EventPlayLoads<K, V> {
  // core
  [EventType.Set]: { key: K; entry: CacheEntry<K, V> };
  [EventType.Get]: { key: K; entry?: CacheEntry<K, V> };
  [EventType.Delete]: { key: K; entry: CacheEntry<K, V> };
  [EventType.Expire]: { key: K; entry: CacheEntry<K, V> };
  // lifecycle
  [EventType.Change]: { key: K; oldEntry?: CacheEntry<K, V>; newEntry: CacheEntry<K, V> };
  [EventType.Update]: { key: K; entry: CacheEntry<K, V> };
  [EventType.Rebuild]: { entries: Array<[K, CacheEntry<K, V>]> };

  // hist/miss
  [EventType.Miss]: { key: K };
  [EventType.Hit]: { key: K; entry: CacheEntry<K, V> };

  // cache management
  [EventType.Clear]: { entries: Array<[K, CacheEntry<K, V>]> };

  // cache erros
  [EventType.OperationError]: { key?: K; message: string | Error };
  [EventType.CriticalFailure]: { error: Error };

  // debugging
  [EventType.StatisticsUpdated]: { stats: Record<string, number> };

  // general
  [EventType.Error]: { message: string | Error };
}
