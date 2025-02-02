import { StorageAdapter } from '../common/interfaces';
import { BatchOperations } from './batch-operations';
import { FileOperations } from './file-operations';
import { FunctionalMethods } from './functional-methods';
import { Serialization } from './serialization';
import { SizeCapacity } from './size-capacity';
import { StorageCloner } from './storage-cloner';

export class StorageToolskit<K, V> {
  public readonly batchOperations: BatchOperations<K, V>;
  public readonly functionalMethods: FunctionalMethods<K, V>;
  public readonly serialization: Serialization<K, V>;
  public readonly sizeCapacity: SizeCapacity<K, V>;
  public readonly storageCloner: StorageCloner<K, V>;
  public readonly fileOperations: FileOperations<K, V>;
  constructor(adapter: StorageAdapter<K, V>) {
    this.batchOperations = new BatchOperations(adapter);
    this.functionalMethods = new FunctionalMethods(adapter);
    this.serialization = new Serialization(adapter, this.batchOperations);
    this.fileOperations = new FileOperations(this.serialization);
    this.sizeCapacity = new SizeCapacity(adapter);
    this.storageCloner = new StorageCloner(adapter);
  }
}
