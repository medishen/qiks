import { Cache } from '../core/Cache';
import { DependencyManager } from '../core/managers/DependencyManager';
import { CacheError } from '../errors/CacheError';
import { LFU } from '../eviction/LFU';
import { LRU } from '../eviction/LRU';
import { MRU } from '../eviction/MRU';
import { CacheConfig, CacheItem, StorageAdapter } from '../types/CacheTypes';
import { EvictionPolicy } from '../types/EvictionPolicy';
import { WeakStorage } from './WeakStorage';

export function validateOptions<K, V>(options: CacheConfig<K, V>): void {
  if (options.maxSize! <= 0) {
    throw new CacheError('maxSize must be greater than 0');
  }
  if (!['LRU', 'MRU', 'LFU'].includes(options.policy!)) {
    throw new CacheError(`Unsupported eviction policy: ${options.policy}`);
  }
}

export function initializeEvictionPolicy<K, V>(options: CacheConfig<K, V>): EvictionPolicy<K, V> {
  switch (options.policy) {
    case 'LRU':
      return new LRU(options.storage);
    case 'MRU':
      return new MRU(options.storage);
    case 'LFU':
      return new LFU(options.storage as StorageAdapter<K, { value: any; frequency: number }>);
    default:
      throw new CacheError(`Unsupported eviction policy: ${options.policy}`);
  }
}
export function isInternalKey<K>(key: K | string): boolean {
  return typeof key === 'string' && key.startsWith(Cache.INTERNAL_PREFIX);
}
export function validateKey<K>(key: K): void {
  if (!key) {
    throw new CacheError('Key must not be empty');
  }
  if (isInternalKey(key)) {
    throw new CacheError(`Key "${key}" is reserved for internal use.`);
  }
}

export function createStorageAdapter<K, V>(storage: any): StorageAdapter<K, V> {
  if (storage instanceof Map) {
    return {
      type: 'Map',
      set: (key, value) => storage.set(key, value),
      get: (key) => storage.get(key),
      delete: (key) => storage.delete(key),
      has: (key) => storage.has(key),
      size: () => storage.size,
      clear: () => storage.clear(),
      keys: () => storage.keys(),
      entries: () => storage.entries(),
    };
  } else if (storage instanceof WeakMap) {
    type ObjectKey = K & object;
    const weakStorage = new WeakStorage<ObjectKey, V>();

    return {
      type: 'WeakMap',
      set: (key: K & object, value?: V) => weakStorage.set(key, value),
      get: (key: K & object) => weakStorage.get(key),
      delete: (key: K & object) => weakStorage.delete(key),
      has: (key: K & object) => weakStorage.has(key),
      size: () => weakStorage.size(),
      clear: () => weakStorage.clear(),
      keys: () => weakStorage.keys(),
      entries: () => weakStorage.entries(),
    };
  } else if (typeof storage === 'object' && !Array.isArray(storage)) {
    return {
      type: 'Custom',
      set: (key: K & (string | symbol), value: V) => {
        if (typeof key !== 'string' && typeof key !== 'symbol') {
          throw new CacheError('Object keys must be strings or symbols');
        }
        (storage as Record<string | symbol, V>)[key] = value;
      },
      get: (key: K & (string | symbol)) => (storage as Record<string | symbol, V>)[key],
      delete: (key: K & (string | symbol)) => {
        if (typeof key === 'string' || typeof key === 'symbol') {
          delete (storage as Record<string | symbol, V>)[key];
        }
      },
      has: (key: K & (string | symbol)) => {
        if (typeof key === 'string' || typeof key === 'symbol') {
          return key in storage;
        }
        return false;
      },
      size: () => Object.keys(storage).length,
      clear: () => {
        for (const key in storage) {
          delete storage[key];
        }
      },
      keys: () => Object.keys(storage)[Symbol.iterator]() as IterableIterator<K>,
      entries: () => Object.entries(storage)[Symbol.iterator]() as IterableIterator<[K & (string | symbol), V]>,
    };
  } else {
    throw new CacheError('Unsupported storage type');
  }
}

export function isWeak<K, V>(storage: StorageAdapter<K, CacheItem<K, V>>): boolean {
  return storage.type === 'WeakMap';
}
export function expireKeyRecursively<K, V>(opts: { key: K; storage: StorageAdapter<K, CacheItem<K, V>>; dependencyManager: DependencyManager<K, V>; evictionPolicy: EvictionPolicy<K, V> }): void {
  const entry = opts.storage.get(opts.key);
  if (!entry) return;
  if (entry.onExpire) {
    entry.onExpire(opts.key, entry.value);
  }
  const dependents = opts.dependencyManager.getDependents(opts.key);
  if (dependents) {
    for (const dependentKey of dependents) {
      expireKeyRecursively<K, V>({ key: dependentKey, dependencyManager: opts.dependencyManager, evictionPolicy: opts.evictionPolicy, storage: opts.storage });
    }
  }
  opts.dependencyManager.clearDependencies(opts.key);
  opts.evictionPolicy.onRemove(opts.key);
  opts.storage.delete(opts.key);
}
export const __awaiter = `
    function __awaiter(thisArg, _arguments, P, generator) {
      const PromiseConstructor = P || Promise;
      return new PromiseConstructor((resolve, reject) => {
        function fulfilled(value) {
          try { step(generator.next(value)); } 
          catch (e) { reject(e); }
        }
        function rejected(value) {
          try { step(generator.throw(value)); } 
          catch (e) { reject(e); }
        }
        function step(result) {
          result.done
            ? resolve(result.value)
            : new PromiseConstructor((resolve) => resolve(result.value))
                .then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    }
  `;
