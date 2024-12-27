### **Qiks Cache System - FAQ and Troubleshooting**

---

**Q1: What is the purpose of the Qiks cache system?**  
**A1:**  
Qiks is a flexible and high-performance caching system designed to store and manage key-value pairs in memory. It supports various eviction policies, Time-To-Live (TTL), custom serialization, and namespaces for organizing data. Qiks is ideal for managing caching in web applications, services, and any other system that requires fast and efficient access to frequently-used data.

---

### **General Questions**

---

**Q2: What is the default eviction policy in Qiks?**  
**A2:**  
The default eviction policy in Qiks is **LRU (Least Recently Used)**. This means that when the cache exceeds its maximum size, the least recently accessed items will be evicted first. You can change the eviction policy to **MRU (Most Recently Used)** or **LFU (Least Frequently Used)** by passing the appropriate configuration option during initialization.

---

**Q3: How do I set a maximum cache size in Qiks?**  
**A3:**  
You can set a maximum cache size using the `maxSize` option when initializing the cache. Once the number of items in the cache exceeds `maxSize`, eviction is triggered according to the eviction policy.

Example:

```typescript
const cache = new Qiks<string, string>({
  maxSize: 200,  // Set max size to 200
  policy: 'LRU',
});
```

---

**Q4: How does the `ttl` (Time-To-Live) work in Qiks?**  
**A4:**  
The `ttl` (Time-To-Live) option allows you to specify how long an item should stay in the cache before it expires. Once an item's TTL expires, it is automatically evicted from the cache.

Example:

```typescript
cache.set('user1', { name: 'John' }, { ttl: 60000 });  // Expires in 1 minute
```

---

**Q5: Can I use custom serialization for cache items?**  
**A5:**  
Yes, you can use a custom serializer and deserializer by passing a `CacheSerializer` object when initializing the cache. This allows you to control how cache items are stored and retrieved.

Example:

```typescript
const customSerializer = {
  serialize: (value: any) => JSON.stringify(value),
  deserialize: (value: string) => JSON.parse(value),
};

const cache = new Qiks<string, string>({ serializer: customSerializer });
```

---

**Q6: How do I handle cache expiration and custom expiration logic?**  
**A6:**  
You can provide a custom expiration function using the `onExpire` option when setting an item in the cache. This function will be called when the item expires or is removed from the cache.

Example:

```typescript
cache.set('user1', { name: 'John' }, {
  ttl: 60000,  // Expires in 1 minute
  onExpire: (key, value) => {
    console.log(`Cache item ${key} expired!`);
  },
});
```

---

### **Eviction and Storage Management**

---

**Q7: What happens when the cache exceeds the maximum size?**  
**A7:**  
When the cache exceeds its maximum size (`maxSize`), the eviction policy you set (e.g., LRU, MRU, LFU) is triggered. The least recently used (or least frequently used, depending on the policy) items are evicted from the cache to make room for new entries.

---

**Q8: How do I change the eviction policy in Qiks?**  
**A8:**  
You can change the eviction policy by passing a different policy when initializing the cache. The available options are:
- `LRU` (Least Recently Used)
- `MRU` (Most Recently Used)
- `LFU` (Least Frequently Used)

Example:

```typescript
const cache = new Qiks<string, string>({
  policy: 'MRU',  // Change to Most Recently Used eviction policy
});
```

---

**Q9: What storage types are supported in Qiks?**  
**A9:**  
Qiks supports several types of storage adapters, including:
- **`Map`**: A standard JavaScript Map for storing key-value pairs.
- **`WeakMap`**: A WeakMap for storing objects as keys (useful for managing object references).
- **`Custom`**: A custom storage implementation that you can define.

Example:

```typescript
const cache = new Qiks<string, string>({
  storage: new Map(),
});
```

---

**Q10: How can I access keys or values in the cache?**  
**A10:**  
You can use the `get()` method to retrieve values or keys from the cache. You can also pass options to filter or transform the results.

Example:

```typescript
const value = cache.get('user1');  // Retrieve value by key
```

You can also retrieve multiple keys or values using options like `keys`, `values`, and `pattern`.

---

### **Advanced Features**

---

**Q11: What are namespaces, and how do they work in Qiks?**  
**A11:**  
Namespaces allow you to organize your cache into separate logical sections. Each namespace has its own storage and can have its own cache settings, including eviction policies. To create and access a namespace, use the `namespace()` method.

Example:

```typescript
const userCache = cache.namespace('users');  // Create a 'users' namespace
userCache.set('user1', { name: 'John Doe' });
```

---

**Q12: How does dependency management work in Qiks?**  
**A12:**  
Qiks supports cache item dependencies, meaning that a cache item can depend on other items. If an item that a cache item depends on is evicted or updated, Qiks automatically manages the eviction or update of the dependent items.

Example:

```typescript
cache.set('user1', { name: 'John Doe' });
cache.set('user1Profile', { profile: 'Admin' }, { dependsOn: 'user1' });
```

In this example, if `user1` is evicted or changed, `user1Profile` will also be affected.

---

**Q13: How do I handle stale data with SWR (Stale-While-Revalidate)?**  
**A13:**  
Qiks supports the **SWR** (Stale-While-Revalidate) strategy for cache entries. This allows you to keep stale data while fetching fresh data in the background. If the data is stale, it triggers a revalidation process that updates the cache once new data is fetched.

To enable SWR for a cache item, use the `swr` option:

```typescript
cache.set('user1', { name: 'John' }, {
  swr: {
    revalidate: async () => {
      const freshData = await fetchUserFromAPI();
      return freshData;
    },
    staleThreshold: 5000,  // Data becomes stale after 5 seconds
  },
});
```

---

### **Troubleshooting**

---

**Q14: My cache size is not being limited as expected. What could be wrong?**  
**A14:**  
Check the following:
- Ensure that you've set the `maxSize` correctly when initializing the cache.
- Ensure the eviction policy is functioning properly (i.e., LRU or other policies are correctly handling the evictions).
- If using a custom storage adapter, verify that it supports size limitations.

---

**Q15: My cache is not evicting expired items. What should I check?**  
**A15:**  
- Ensure that you've set a TTL (`ttl`) when adding items to the cache.
- Verify that your storage type supports expiration handling (e.g., `Map` doesn't support automatic expiration).
- If using a custom `onExpire` function, ensure it's correctly implemented.

---

**Q16: How do I clear all cache items?**  
**A16:**  
You can clear the cache by calling the `clear()` method:

```typescript
cache.clear();
```

This will remove all items from the cache.

---

**Q17: How do I handle errors in Qiks?**  
**A17:**  
Errors in Qiks are usually thrown as instances of `CacheError`. For example, if you attempt to set a cache item with invalid dependencies or try to access a key that does not exist, an error will be thrown.

```typescript
try {
  cache.set('user1', { name: 'John Doe' }, { dependsOn: 'nonexistentKey' });
} catch (error) {
  console.error(error.message);  // "Parent key 'nonexistentKey' does not exist."
}
```
