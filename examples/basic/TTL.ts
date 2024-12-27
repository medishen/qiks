import { Qiks } from "../../src";

const cache = new Qiks<string, any>({ maxSize: 3 });

// Set cache items with TTL (Time-To-Live)
cache.set('session1', { token: 'abc123' }, { ttl: 3000 }); // 3 seconds TTL
cache.set('session2', { token: 'xyz789' }, { ttl: 5000 }); // 5 seconds TTL

// Wait for TTL to expire and check cache
setTimeout(() => {
  console.log(cache.get('session1')); // Should be null after 3 seconds
  console.log(cache.get('session2')); // Should still be available after 3 seconds
}, 3500);
