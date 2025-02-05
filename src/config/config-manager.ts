import { CacheEntry, CacheErrorCodes, EvictionPolicyType, EvictionStrategy, StorageAdapter } from '../common';
import { CacheConfig } from '../common/interfaces';
import { CacheExceptionFactory } from '../errors';
import { LFUEvictionPolicy, MRUEvictionPolicy } from '../eviction';
import { LRUEvictionPolicy } from '../eviction/lru.eviction';
import { MapStorageAdapter, WeakMapStorageAdapter } from '../storage';

export class ConfigManager<K, V> {
  private config: CacheConfig<K, V>;

  constructor(initialConfig?: Partial<CacheConfig<K, V>>) {
    this.config = {
      // Defaults
      maxSize: initialConfig?.maxSize ?? 1000,
      evictionPolicy: initialConfig?.evictionPolicy ?? 'LRU',
      storage: initialConfig?.storage ?? 'map',
      adapter: initialConfig?.adapter ?? undefined,
    };

    this.validateConfig();
  }

  /**
   * Returns the current cache configuration as a read-only object.
   */
  getConfig(): Readonly<CacheConfig<K, V>> {
    return this.config;
  }

  /**
   * Updates the cache configuration with new values while keeping existing ones.
   * @param newConfig Partial configuration updates.
   */
  updateConfig(newConfig: Partial<CacheConfig<K, V>>): void {
    Object.entries(newConfig).forEach(([key, value]) => {
      if (value !== undefined) {
        (this.config as any)[key] = value;
      }
    });

    this.validateConfig();
  }

  /**
   * Validates the entire configuration.
   */
  private validateConfig(): void {
    this.validatePositiveNumber(this.config.maxSize!, 'maxSize');
    this.validateEvictionPolicy(this.config.evictionPolicy!);
    this.validateStorageAdapter();
  }

  /**
   * Ensures that numeric values like `maxSize` are positive integers.
   */
  private validatePositiveNumber(value: number, key: string): void {
    if (!Number.isSafeInteger(value) || value <= 0) {
      throw CacheExceptionFactory.createException(CacheErrorCodes.INVALID_OPERATION, `Invalid ${key}: ${value}. Must be a positive integer.`, { key, value });
    }
  }

  /**
   * Ensures that the eviction policy is a valid predefined type.
   */
  private validateEvictionPolicy(value: EvictionPolicyType): void {
    const validPolicies: EvictionPolicyType[] = ['LRU', 'MRU', 'LFU'];
    if (!validPolicies.includes(value)) {
      throw CacheExceptionFactory.createException(CacheErrorCodes.INVALID_OPERATION, `Invalid evictionPolicy: ${value}. Must be one of ${validPolicies.join(', ')}.`, {
        evictionPolicy: value,
        validPolicies,
      });
    }
  }

  /**
   * Ensures that a custom storage adapter is provided if `storage` is set to `custom`.
   */
  private validateStorageAdapter(): void {
    if (this.config.storage === 'custom' && !this.config.adapter) {
      throw CacheExceptionFactory.createException(CacheErrorCodes.INVALID_OPERATION, 'Custom storage adapter must be provided if storage is set to "custom".', {
        storage: this.config.storage,
      });
    }
  }

  /**
   * Get the appropriate storage adapter based on the selected config
   * Apply constraint K extends object for WeakMapStorageAdapter
   */
  getStorageAdapter(): StorageAdapter<any, CacheEntry<K, V>> {
    if (this.config.storage === 'map') {
      return new MapStorageAdapter<K, CacheEntry<K, V>>();
    }

    if (this.config.storage === 'weakmap') {
      return new WeakMapStorageAdapter<any, CacheEntry<K, V>>();
    }

    if (this.config.storage === 'custom' && this.config.adapter) {
      return this.config.adapter;
    }

    throw CacheExceptionFactory.createException(CacheErrorCodes.INVALID_OPERATION, 'Unable to resolve storage adapter.', { storage: this.config.storage });
  }
  getDriver(): EvictionStrategy<K, V> {
    const storage = this.getStorageAdapter();
    switch (this.config.evictionPolicy) {
      case 'LFU':
        return new LFUEvictionPolicy<K, V>(storage, { capacity: this.config.maxSize! });
      case 'LRU':
        return new LRUEvictionPolicy<K, V>(storage, { capacity: this.config.maxSize! });
      case 'MRU':
        return new MRUEvictionPolicy<K, V>(storage, { capacity: this.config.maxSize! });
      default:
        throw CacheExceptionFactory.createException(CacheErrorCodes.INVALID_OPERATION, `Unsupported eviction policy: ${this.config.evictionPolicy}`, { evictionPolicy: this.config.evictionPolicy });
    }
  }
}
