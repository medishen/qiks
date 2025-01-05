# QIKS

A high-performance, feature-rich caching library in TypeScript designed for versatility and real-world applications.

---

## Table of Contents

- [QIKS](#qiks)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
    - [Why QIKS?](#why-qiks)
  - [Features](#features)
    - [Core Features](#core-features)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Basic Usage Example](#basic-usage-example)
  - [API Documentation](#api-documentation)
  - [Contributing](#contributing)
    - [Reporting Bugs](#reporting-bugs)
  - [License](#license)
  - [Contact](#contact)

## Introduction

Caching plays a key role in modern web applications, improving performance, reducing latency, and optimizing resource usage. **QIKS** is a lightweight, TypeScript-based caching library built for developers who need powerful and customizable caching solutions.

### Why QIKS?

- **Lightweight & Fast**: Designed with performance in mind, perfect for high-demand environments.
- **Highly Configurable**: Flexible eviction policies, TTL support, cache namespaces, and more.
- **Advanced Features**: Event-driven system, dependency management.
- **TypeScript Support**: Fully typed, ensuring better developer experience and fewer errors.

## Features

### Core Features

- **In-Memory Caching**: Efficient and fast in-memory key-value storage.
- **TTL (Time-To-Live)**: Automatically expires items based on the configured TTL.
- **Namespaces**: Create isolated cache domains for different parts of your application.
- **Cache Events**: Listen to cache events (set, get, delete, expire, or custom event).
- **Eviction Policies**: Supports LRU (Least Recently Used), LFU (Least Frequently Used), MRU (Most Recently Used)
- **Cache Dependency Management**: Automatically handle key dependencies when other keys are modified or evicted.
- **Expiration Callbacks**: Execute custom logic when items expire.
- **Key Observers**: Track changes to specific cache keys.
- **Pattern-Based Preloading**: Preload cache keys based on patterns, useful for bulk cache loading.

## Installation

Install the package using npm:

```bash
npm install @medishn/qiks
```

## Usage

### Basic Usage Example

```typescript
import { Qiks } from '@medishn/qiks';

// Create a cache instance with a 5-second TTL for each item
const cache = new Qiks<string, string>({
  maxSize: 100, // Limit cache size to 100 items
  policy: 'LRU', // Use Least Recently Used eviction policy
});

cache.set('user1', 'John Doe', { ttl: 5000 }); // Set a value with TTL of 5 seconds

// Retrieve the value
const user = cache.get('user1');
console.log(user); // Output: John Doe

// After 5 seconds, the cache item will be automatically expired
setTimeout(() => {
  const expiredUser = cache.get('user1');
  console.log(expiredUser); // Output: undefined (since the item expired)
}, 6000);
```

## API Documentation

For complete API documentation and usage details, refer to the [API Reference](./docs/document/).

## Contributing

We welcome contributions to improve QIKS! Please follow the [Contributing Guidelines](./docs/CONTRIBUTING.md) to ensure consistency and quality.

### Reporting Bugs

If you encounter any issues or bugs, please create a detailed issue on our [GitHub Repository](https://github.com/medishen/qiks/issues) with the following information:

- Steps to reproduce the issue
- Expected vs actual behavior
- Relevant error messages (if any)

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more details.

## Contact

For questions, suggestions, or support, feel free to email us at [bitsgenix@gmail.com](mailto:bitsgenix@gmail.com).
