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
  - [Contributing](#contributing)
    - [Reporting Bugs](#reporting-bugs)
  - [License](#license)
  - [Contact](#contact)

## Introduction

Caching is a critical part of modern applications, improving performance, reducing latency, and optimizing resource usage. **QIKS** is a TypeScript-based caching library offering both simplicity and power. It is designed for applications of all scales, whether you're building a web server, managing in-memory sessions, or developing an e-commerce recommendation engine.

### Why QIKS?

- Lightweight and fast.
- Flexible and configurable to suit diverse use cases.
- Advanced features like namespaces, customizable eviction policies, and cache events.
- Easy to integrate into existing projects.

## Features

### Core Features

- **Basic In-Memory Caching:** Simple and efficient in-memory storage.
- **TTL (Time-to-Live) Support:** Automatically expire cached data after a set time.
- **Serialization:** Built-in JSON support with options for custom serializers.
- **Namespaces:** Isolate caches for different application domains.
- **Cache Events:** Event-driven notifications for cache actions.
- **Customizable Eviction Policies:** Support for LRU, LFU, MRU, and custom policies.
- **Cache Dependency Management:** Automatically manage dependent keys.
- **Expiration Callbacks:** Execute user-defined callbacks on expiration.
- **Key Observers:** Monitor changes to specific keys.
- **Pattern-Based Preloading:** Preload keys based on patterns.

## Installation

Install **@medishn/qiks** via npm:

```bash
npm install @medishn/qiks
```

Refer to the [docs](./docs/document/) for the complete API reference.

## Contributing

We welcome contributions! Please follow our [Contributing Guidelines](./docs/CONTRIBUTING.md) and use conventional commits for consistency.

### Reporting Bugs

If you find a bug, create an issue on our [GitHub Repository](https://github.com/medishen/qiks/issues).

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Contact

For questions, suggestions, or support, email us at [bitsgenix@gmail.com](mailto:bitsgenix@gmail.com).
