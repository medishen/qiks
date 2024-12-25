import { CacheError } from '../errors/CacheError';
import { CacheItemOptions, NamespaceCacheConfig } from '../types/CacheTypes';
import { Cache } from './Cache';

export class NamespaceManager {
  static createCompoundKey(namespace: string, key: string): string {
    if (!namespace) {
      throw new CacheError('Namespace name must not be empty');
    }
    if (!key) {
      throw new CacheError('Key must not be empty');
    }
    return `${namespace}:${key}`;
  }
}
export class NamespaceCache<K, V> extends Cache<string, V> {
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

  private getCompoundKey(key: string): string {
    return NamespaceManager.createCompoundKey(this.config.namespace, key);
  }

  set(key: string, value: V, options?: CacheItemOptions<string,V>): void {
    const compoundKey = this.getCompoundKey(key);
    super.set(compoundKey, value, options);
  }

  get(key: string): V | null {
    const compoundKey = this.getCompoundKey(key);
    return super.get(compoundKey);
  }

  delete(key: string): void {
    const compoundKey = this.getCompoundKey(key);
    super.delete(compoundKey);
  }

  clear(): void {
    for (const compoundKey of this.config.parentStorage.keys()) {
      if (compoundKey.startsWith(`${this.config.namespace}:`)) {
        super.delete(compoundKey);
      }
    }
  }

  has(key: string): boolean {
    const compoundKey = this.getCompoundKey(key);
    return super.has(compoundKey);
  }

  size(): number {
    return super.countBy(`${this.config.namespace}`);
  }
}
