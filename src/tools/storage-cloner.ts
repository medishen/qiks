import { StorageAdapter } from '../common/interfaces';

export class StorageCloner<K, V> {
  constructor(private adapter: StorageAdapter<K, V>) {}

  clone(): StorageAdapter<K, V> {
    const clonedAdapter: any = {}; // Create a new adapter instance
    clonedAdapter.merge(this.adapter);
    return clonedAdapter;
  }
}
