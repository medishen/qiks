/**
 * QIKS - High Performance Caching Library
 *
 * @license
 * Copyright (c) 2025 Mahdi. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @overview
 * QIKS is a high-performance caching solution designed for modern applications.
 * Provides efficient in-memory storage with configurable eviction policies,
 * expiration strategies, and type-safe operations.
 *
 * @example
 * ```typescript
 * import { Qiks } from 'qiks';
 *
 * // Create cache with default configuration
 * const qiks = new Qiks<string, number>();
 *
 * // Set values
 * qiks.set('key1', 42);
 *
 * // Get values
 * console.log(qiks.get('key1')); // 42
 * ```
 *
 * @packageDocumentation
 *
 * @see {@link https://github.com/medishen/qiks GitHub Repository}
 * @see {@link https://github.com/medishen/qiks/wiki Documentation}
 *
 * @remarks
 * Key Features:
 * - Type-safe key/value storage
 * - Configurable cache policies (LRU, etc.)
 * - Entry expiration (TTL, idle timeout)
 * - Event hooks for cache operations
 * - Statistics and monitoring
 *
 * @alpha
 */

import { CacheStore } from './cache';
import { CacheConfig } from './common';
export * from './common';
/**
 * Core caching class implementing QIKS functionality
 *
 * @typeParam K - Type of keys used in the cache (default: string)
 * @typeParam V - Type of values stored in the cache (default: string)
 *
 * @example
 * ```typescript
 * // Custom typed cache example
 * interface UserProfile {
 *   id: string;
 *   name: string;
 * }
 *
 * const userCache = new Qiks<number, UserProfile>({
 *   maxSize: 1000,
 *   evictionPolicy: 'LRU'
 * });
 * ```
 */
export class Qiks<K = string, V = string> extends CacheStore<K, V> {
  /**
   * Creates a new QIKS cache instance
   *
   * @param options - Configuration options for the cache
   *
   * @example
   * ```typescript
   * const cache = new Qiks({
   *   maxSize: 500,
   *   evictionPolicy: 'LRU',
   * });
   * ```
   */
  constructor(options?: CacheConfig<K, V>) {
    super(options);
  }
}
