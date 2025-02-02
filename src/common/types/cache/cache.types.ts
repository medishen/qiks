// export type ObserverCallback<K, V> = EventCallback<K, V>;
// export type CacheStorage<K> = Map<K, CacheItem<K, string>> | WeakMap<object, CacheItem<K, string>>;
export type ExecutionMode = 'sync' | 'async' | 'lazy' | 'batch';
export type ReturnTypeForMode<M extends ExecutionMode, T> = M extends 'async' ? Promise<T> : T;

export type MethodAdapter<M extends ExecutionMode, F extends (...args: any[]) => any> = (...args: Parameters<F>) => ReturnTypeForMode<M, ReturnType<F>>;
