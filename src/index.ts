import { Serializer } from './core/Serializer';
import { Cache } from './core/Cache';
import { CacheEntry, SerializerType } from './types/CacheTypes';
import { NamespaceCache } from './core/NamespaceManager';
export class Qiks<K, V> extends Cache<string, V> {
  constructor(protected serializer: SerializerType = Serializer) {
    super(new Map<string, CacheEntry<string>>(), serializer);
  }
  namespace(namespace: string): NamespaceCache<string, V> {
    return new NamespaceCache<string, V>(this.storage, namespace, this.serializer);
  }
}
