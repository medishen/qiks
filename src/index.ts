import { Serializer } from './core/Serializer';
import { Cache } from './core/Cache';
import { CacheEntry, SerializerType } from './types/CacheTypes';
import { NamespaceCache } from './core/NamespaceManager';
export class Qiks<K, V> extends Cache<string, V> {
  constructor(protected serializer: SerializerType = Serializer) {
    super(new Map<string, CacheEntry<string>>(), serializer);
  }
  namespace(namespace: string): NamespaceCache<string, V> {
    return new NamespaceCache<string, V>(this.storage, namespace, this.serializer);
  }
}
const cache = new Qiks<string, object>();

// Create namespaces
const userCache = cache.namespace('users');
const productCache = cache.namespace('products');

// Set and get within namespaces
userCache.set('123', { name: 'Alice' });
console.log(userCache.get('123')); // { name: 'Alice' }

productCache.set('123', { name: 'Laptop' });
console.log(productCache.get('123')); // { name: 'Laptop' }
userCache.set('1234', { name: 'Alice' });

// Check namespace isolation
console.log(userCache.get('123')); // { name: 'Alice' }
console.log(productCache.get('123')); // { name: 'Laptop' }
console.log('userCache:size', userCache.size());
console.log('productCache:size', productCache.size());

// Clear namespaces
userCache.clear();
console.log(userCache.get('123')); // null
console.log(productCache.get('123')); // { name: 'Laptop' }
console.log('userCache:size', userCache.size());
