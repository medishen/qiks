# TODO.md

## Project Name: QIKS

**Goal:** Build a comprehensive, high-performance caching library in TypeScript with advanced features for versatile use in real-world applications.

### **Project Structure**

1. **Setup and Initialization**

   - [x] Initialize TypeScript project.
   - [x] Set up project directory structure:
   - [x] Configure `tsconfig.json` for optimal TypeScript development.
   - [x] Create README.md with basic project description and usage.

2. **Core Infrastructure**
   - [x] Design a `Cache` class with:
   - [x] Implement in-memory storage with basic CRUD operations.
   - [x] Write unit tests for all core operations.

### **Feature Development**

#### Phase 1: Basic Features

1. **Basic In-Memory Caching**

   - [x] Implement simple in-memory cache with hash map storage.
   - [x] Add unit tests for basic operations.

2. **TTL (Time-to-Live) Support**

   - [x] Add TTL expiration logic to cached items.
   - [x] Write tests to validate expiration functionality.

3. **Serialization**

   - [x] Support JSON serialization and deserialization for cached items.
   - [x] Add option to plug in custom serializers.

4. **Namespaces**

   - [x] Implement namespaces to isolate caches.
   - [x] Write tests for namespace isolation and operations.

5. **Cache Events**
   - [x] Emit events for `set`, `get`, `delete`, and `expire` actions.
   - [x] Write tests to ensure events are emitted correctly.

#### Phase 2: Intermediate Features

6. **Customizable Eviction Policies**

   - [x] Implement LRU, LFU, and MRU policies.
   - [x] Write tests for eviction policies with varying `maxSize`.

7. **Cache Dependency Management**

   - [x] Allow items to depend on other keys.
   - [x] Automatically delete dependent keys when the parent is deleted.
   - [x] Write tests for dependency chains.

8. **Expiration Callbacks**

   - [x] Add support for callbacks triggered on item expiration.
   - [x] Test callback execution under various scenarios.

9. **Key Observers**
   - [x] Allow observing changes to specific keys.
   - [x] Test observer callbacks for correctness.

#### Phase 3: Advanced Features

10. **Pattern-Based Preloading**

    - [x] Implement key preloading with pattern matching (e.g., `"user:*"`).
    - [x] Write tests to ensure preloading works as expected.

11. **Stale-While-Revalidate**

    - [x] Serve stale data while fetching fresh data in the background.
    - [x] Test revalidation logic under concurrent requests.

12. **Priority-Based Caching**

    - [x] Add priority levels to cached items.
    - [x] Test priority handling under eviction scenarios.

### **Documentation**

1. **User Guide**

   - [x] Write detailed documentation for all features.

2. **Examples**

   - [x] Add real-world use cases in the `examples/` directory.

3. **FAQ and Troubleshooting**
   - [x] Create a FAQ section addressing common issues.

**Contact Information**

- **Email:** bitsgenix@gmail.com
- **GitHub:** [https://github.com/medishen/qiks.git](https://github.com/medishen/qiks.git)