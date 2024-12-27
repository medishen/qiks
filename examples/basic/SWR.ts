import { Qiks } from '../../src/index';

const cache = new Qiks<string, any>({ maxSize: 3 });

// Set an item with SWR policy for revalidation
cache.set(
  'weather',
  { temperature: 72, condition: 'sunny' },
  {
    swr: {
      staleThreshold: 3000, // Stale after 3 seconds
      revalidate: async () => {
        // Simulating fetching fresh data from an external API
        console.log('Revalidating...');
        return { temperature: 75, condition: 'partly cloudy' }; // Fresh data
      },
    },
  },
);

// Get the initial data
const weather = cache.get('weather');
console.log(weather); // { temperature: 72, condition: 'sunny' }

// Wait for the data to become stale and trigger revalidation
setTimeout(async () => {
  const updatedWeather = await cache.get('weather');
  console.log(JSON.parse(updatedWeather)); // { temperature: 75, condition: 'partly cloudy' }
}, 4000);
