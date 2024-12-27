import { Qiks } from '../../src';

const cache = new Qiks<string, any>({
  maxSize: 3,
  policy: 'LRU', // Least Recently Used policy
  serializer: {
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  },
});

// Set up event listeners for cache operations
cache.on('set', (key, value) => {
  console.log(`Set: ${key} =>`, value);
});
cache.on('get', (key, value) => {
  console.log(`Get: ${key} =>`, value);
});
cache.on('delete', (key, value) => {
  console.log(`Delete: ${key} =>`, value);
});

// Create some cache items with different policies
cache.set('user1', { name: 'Alice', age: 30 }, { ttl: 1000 });
cache.set('user2', { name: 'Bob', age: 25 }, { ttl: 7000 });
cache.set('session', { token: 'xyz789' });

// Access and manipulate cache data
setTimeout(() => {
  // User1 has expired, user2 and session remain
  console.log('user1:->', cache.get('user1')); // null (TTL expired)
  console.log('user2:->', cache.get('user2')); // { name: 'Bob', age: 25 }
}, 6000);

// Accessing and setting data
cache.set('user3', { name: 'Charlie', age: 40 });
console.log(cache.get('user3')); // { name: 'Charlie', age: 40 }

// Manually evicting cache
cache.delete('session');
console.log(cache.get('session')); // null
