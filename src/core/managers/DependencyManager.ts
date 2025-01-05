import { CacheItem, StorageAdapter } from '../../types/CacheTypes';

export class DependencyManager<K, V> {
  constructor(private storage: StorageAdapter<K, CacheItem<K, V>>) {}

  addDependency(parentKey: K, dependentKey: K): void {
    const parentEntry = this.storage.get(parentKey);
    if (!parentEntry) {
      throw new Error(`Parent key "${parentKey}" does not exist.`);
    }
    if (!parentEntry.dependents) {
      parentEntry.dependents = new Set<K>();
    }
    parentEntry.dependents.add(dependentKey);
    this.storage.set(parentKey, parentEntry);
  }

  removeDependency(parentKey: K, dependentKey: K): void {
    const parentEntry = this.storage.get(parentKey);
    if (!parentEntry || !parentEntry.dependents) return;

    parentEntry.dependents.delete(dependentKey);
    if (parentEntry.dependents.size === 0) {
      delete parentEntry.dependents;
    }
    this.storage.set(parentKey, parentEntry);
  }

  getDependents(key: K): Set<K> | null {
    const entry = this.storage.get(key);
    if (!entry || !entry.dependents) return null;
    return new Set<K>([...entry.dependents]);
  }

  clearDependencies(key: K): void {
    const entry = this.storage.get(key);
    if (!entry || !entry.dependents) return;

    const dependents = [...entry.dependents];
    delete entry.dependents;
    this.storage.set(key, entry);

    dependents.forEach((dependentKey) => {
      this.clearDependencies(dependentKey);
      this.storage.delete(dependentKey);
    });
  }
}
