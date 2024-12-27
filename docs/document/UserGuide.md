### **Qiks Cache System - User Guide**

---

**Introduction**  
Qiks is a high-performance, flexible caching system designed for various applications. It supports multiple cache management strategies, including eviction policies, TTL (Time-To-Live), and custom serialization, with the ability to define namespaces for organizing cache data. It can be extended with additional features like event handling, key observation, and dependency management, making it ideal for complex caching scenarios.

---

### **Features Overview**

1. **Cache Configuration**
2. **Basic Cache Operations**
   - `set()`
   - `get()`
   - `delete()`
   - `clear()`
3. **Eviction Policies**
4. **TTL Management**
5. **Dependency Management**
6. **Event Handling**
7. **Key Observation**
8. **Namespaces**
9. **Serialization and Deserialization**
10. **Size and Count Management**

---

### **1. Cache Configuration**

Qiks allows you to configure the cache with multiple customizable options:
- **`maxSize`**: Maximum number of cache entries before eviction is triggered.
- **`policy`**: Eviction policy (e.g., `LRU` - Least Recently Used).
- **`serializer`**: A custom serializer for serializing and deserializing cache data.
- **`storage`**: A custom storage adapter for storing cache items (e.g., `Map`, `WeakMap`).

Example:

```typescript
const cache = new Qiks<string, string>({
  maxSize: 200,
  policy: 'LRU',
  serializer: CustomSerializer,
  storage: new Map(),
});
```

---

### **2. Basic Cache Operations**

#### **`set(key, value, options?)`**

- Adds a value to the cache.
- **`key`**: The unique identifier for the cached data.
- **`value`**: The data to store in the cache.
- **`options`**: Optional configurations (e.g., `ttl`, `priority`, `onExpire`, `dependsOn`).

Example:

```typescript
cache.set('user1', { name: 'John Doe' }, { ttl: 300, priority: 1 });
```

#### **`get(key, options?)`**

- Retrieves a cached value by its key.
- Supports additional options like pattern matching and filtering.

Example:

```typescript
const user = cache.get('user1');
```

#### **`delete(key)`**

- Deletes a cache item by its key.

Example:

```typescript
cache.delete('user1');
```

#### **`clear()`**

- Clears all cached data in the cache.

Example:

```typescript
cache.clear();
```

---

### **3. Eviction Policies**

Qiks supports various eviction policies, including:
- **LRU (Least Recently Used)**: Removes the least recently accessed cache items when the cache reaches its maximum size.

The policy is automatically applied when the cache exceeds the `maxSize` limit.

Example:

```typescript
const cache = new Qiks<string, string>({ maxSize: 100, policy: 'LRU' });
```

---

### **4. TTL Management**

Qiks supports **Time-To-Live (TTL)** for cache items. When a cache item expires, it is automatically evicted.

- **`ttl`**: The time (in milliseconds) after which a cache item expires.

Example:

```typescript
cache.set('user2', { name: 'Jane Doe' }, { ttl: 5000 });
```

---

### **5. Dependency Management**

Qiks supports dependency management, where a cache item can depend on another. If the dependent key is modified or deleted, Qiks will automatically handle the eviction of the dependent items.

Example:

```typescript
cache.set('parentKey', { data: 'value' });
cache.set('childKey', { data: 'value' }, { dependsOn: 'parentKey' });
```

---

### **6. Event Handling**

Qiks provides an event system for subscribing to cache changes. You can listen for events like `set`, `get`, `delete`, and `expire`.

- **`on(event, callback)`**: Subscribe to an event.
- **`off(event, callback)`**: Unsubscribe from an event.

Example:

```typescript
cache.on('set', (key, value) => {
  console.log(`Cache set: ${key} = ${value}`);
});
```

---

### **7. Key Observation**

You can observe individual cache keys for changes. When the value associated with a key changes, the observer callback will be triggered.

- **`observeKey(key, callback)`**: Adds an observer for a specific key.
- **`unobserveKey(key, callback)`**: Removes an observer for a specific key.

Example:

```typescript
cache.observeKey('user1', (key, value) => {
  console.log(`Observed key ${key} with value ${value}`);
});
```

---

### **8. Namespaces**

Namespaces allow you to organize your cache into different logical sections. Each namespace can have its own configuration and eviction policies.

#### **`namespace(namespace)`**

Creates a namespace in the cache for better organization.

Example:

```typescript
const userCache = cache.namespace('users');
userCache.set('user1', { name: 'John Doe' });
```

---

### **9. Serialization and Deserialization**

Qiks uses a serializer and deserializer to handle the storage and retrieval of cache data. You can use a custom serializer by passing it during cache initialization.

- **`serializer.serialize(value)`**: Serializes a value before storing it in the cache.
- **`serializer.deserialize(value)`**: Deserializes a value when retrieving it from the cache.

Example:

```typescript
const customSerializer = {
  serialize: (value) => JSON.stringify(value),
  deserialize: (value) => JSON.parse(value),
};

const cache = new Qiks<string, string>({ serializer: customSerializer });
```

---

### **10. Size and Count Management**

Qiks provides methods for querying the cache size:
- **`size()`**: Returns the number of items in the cache.
- **`countBy(prefix?)`**: Returns the number of items in the cache with a specific prefix.

Example:

```typescript
console.log(cache.size()); // Total cache size
console.log(cache.countBy('user')); // Count of cache items with 'user' prefix
```

---

### **Conclusion**

Qiks is a robust and flexible cache system that provides powerful features for managing your cache data. With eviction policies, TTL management, event handling, and key observation, Qiks is suitable for a wide range of use cases, from simple caching to complex data management scenarios in modern applications.

For further information or to contribute to the project, please refer to the [GitHub repository](https://github.com/example/).