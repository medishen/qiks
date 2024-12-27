import { Qiks } from '../src';

// Create a cache instance
const cache = new Qiks<string, any>({ maxSize: 5 });

// Create a namespace to isolate cache for 'users' data
const userCache = cache.namespace('users');

// Set data in the 'users' namespace
userCache.set('user1', { name: 'Alice', age: 30 });
userCache.set('user2', { name: 'Bob', age: 25 });

// Get data from the 'users' namespace
const user1 = userCache.get('user1');
console.log(user1); // { name: 'Alice', age: 30 }

// Create a namespace for 'products' data
const productCache = cache.namespace('products');

// Set data in the 'products' namespace
productCache.set('product1', { name: 'Laptop', price: 1000 });
productCache.set('product2', { name: 'Smartphone', price: 500 });

// Get data from the 'products' namespace
const product1 = productCache.get('product1');
console.log(product1); // { name: 'Laptop', price: 1000 }
