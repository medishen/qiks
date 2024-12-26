import { Serializer } from './core/managers/Serializer';
import { Cache } from './core/Cache';
import { CacheConfigQiks, CacheItem } from './types/CacheTypes';
import { NamespaceCache } from './core/managers/NamespaceManager';
import { createStorageAdapter } from './utils';
export class Qiks<K, V> extends Cache<string, V> {
  constructor(
    options: CacheConfigQiks<K> = {
      maxSize: 100,
      policy: 'LRU',
      serializer: Serializer,
      storage: new Map(),
    },
  ) {
    const storage = createStorageAdapter<string, CacheItem<string>>(options.storage);
    super({
      ...options,
      serializer: Serializer,
      storage: storage,
    });
  }
  namespace(namespace: string): NamespaceCache<string, V> {
    return new NamespaceCache<string, V>({
      namespace: namespace,
      parentStorage: this.options.storage,
      serializer: this.options.serializer,
      policy: this.options.policy,
    });
  }
}
