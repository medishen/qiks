import { ExecutionMode, MethodAdapter, ReturnTypeForMode, StorageAdapter } from '../common';

export abstract class AbstractStorageAdapter<M extends ExecutionMode, K, V> implements StorageAdapter<M, K, V> {
  protected isAsync(): boolean {
    return this.executionMode === 'async';
  }
  constructor(public executionMode: ExecutionMode, public storage: any) {}
  set: MethodAdapter<M, (key: K, value: V) => void> = (key, value) => {
    if (this.isAsync()) {
      return new Promise<void>((resolve) => {
        this.storage.set(key, value);
        resolve();
      }) as ReturnTypeForMode<M, void>;
    } else {
      this.storage.set(key, value);
      return undefined as ReturnTypeForMode<M, void>;
    }
  };

  get: MethodAdapter<M, (key: K) => V | undefined> = (key) => {
    if (this.isAsync()) {
      return new Promise<V | undefined>((resolve) => {
        resolve(this.storage.get(key));
      });
    } else {
      return this.storage.get(key);
    }
  };

  delete: MethodAdapter<M, (key: K) => void> = (key) => {
    if (this.isAsync()) {
      return new Promise<void>((resolve) => {
        this.storage.delete(key);
        resolve();
      }) as ReturnTypeForMode<M, void>;
    } else {
      this.storage.delete(key);
      return undefined as ReturnTypeForMode<M, void>;
    }
  };

  has: MethodAdapter<M, (key: K) => boolean> = (key) => {
    if (this.isAsync()) {
      return new Promise<boolean>((resolve) => {
        resolve(this.storage.has(key));
      });
    } else {
      return this.storage.has(key);
    }
  };
  keys: MethodAdapter<M, () => IterableIterator<K>> = () => {
    if (this.isAsync()) {
      return new Promise<IterableIterator<K>>((resolve) => {
        resolve(this.storage.keys());
      });
    } else {
      return this.storage.keys();
    }
  };

  entries: MethodAdapter<M, () => IterableIterator<[K, V]>> = () => {
    if (this.isAsync()) {
      return new Promise<IterableIterator<[K, V]>>((resolve) => {
        resolve(this.storage.entries());
      });
    } else {
      return this.storage.entries();
    }
  };

  clear: MethodAdapter<M, () => void> = () => {
    if (this.isAsync()) {
      return new Promise<void>((resolve) => {
        this.storage.clear();
        resolve();
      }) as ReturnTypeForMode<M, void>;
    } else {
      this.storage.clear();
      return undefined as ReturnTypeForMode<M, void>;
    }
  };

  size: MethodAdapter<M, () => number> = () => {
    if (this.isAsync()) {
      return new Promise<number>((resolve) => {
        resolve(this.storage.size);
      });
    } else {
      return this.storage.size;
    }
  };

  values: MethodAdapter<M, () => IterableIterator<V>> = () => {
    if (this.isAsync()) {
      return new Promise<IterableIterator<V>>((resolve) => {
        resolve(this.storage.values());
      });
    } else {
      return this.storage.values();
    }
  };

  forEach: MethodAdapter<M, (callback: (value: V, key: K, storage: StorageAdapter<M, K, V>) => void) => void> = (callback) => {
    if (this.isAsync()) {
      return new Promise<void>((resolve) => {
        this.storage.forEach((value: V, key: K) => {
          callback(value, key, this);
        });
        resolve();
      }) as ReturnTypeForMode<M, void>;
    } else {
      this.storage.forEach((value: V, key: K) => {
        callback(value, key, this);
      });
      return undefined as ReturnTypeForMode<M, void>;
    }
  };
}
