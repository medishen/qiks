import { CacheError } from '../errors/CacheError';
import { CacheEntry, CacheOptions, SerializerType } from '../types/CacheTypes';
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
  constructor(private parentStorage: Map<string, CacheEntry<string>>, private namespace: string, serializer: SerializerType) {
    super(parentStorage, serializer);
  }

  private getCompoundKey(key: string): string {
    return NamespaceManager.createCompoundKey(this.namespace, key);
  }

  set(key: string, value: V, options?: CacheOptions): void {
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
    for (const compoundKey of this.parentStorage.keys()) {
      if (compoundKey.startsWith(`${this.namespace}:`)) {
        super.delete(compoundKey);
      }
    }
  }

  has(key: string): boolean {
    const compoundKey = this.getCompoundKey(key);
    return super.has(compoundKey);
  }

  size(): number {
    return super.countBy(`${this.namespace}`);
  }
}
