import { StorageAdapter } from '../common/interfaces';

export class SizeCapacity<K, V> {
  constructor(private adapter: StorageAdapter<K, V>) {}

  isEmpty(): boolean {
    return this.adapter.size() === 0;
  }

  count(predicate: (value: V, key: K) => boolean): number {
    return Array.from(this.adapter.entries()).filter(([key, value]) => predicate(value, key)).length;
  }
}
