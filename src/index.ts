import { Cache } from './core/Cache';
import { CacheConfigQiks, CacheItem } from './types/CacheTypes';
import { NamespaceCache } from './core/managers/NamespaceManager';
import { createStorageAdapter } from './utils';
export class Qiks<K, V> extends Cache<K, V> {
  constructor(options: CacheConfigQiks<K> = {}) {
    const { maxSize = 100, policy = 'LRU', storage = new Map() } = options;
    const adaptedStorage = createStorageAdapter<K, CacheItem<K, V>>(storage);
    super({
      maxSize,
      policy,
      storage: adaptedStorage,
    });
  }
  namespace(namespace: string): NamespaceCache<K, V> {
    return new NamespaceCache<K, V>({
      namespace: namespace,
      parentStorage: this.options.storage,
      policy: this.options.policy,
    });
  }
}
