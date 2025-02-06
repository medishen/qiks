import { EventType, Qiks } from '../../dist';

const cache = new Qiks<string, any>({
  maxSize: 3,
});

// Set up event listeners for cache operations
cache.on(EventType.Expire, ({ entry, key, type }) => {
  console.log(`Set: ${key} =>`, entry?.value);
});
cache.on(EventType.Get, ({ key, type, entry }) => {
  console.log(`Get: ${key} =>`, entry?.value);
});
cache.on(EventType.Delete, ({ key, type, entry }) => {
  console.log(`Delete: ${key} =>`, entry?.value);
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
