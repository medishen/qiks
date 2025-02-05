import { CacheEntry, CacheErrorCodes, CacheStorageAdapter } from '../common';
import { CacheExceptionFactory } from '../errors';

export class DependencyManager<K, V> {
  constructor(private storage: CacheStorageAdapter<K, V>) {}

  addDependency(parentKey: K, dependentKey: K): Set<K> {
    const parentEntry = this.storage.get(parentKey);

    if (!parentEntry) {
      throw CacheExceptionFactory.createException(CacheErrorCodes.MISSING_KEY, `Parent key "${parentKey}" does not exist.`, { parentKey });
    }
    if (!parentEntry.dependents) {
      parentEntry.dependents = new Set<K>();
    }
    parentEntry.dependents.add(dependentKey);
    parentEntry.lastAccessTime = Date.now();
    parentEntry.lastUpdated = Date.now();
    parentEntry.modifiedAt = Date.now();
    this.storage.set(parentKey, parentEntry);
    return parentEntry.dependents;
  }

  getDependents(entry: CacheEntry<K, V>): Set<K> | null {
    if (!entry || !entry.dependents || entry.dependents.size === 0) {
      return null;
    }
    return new Set([...entry.dependents]);
  }

  clearDependencies(entry: CacheEntry<K, V>): void {
    if (!entry || !entry.dependents || entry.dependents.size === 0) {
      return;
    }
    const visited = new Set<K>();
    const deleteEntry = (key: K) => {
      if (visited.has(key)) {
        return;
      }
      visited.add(key);

      const dependentEntry = this.storage.get(key);
      if (!dependentEntry) {
        return;
      }

      if (dependentEntry.dependents && dependentEntry.dependents.size > 0) {
        for (const depKey of dependentEntry.dependents) {
          deleteEntry(depKey);
        }
      }

      this.storage.delete(key);
    };

    for (const dependentKey of entry.dependents) {
      deleteEntry(dependentKey);
    }
    visited.clear();
  }
}
