import { AbstractStorageAdapter } from './base-storage';
export class MapStorageAdapter<K, V> extends AbstractStorageAdapter<'sync', K, V> {
  constructor() {
    super('sync', new Map());
  }
}
export class AsyncMapStorageAdapter<K, V> extends AbstractStorageAdapter<'async', K, V> {
  constructor() {
    super('async', new Map());
  }
}
