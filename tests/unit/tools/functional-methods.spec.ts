import { expect } from 'chai';
import { SinonSandbox, createSandbox } from 'sinon';
import { Functional } from '../../../src/tools/functional-methods';
import { CacheStorageAdapter } from '../../../src/common';
import { MapStorageAdapter } from '../../../src/storage';
describe('FunctionalMethods', function () {
  let sandbox: SinonSandbox;
  let adapter: CacheStorageAdapter<string, number>;
  let functionalMethods: Functional<string, number>;

  beforeEach(() => {
    sandbox = createSandbox();

    adapter = new MapStorageAdapter();
    functionalMethods = new Functional(adapter);
  });

  afterEach(function () {
    adapter.clear();
    sandbox.restore();
  });
  // Helper function to setup mock data
  const setMockData = (data: { [key: string]: number }) => {
    Object.keys(data).forEach((key) => {
      adapter.set(key, { value: data[key] });
    });
  };

  describe('#every', function () {
    it('should return true when all values satisfy the condition', () => {
      setMockData({ a: 1, b: 2, c: 3 });
      const result = functionalMethods.every((value) => {
        return value > 0;
      });

      expect(result).to.be.true;
    });

    it('should return false when any element does not satisfy the predicate', function () {
      setMockData({ a: 1, b: -2, c: 3 });
      const result = functionalMethods.every((value) => value > 0);
      expect(result).to.be.false;
    });
  });

  describe('#some', function () {
    it('should return true if at least one element satisfies the predicate', function () {
      setMockData({ a: 1, b: -1 });
      const result = functionalMethods.some((value) => value > 0);
      expect(result).to.be.true;
    });

    it('should return false if no elements satisfy the predicate', function () {
      setMockData({ a: -1, b: -2 });
      const result = functionalMethods.some((value) => value > 0);
      expect(result).to.be.false;
    });
  });

  describe('#map', function () {
    it('should return an array of transformed values', function () {
      setMockData({ a: 1, b: 2 });
      const result = functionalMethods.map((value) => value * 2);
      expect(result).to.deep.equal([2, 4]);
    });
  });

  describe('#reduce', function () {
    it('should return the accumulated result', function () {
      setMockData({ a: 1, b: 2 });
      const result = functionalMethods.reduce((acc, value) => acc + value, 0);
      expect(result).to.equal(3);
    });
  });

  describe('#filter', function () {
    it('should return a filtered StorageAdapter with values satisfying the predicate', function () {
      setMockData({ a: 1, b: 2, c: 3 });
      const filtered = functionalMethods.filter((value) => value > 1);
      expect(filtered.size()).to.equal(2);
      expect(filtered.get('b')).to.equal(2);
      expect(filtered.get('c')).to.equal(3);
    });
    it('should filter values correctly', () => {
      setMockData({ a: 1, b: 2, c: 3 });
      const result = functionalMethods.filter((value) => value > 1);
      expect(result.size()).to.equal(2);
      expect(result.get('b')).to.equal(2);
      expect(result.get('c')).to.equal(3);
    });

    it('should handle empty storage', () => {
      const result = functionalMethods.filter((value) => value > 1);
      expect(result.size()).to.equal(0);
    });
  });

  describe('#groupBy', function () {
    it('should group elements by the provided key selector', function () {
      setMockData({ a: 1, b: 2, c: 1 });
      const grouped = functionalMethods.groupBy((value) => value);
      expect(grouped.size).to.equal(2);
      expect(grouped.get(1)).to.deep.equal([1, 1]);
      expect(grouped.get(2)).to.deep.equal([2]);
    });
  });

  describe('#find', function () {
    it('should return the first element satisfying the predicate', function () {
      setMockData({ a: 1, b: 2 });
      const result = functionalMethods.find((value) => value > 1);
      expect(result).to.equal(2);
    });

    it('should return undefined if no element satisfies the predicate', function () {
      setMockData({ a: 1, b: -1 });
      const result = functionalMethods.find((value) => value > 2);
      expect(result).to.equal(undefined);
    });
  });

  describe('#merge', function () {
    it('should merge another StorageAdapter into the current one', function () {
      setMockData({ a: 1 });
      const otherAdapter = new MapStorageAdapter<string, number>();
      otherAdapter.set('b', 2);
      functionalMethods.merge(otherAdapter);

      expect(adapter.get('a')).to.deep.equal({ value: 1 });
      expect(adapter.get('b')).to.deep.equal({ value: 2 });
    });
  });

  describe('#toArray', function () {
    it('should return an array of entries', function () {
      setMockData({ a: 1, b: 2 });
      const result = functionalMethods.toArray();

      expect(result).to.deep.equal([
        ['a', { value: 1 }],
        ['b', { value: 2 }],
      ]);
    });
  });

  describe('#max', function () {
    it('should return the maximum value based on the comparator', function () {
      setMockData({ a: 1, b: 3, c: 2 });
      const result = functionalMethods.max((a, b) => a - b);

      expect(result).to.deep.equal({ value: 3 });
    });

    it('should return undefined if the adapter is empty', function () {
      const result = functionalMethods.max((a, b) => a - b);

      expect(result).to.equal(undefined);
    });
  });

  describe('#min', function () {
    it('should return the minimum value based on the comparator', function () {
      setMockData({ a: 1, b: 3, c: 2 });
      const result = functionalMethods.min((a, b) => a - b);

      expect(result).to.deep.equal({ value: 1 });
    });

    it('should return undefined if the adapter is empty', function () {
      const result = functionalMethods.min((a, b) => a - b);
      expect(result).to.equal(undefined);
    });
  });

  describe('#average', function () {
    it('should calculate the average value', function () {
      setMockData({ a: 1, b: 2, c: 3 });
      const result = functionalMethods.average((value) => value);
      expect(result).to.deep.equal(2);
    });

    it('should return 0 if there are no elements', function () {
      const result = functionalMethods.average((value) => value);

      expect(result).to.deep.equal(0);
    });
  });

  describe('#findKey', function () {
    it('should return the first key satisfying the condition', function () {
      setMockData({ a: 1, b: 2 });
      const result = functionalMethods.findKey((value, key) => value === 2);
      expect(result).to.equal('b');
    });

    it('should return undefined if no key satisfies the condition', function () {
      setMockData({ a: 1, b: 2 });
      const result = functionalMethods.findKey((value, key) => value === 3);
      expect(result).to.equal(undefined);
    });
  });
});
