import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { CacheEntry } from '../../../src/common';
import { DependencyManager } from '../../../src/managers/dependency.manager';
import { MapStorageAdapter } from '../../../src/storage';

describe('DependencyManager', () => {
  let storage: MapStorageAdapter<string, CacheEntry<string, any>>;
  let dependencyManager: DependencyManager<string, string>;

  beforeEach(() => {
    storage = new MapStorageAdapter();
    dependencyManager = new DependencyManager<string, any>(storage);
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

      expect(() => dependencyManager.addDependency(parentKey, dependentKey)).to.throw('Parent key "nonExistentParent" does not exist.');
    });
  });

  describe('getDependents', () => {
    it('should return the set of dependents for a given key', () => {
      const parentKey = 'parent';
      const dependents = new Set(['child1', 'child2']);
      const entry = { value: 'value1', dependents };

      storage.set(parentKey, entry);

      const result = dependencyManager.getDependents(entry as any);

      expect(result).to.deep.equal(new Set(['child1', 'child2']));
    });

    it('should return null if the key has no dependents', () => {
      const parentKey = 'parent';

      storage.set(parentKey, { value: 'value1' });

      const result = dependencyManager.getDependents(parentKey as any);

      expect(result).to.be.null;
    });

    it('should return null if the key does not exist', () => {
      const result = dependencyManager.getDependents('nonExistentKey' as any);

      expect(result).to.be.null;
    });
  });
});
