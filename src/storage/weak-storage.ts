import { AbstractStorageAdapter } from './base-storage';

export class WeakMapStorageAdapter<K extends object, V> extends AbstractStorageAdapter<'sync', K, V> {
  constructor() {
    super('sync', new WeakMap());
  }
}

export class AsyncWeakMapStorageAdapter<K extends object, V> extends AbstractStorageAdapter<'async', K, V> {
  constructor() {
    super('async', new WeakMap());
  }
}
