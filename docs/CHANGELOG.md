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

## [1.0.6] - 2025-01-04

### Changes

- **Improved Type Handling**:
  - Added a new `SupportedSerializableTypes` type to manage and categorize all supported serializable types.
  - Refactored the `serialize` method in the `Serializer` class to use a more generalized check for supported types, removing redundant type checks (e.g., `Date`, `ArrayBuffer`, `Buffer`).

### Added

- **`isSupportedSerializableType` method**:
  - Introduced this method to streamline the checking of supported serializable types, enhancing code readability and maintainability.

## [1.1.0] - 2025-01-05

### Removed:

- Removed internal serialization and deserialization handling in Qiks, as outlined in version 1.1.0 specifications.
- Removed the internal event callback structure in favor of a more flexible `CacheItem` storage approach for event handling.
- Removed JSON serialization of cache item values in pattern matching tests.

### Changes:

- **EventManager Refactor**: Now interacts with `ObserverManager` for improved event listener and observer management.
- **Storage Refactor**: Unified the usage of `CacheItem` across components (e.g., events, eviction policies) to ensure a consistent structure for cache data.
  - Updated various components (e.g., event management, eviction policies) for improved type safety and flexibility in storing cache data.
- **General Type Refinements**:
  - Refined type usage across cache, events, and eviction policies, ensuring better consistency and flexibility for key-value types throughout the codebase.
- **Eviction Policies Refactor**:
  - `LRU`, `MRU`, and `LFU` eviction policies have been updated to use the `CacheItem` type for improved management and eviction of cache data.

### Enhancements

- **Improved Test Suite**:
  - Updated test cases for `EventManager`, `Eviction Policies`, and `PatternMatcher` to reflect changes in the data structure and the new `CacheItem` type.
- **Cache Event Management Refactor**:
  - Event listeners now work directly with `CacheItem`, providing more precise management of events in cache operations.
- **Test Coverage Fixes**:
  - Fixed type mismatches and edge cases in test cases, ensuring proper test coverage for all implemented features and fixes.

### Miscellaneous

- **Updated Project Structure**:
  - Refactored project to ensure more coherent and consistent naming across the codebase, especially related to event management, storage, and cache operations.
- **Documentation**:
  - Updated documentation to reflect changes in cache management, event handling, and eviction policies.
  - Detailed the removal of serialization and deserialization features in the project documentation.

## [2.0.0] - 2025-02-05

### Breaking Changes

- **Unified Cache Data Structure**:  
  The internal data model has been unified across components. The cache now uses a single `CacheEntry` type throughout storage, event management, and eviction policies. This change removes previously separated types for user-facing items and internal eviction metadata.
- **Complete Cache Lifecycle Management**
  - Fully implemented cache lifecycle with accurate handling of `Qiks` configurations.
  - Refactored storage adapters to ensure consistent sync execution.
  - Introduced a flexible `ConfigManager` for better configuration management.

---

### Features

- **Lifecycle Management and Configuration**:
  - **Cache Lifecycle Overhaul**: The entire cache lifecycle has been completely refactored and reimplemented, ensuring robust creation, update, expiration, and eviction of cache items.
  - **Type-Safe Configuration Manager**: A new configuration manager enables advanced, type-safe configuration of cache settings including TTL, eviction policies, namespaces, and dependency management.
  - **Unified Cache Store (`Qiks`)**: The main cache store now integrates advanced features such as dependency management, SWR (Stale-While-Revalidate), and configurable eviction policies (LRU, LFU, MRU) into a single, coherent API.
- **Eviction Policies**:
  - **Least Recently Used (LRU)**: Fully implemented LRU eviction to remove the least recently accessed items when capacity is exceeded.
  - **Least Frequently Used (LFU)**: Added LFU eviction to track access frequencies and evict the least used items.
  - **Most Recently Used (MRU)**: Implemented MRU eviction for scenarios that require aggressive removal of fresh data.
  - All eviction strategies now share a common, generic eviction interface, ensuring flexibility and consistent behavior across policies.
- **Cache Events and Monitoring**:

  - **Event System Enhancements**
  - Refactored event system to provide better modularity, scalability, and maintainability.
  - **Event-Driven Architecture**: A complete event system is now in place with support for events like `Set`, `Get`, `Delete`, `Expire`, `Change`, `Update`, `Rebuild`, `Miss`, `Hit`, `Eviction`, `Clear`, `OperationError`, `CriticalFailure`, `StatisticsUpdated`, and a general `Error` event.
  - **Advanced Event Key Handling**: Events now support structured event keys with namespace support, enabling precise event tracking and filtering.
  - **Monitoring Adapter**: A monitoring adapter collects detailed metrics (hits, misses, writes, deletes, evictions, cache size, and total items) to facilitate performance tracking and debugging.

- **Pattern-Based Key Matching**:

  - Implemented a robust `PatternManager` that supports Redis-style patterns using wildcards (`*`, `?`), character classes (e.g., `[abc]`, `[a-z]`), negation (`[^abc]`), and escaped characters.
  - This feature allows users to perform pattern-based queries on keys, mimicking Redis functionality.

- **Dependency Management**:
  - A dedicated dependency manager automatically tracks and invalidates related cache items when a parent item is deleted or expires.
  -
- **Error Handling Improvements**
  - Unified error management with `createException()` factory method.
  - Improved error handling in tools and storage systems.
- **Utilities & Tool Enhancements**
  - Introduced structured **pattern management** for key organization.
  - Added new functional utilities (`batch operations`, `file operations`, `grouping`, `array conversions`).
  - Implemented monitoring and metrics tracking for cache

---

### Enhancements

- **Performance Optimizations**:
  - Extensive benchmarks have been implemented for cache operations (set, get, delete, eviction, mixed operations, and stress tests) with significant improvements observed after warm-up and JIT compilation.
  - Storage adapters (Map and WeakMap) have been optimized for efficient key iteration, lookup, and memory management.
- **Improved Error Handling**:

  - A new custom error hierarchy and factory method streamline error reporting across cache operations.
  - Edge cases and unexpected conditions are now handled more gracefully, with clear error messages and event emission for failures.

- **Code Refactoring and Type-Safety**:
  - Comprehensive refactoring across cache, events, eviction, and storage modules ensures consistent type usage and improved maintainability.
  - Internal APIs have been streamlined to reduce redundancy, and configuration options have been unified into a single, coherent interface.
- **Documentation and Examples**:
  - The documentation has been thoroughly updated to reflect the new lifecycle, event system, and configuration options.
  - Real-world examples, a detailed FAQ, and migration guides have been added to help users transition to v2.

---

### Fixes

- **Eviction Edge Cases**:
  - Resolved bugs in eviction logic when multiple items had similar recency or frequency values.
- **TTL Expiration Accuracy**:
  - Fixed issues where cache entries would expire prematurely due to misconfigured TTL settings.
- **Event System Bugs**:
  - Corrected several issues in event emission and listener management, ensuring that all events are correctly emitted and handled.
- **Namespace and Pattern Matching**:
  - Addressed bugs in namespace key handling and pattern matching to ensure that keys are correctly identified and extracted.
- **General Stability**:
  - Various minor bugs and edge cases in cache operations, dependency management, and metrics tracking have been fixed.
- **Remove Get Method Options**
  - Multiple options about the get method to be removed. Like swr and tranform and etc.

---

### Miscellaneous

- **Project Structure Improvements**:
  - The project structure has been refactored for better modularity, with clear separation between cache, events, eviction, storage, and configuration management.
- **Build and Test Process**:
  - The build process has been refined for efficiency, and the test suite now covers all major functionalities including unit and integration tests.
