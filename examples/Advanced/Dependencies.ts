import { Qiks } from '../../src/index';
// Create a cache instance
const cache = new Qiks<string, any>({ maxSize: 5 });

// Set cache items with dependencies
cache.set('user1', { name: 'Alice', age: 30 });
cache.set('user2', { name: 'Bob', age: 25 });
cache.set('user3', { name: 'Charlie', age: 35 }, { dependsOn: 'user1' });

// Delete the dependent item and check if the dependent key is also deleted
cache.delete('user1');
console.log(cache.get('user3')); // null, because user3 depends on user1
