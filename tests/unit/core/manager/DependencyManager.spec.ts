import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { DependencyManager } from '../../../../src/core/managers/DependencyManager';
import { CacheItem, StorageAdapter } from '../../../../src/types/CacheTypes';
import { createStorageAdapter } from '../../../../src/utils';

describe('DependencyManager', () => {
  let storage: StorageAdapter<string, CacheItem<string>>;
  let dependencyManager: DependencyManager<string, string>;
  const mapStorage = new Map<string, CacheItem<string>>();

  beforeEach(() => {
    storage = createStorageAdapter<string, CacheItem<string>>(mapStorage);
    dependencyManager = new DependencyManager<string, string>(storage);
  });

  describe('addDependency', () => {
    it('should add a dependent key to a parent key', () => {
      const parentKey = 'parent';
      const dependentKey = 'child';

      storage.set(parentKey, { value: 'value1', dependents: new Set<string>() });

      dependencyManager.addDependency(parentKey, dependentKey);

      const parentEntry = storage.get(parentKey);
      expect(parentEntry).to.not.be.null;
      expect(parentEntry!.dependents).to.deep.equal(new Set([dependentKey]));
    });

    it('should throw an error if the parent key does not exist', () => {
      const parentKey = 'nonExistentParent';
      const dependentKey = 'child';

      expect(() => dependencyManager.addDependency(parentKey, dependentKey)).to.throw(`Parent key "${parentKey}" does not exist.`);
    });
  });

  describe('removeDependency', () => {
    it('should remove a dependent key from a parent key', () => {
      const parentKey = 'parent';
      const dependentKey = 'child';

      storage.set(parentKey, { value: 'value1', dependents: new Set([dependentKey]) });

      dependencyManager.removeDependency(parentKey, dependentKey);

      const parentEntry = storage.get(parentKey);
      expect(parentEntry).to.not.be.null;
      expect(parentEntry!.dependents).to.be.undefined;
    });

    it('should handle removal when parent key has no dependents', () => {
      const parentKey = 'parent';

      storage.set(parentKey, { value: 'value1' });

      dependencyManager.removeDependency(parentKey, 'child'); // Should not throw or do anything

      const parentEntry = storage.get(parentKey);
      expect(parentEntry).to.not.be.null;
      expect(parentEntry!.dependents).to.be.undefined;
    });

    it('should handle removal when parent key does not exist', () => {
      dependencyManager.removeDependency('nonExistentParent', 'child'); // Should not throw or do anything
    });
  });

  describe('getDependents', () => {
    it('should return the set of dependents for a given key', () => {
      const parentKey = 'parent';
      const dependents = new Set(['child1', 'child2']);

      storage.set(parentKey, { value: 'value1', dependents });

      const result = dependencyManager.getDependents(parentKey);

      expect(result).to.deep.equal(new Set(['child1', 'child2']));
    });

    it('should return null if the key has no dependents', () => {
      const parentKey = 'parent';

      storage.set(parentKey, { value: 'value1' });

      const result = dependencyManager.getDependents(parentKey);

      expect(result).to.be.null;
    });

    it('should return null if the key does not exist', () => {
      const result = dependencyManager.getDependents('nonExistentKey');

      expect(result).to.be.null;
    });
  });

  describe('clearDependencies', () => {
    it('should recursively clear all dependencies and delete dependent keys', () => {
      storage.set('parent', { value: 'value1', dependents: new Set(['child1', 'child2']) });
      storage.set('child1', { value: 'value2', dependents: new Set(['grandchild1']) });
      storage.set('child2', { value: 'value3' });
      storage.set('grandchild1', { value: 'value4' });

      dependencyManager.clearDependencies('parent');

      expect(storage.get('parent')).to.not.be.null; // Parent should remain
      expect(storage.get('child1')).to.be.undefined;
      expect(storage.get('child2')).to.be.undefined;
      expect(storage.get('grandchild1')).to.be.undefined;
    });

    it('should handle a key with no dependents gracefully', () => {
      const key = 'parent';
      storage.set(key, { value: 'value1' });

      dependencyManager.clearDependencies(key);

      const entry = storage.get(key);
      expect(entry).to.not.be.null;
      expect(entry!.dependents).to.be.undefined;
    });

    it('should handle a key that does not exist gracefully', () => {
      dependencyManager.clearDependencies('nonExistentKey'); // Should not throw or do anything
    });
  });
});
