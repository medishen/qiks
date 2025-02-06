import { CacheStorageAdapter } from '../common';
import { BatchOps } from './batch-operations';
import { FileOps } from './file-operations';
import { Functional } from './functional-methods';
import { Serialization } from './serialization';
import { Cloner } from './storage-cloner';
/**
 * @publicApi
 *
 * CacheTools: A Comprehensive Utility Suite for Advanced Cache Management
 *
 * The `CacheTools` class provides a powerful set of utilities designed to simplify and enhance cache operations,
 */
export class CacheTools<K, V> {
  public readonly batchOps: BatchOps<K, V>;
  public readonly functional: Functional<K, V>;
  public readonly serialization: Serialization<K, V>;
  public readonly cloner: Cloner<K, V>;
  public readonly fileOps: FileOps<K, V>;
  constructor(adapter: CacheStorageAdapter<K, V>) {
    this.batchOps = new BatchOps(adapter);
    this.functional = new Functional(adapter);
    this.serialization = new Serialization(adapter, this.batchOps);
    this.fileOps = new FileOps(this.serialization);
    this.cloner = new Cloner(adapter);
  }
}
