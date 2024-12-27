import { Qiks } from '../src';

// Create a cache instance
const cache = new Qiks<string, any>({ maxSize: 5 });

// Set up event listeners for cache operations
cache.on('set', (key, value) => {
  console.log(`Cache Set: ${key} =>`, value);
});

cache.on('get', (key, value) => {
  console.log(`Cache Get: ${key} =>`, value);
});

cache.on('delete', (key, value) => {
  console.log(`Cache Delete: ${key} =>`, value);
});

// Set some values in the cache
cache.set('user1', { name: 'Alice', age: 30 });
cache.set('user2', { name: 'Bob', age: 25 });

// Get some values from the cache
cache.get('user1'); // This triggers the 'get' event

// Delete an item from the cache
cache.delete('user1'); // This triggers the 'delete' event
