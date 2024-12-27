import { Qiks } from '../../src';
const cache = new Qiks<string, any>({ maxSize: 1 });
// Set some values in the cache
cache.set('user1', { name: 'Alice', age: 30 });
cache.set('user2', { name: 'Bob', age: 25 });

// Get values from the cache
const user1 = cache.get('user1');
console.log(user1); // null
// Try getting the deleted value
const deletedUser = cache.get('user2');
console.log(deletedUser); // { name: 'Bob', age: 25 }
