import { CacheStorageAdapter } from '../common';
import { DependencyManager } from '../managers/dependency.manager';
import { EvictionPolicy } from '../../dist/types/EvictionPolicy';

export const isUndefined = (obj: any): obj is undefined => typeof obj === 'undefined';
export const isNull = (val: any): val is null | undefined => isUndefined(val) || val === null;
export const isEmpty = (array: any): boolean => !(array && array.length > 0);
/**
 * Calculates the size of a key in bytes.
 *
 * @param key - The key whose size is to be calculated.
 *              Can be of any type: null, undefined, Buffer, string, number, boolean, object, symbol, etc.
 * @returns The size of the key in bytes.
 */
export function sizeOfKey<K>(key: K): number {
  // Handle null or undefined keys
  if (key === null || key === undefined) {
    return 0;
  }

  // Handle Buffer keys
  if (Buffer.isBuffer(key)) {
    return key.length;
  }

  // Handle string keys
  if (typeof key === 'string') {
    return Buffer.byteLength(key, 'utf8');
  }

  // Handle number keys
  if (typeof key === 'number') {
    return Buffer.byteLength(key.toString(), 'utf8');
  }

  // Handle boolean keys
  if (typeof key === 'boolean') {
    return Buffer.byteLength(key.toString(), 'utf8');
  }

  // Handle object keys (including arrays and other objects)
  if (typeof key === 'object') {
    return Buffer.byteLength(JSON.stringify(key), 'utf8');
  }

  // Handle symbol keys
  if (typeof key === 'symbol') {
    return Buffer.byteLength(key.toString(), 'utf8');
  }

  // Handle any other type of key by converting it to a string
  return Buffer.byteLength(String(key), 'utf8');
}
/**
 * Calculates the size of a value in bytes.
 *
 * @param value - The value whose size is to be calculated.
 *                Can be of any type: null, undefined, Buffer, string, number, boolean, object, array, etc.
 * @returns The size of the value in bytes.
 */
export function sizeOfValue<V>(value: V): number {
  // Handle null or undefined values
  if (value === null || value === undefined) {
    return 0;
  }

  // Handle Buffer values
  if (Buffer.isBuffer(value)) {
    return value.length;
  }

  // Handle string values
  if (typeof value === 'string') {
    return Buffer.byteLength(value, 'utf8');
  }

  // Handle number values
  if (typeof value === 'number') {
    return Buffer.byteLength(value.toString(), 'utf8');
  }

  // Handle boolean values
  if (typeof value === 'boolean') {
    return Buffer.byteLength(value.toString(), 'utf8');
  }

  // Handle object values (including arrays and other objects)
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      // Handle arrays by calculating the size of each element
      return value.reduce((total, item) => total + sizeOfValue(item), 0);
    }

    // Handle regular objects by serializing them to JSON
    return Buffer.byteLength(JSON.stringify(value), 'utf8');
  }

  // Handle symbol values
  if (typeof value === 'symbol') {
    return Buffer.byteLength(value.toString(), 'utf8');
  }

  // Handle function values (functions as values are not commonly stored in cache, but if needed)
  if (typeof value === 'function') {
    // Approximate size of a function by considering the length of the source code.
    return Buffer.byteLength(value.toString(), 'utf8');
  }

  // For any other type of value, treat it as a string
  return Buffer.byteLength(String(value), 'utf8');
}
