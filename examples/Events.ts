import { EventType, Qiks } from '../dist';

// Create a cache instance
const cache = new Qiks<string, any>({ maxSize: 5 });

// Set up event listeners for cache operations
cache.on(EventType.Set, (params) => {
  console.log(`Cache Set: ${params.key} =>`, params.entry.value);
});

cache.on(EventType.Get, (params) => {
  console.log(`Cache Get: ${params.key} =>`, params.entry?.value);
});

cache.on(EventType.Delete, (params) => {
  console.log(`Cache Delete: ${params.key} =>`, params.entry.value);
});

// Set some values in the cache
cache.set('user1', { name: 'Alice', age: 30 });
cache.set('user2', { name: 'Bob', age: 25 });

// Get some values from the cache
cache.get('user1'); // This triggers the 'get' event

// Delete an item from the cache
cache.delete('user1'); // This triggers the 'delete' event
