import { CacheError } from '../../errors/CacheError';
import { CacheItemOptions, GetOptions, NamespaceCacheConfig } from '../../types/CacheTypes';
import { Cache } from '../Cache';

export class NamespaceManager {
  static createCompoundKey<K>(namespace: string, key: K): K {
    if (!namespace) {
      throw new CacheError('Namespace name must not be empty');
    }
    if (!key) {
      throw new CacheError('Key must not be empty');
    }
    return `${namespace}:${key}` as K;
  }
}
export class NamespaceCache<K, V> extends Cache<K, V> {
  constructor(private config: NamespaceCacheConfig<K, V>) {
    const { parentStorage, namespace, serializer, policy } = config;
    if (!namespace) {
      throw new CacheError('Namespace name must not be empty');
    }
    super({
      storage: parentStorage,
      serializer: serializer,
      policy: policy,
    });
  }

  private getCompoundKey(key: K): K {
    return NamespaceManager.createCompoundKey(this.config.namespace, key);
  }

  set(key: K, value: V, options?: CacheItemOptions<K, V>): void {
    const compoundKey = this.getCompoundKey(key);
    super.set(compoundKey, value, options);
  }

  get(key: K, options?: GetOptions<K>): V | [K, V][] | V[] | K[] | null | Promise<V | null> {
    const compoundKey = this.getCompoundKey(key);
    return super.get(compoundKey, options);
  }

  delete(key: K): boolean {
    const compoundKey = this.getCompoundKey(key);
    return super.delete(compoundKey);
  }

  clear(): void {
    for (const compoundKey of this.config.parentStorage.keys()) {
      if (typeof compoundKey === 'string') {
        if (compoundKey.startsWith(`${this.config.namespace}:`)) {
          super.delete(compoundKey);
        }
      }
    }
  }

  has(key: K): boolean {
    const compoundKey = this.getCompoundKey(key);
    return super.has(compoundKey);
  }

  size(): number {
    return super.countBy(`${this.config.namespace}`);
  }
}
