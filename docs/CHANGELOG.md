# Changelog

## [1.0.0] - 2024-12-27

### Features

- **Basic In-Memory Caching**:  
  Introduced a simple in-memory cache utilizing a hash map for efficient data storage and retrieval.
- **TTL (Time-to-Live) Support**:  
  Added TTL support for cache items, ensuring items automatically expire after a specified duration.

- **Serialization Support**:  
  Enabled JSON serialization and deserialization of cached items. Also added the option to plug in custom serializers for advanced use cases.

- **Namespaces**:  
  Implemented namespaces to allow the isolation of cache segments for different logical areas, enhancing modularity.

- **Cache Events**:  
  Added event emitters for key cache operations, including `set`, `get`, `delete`, and `expire`. This feature enables external monitoring of cache state changes.

- **Customizable Eviction Policies**:  
  Implemented eviction strategies including **Least Recently Used (LRU)**, **Least Frequently Used (LFU)**, and **Most Recently Used (MRU)** policies for cache item management.

- **Cache Dependency Management**:  
  Enabled cache items to depend on other keys, allowing automatic removal of dependent keys when the parent is deleted.

- **Expiration Callbacks**:  
  Supported expiration callbacks, allowing custom logic to be executed when cache items expire.

- **Key Observers**:  
  Introduced key observers to monitor and respond to changes in specific cache keys.

- **Pattern-Based Preloading**:  
  Added pattern-based key preloading, which allows users to preload cache entries that match a specific pattern (e.g., `"user:*"`).

- **Stale-While-Revalidate (SWR) Strategy**:  
  Implemented the SWR strategy, where stale data is served while fresh data is being fetched in the background.

- **Priority-Based Caching**:  
  Introduced a priority system for cache items, allowing higher-priority items to be retained longer during eviction.

### Enhancements

- **Eviction Policy Enhancements**:  
  Eviction policies now consider both frequency/recency and item priority, improving eviction decisions and cache management in complex use cases.

- **Improved Cache Expiration Logic**:  
  Refined cache item expiration and TTL handling for better accuracy and performance under load.

- **Performance Benchmarking**:  
  Added performance benchmarks for key cache operations (set, get, delete, eviction), enabling performance tracking and optimizations.

- **Documentation Updates**:
  - **User Guide**: Detailed documentation for all features and configuration options.
  - **Examples**: Added real-world use cases and practical examples to the `examples/` directory.
  - **FAQ**: Created an FAQ section addressing common issues and troubleshooting steps.

### Fixes

- Fixed various edge cases in eviction policies when multiple items have similar usage patterns (frequency, recency, or priority).
- Corrected minor bugs in TTL expiration logic where items would sometimes expire prematurely.
- Improved error handling for cache operations with invalid inputs or configuration.

### Miscellaneous

- **API Documentation**: Updated the README with basic usage examples, API documentation, and an overview of the cache's core features.
- **TODO.md**: Updated with completed tasks and a list of potential future enhancements.

## [1.0.1] - 2024-12-28

### Fixed

- Corrected `package.json` to classify dependencies under `devDependencies` where appropriate.

## [1.0.2] - 2025-01-02

### Enhancements

- **Cache `delete` Method Update**:  
  The `delete` method in the `Cache` class now returns a boolean indicating whether the deletion was successful, instead of simply performing the action without feedback.
- **Namespace Key Handling Improvements**:  
  The `NamespaceManager.createCompoundKey` method was updated to accept generic key types, improving type flexibility for different key structures in namespaces. This change extends to other methods handling keys in `NamespaceCache`.

- **Generalization of Key Types**:  
  The `Qiks` and `NamespaceCache` classes now support generic key types (`K`) rather than being restricted to strings, enabling better flexibility and type safety in caching operations.

- **Refined Cache Item Management**:  
  `NamespaceCache` methods such as `get`, `set`, `delete`, and `has` now accept generic key types (`K`), allowing for more specific key management in the namespace context.

### Fixes

- **Improved Key Validation in `NamespaceCache`**:  
  Fixed an issue where non-string keys could lead to unexpected behavior in the namespace cache system. The cache now properly handles and validates keys of any type.

- **Mocha Test Suite Adjustment**:  
  The test suite was adjusted to run integration tests instead of e2e tests by default, aligning with the intended testing approach for this version.

### Miscellaneous

- **Build Process Refinement**:  
  Simplified the build script by removing unnecessary cleanup commands, optimizing the build process for better efficiency.

## [1.0.3] - 2025-01-02

### Enhancements

- **Cache Event System Improvements**:

  - Added support for custom cache event types by updating the `CacheEventType` type definition to include string literals. This allows users to define and listen to their own custom events.
  - Introduced an `emit` method in the `Cache` class, enabling direct emission of cache events with associated key-value pairs.

- **Serializer Enhancements**:

  - Expanded serialization capabilities with support for additional complex data types, including `Date`, `RegExp`, `Function`, `Map`, `Set`, `Buffer`, `Error`, `Promise`, and `ArrayBuffer`.
  - Implemented handlers for these types with proper `serialize` and `deserialize` methods, allowing for seamless storage and retrieval of diverse data structures.
  - Enhanced the `serialize` and `deserialize` methods to automatically recognize and process objects based on their constructors, improving type safety and flexibility.

- **Documentation Updates**:
  - Clarified cache event descriptions in the README, specifying the possibility of custom event types.

## [1.0.4] - 2025-01-02

### Fixes

- fix type internal property references in Serializer class

## [1.0.5] - 2025-01-04

### Fixed
- **Serialization Enhancements**: Improved the `Serializer` class to handle various complex data types more robustly:
  - **Objects**: Added support for serializing and deserializing nested objects while preserving their structure.
  - **ArrayBuffer**: Corrected deserialization to properly reconstruct `ArrayBuffer` from serialized data.

### Added
- Introduced a marker (`__SERIALIZED__`) to prevent duplicate serialization of already processed data.

### Notes
- These changes improve the reliability of the `Serializer` class, ensuring accurate handling of complex and nested data structures across serialization and deserialization operations.
