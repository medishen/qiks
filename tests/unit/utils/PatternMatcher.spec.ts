import { CacheItem, GetOptions, StorageAdapter } from '../../../src/types/CacheTypes';
import { createStorageAdapter } from '../../../src/utils';
import { expect } from 'chai';
import { PatternMatcher } from '../../../src/utils/PatternMatcher';

describe('PatternMatcher', () => {
  let storage: StorageAdapter<string, CacheItem<string, string>>;
  const mapStorage = new Map<string, CacheItem<string, string>>();

  beforeEach(() => {
    storage = createStorageAdapter<string, CacheItem<string, string>>(mapStorage);
    storage.clear!();

    // Populate the storage with test data
    storage.set!('user:1', { value: 'John Doe' });
    storage.set!('user:2', { value: 'Jane Smith' });
    storage.set!('admin:1', { value: 'Admin User' });
    storage.set!('logs:2023', { value: 'Log Entry 2023' });
    storage.set!('settings:theme', { value: 'dark' });
    storage.set!('settings:language', { value: 'en' });
  });

  it('should find matches based on glob patterns', () => {
    const options = { keys: true, values: false, pattern: true };
    const result = PatternMatcher.findMatches('user:*', storage, options);
    expect(result).to.deep.equal(['user:1', 'user:2']);
  });

  it('should return deserialized values when requested', () => {
    const options = { keys: false, values: true, pattern: true };
    const result = PatternMatcher.findMatches('user:*', storage, options);
    expect(result).to.deep.equal(['John Doe', 'Jane Smith']);
  });

  it('should apply exclude patterns correctly', () => {
    const options = { keys: true, values: true, pattern: true, exclude: 'user:2' };
    const result = PatternMatcher.findMatches('user:*', storage, options);
    expect(result).to.deep.equal([['user:1', 'John Doe']]);
  });

  it('should respect prefix and suffix constraints', () => {
    const options = { keys: true, values: true, pattern: true, prefix: 'user', suffix: '2' };
    const result = PatternMatcher.findMatches('user:*', storage, options);
    expect(result).to.deep.equal([['user:2', 'Jane Smith']]);
  });

  it('should respect minLen and maxLen constraints', () => {
    const result = PatternMatcher.findMatches('user:*', storage, {
      keys: true,
      values: true,
      minLen: 6,
      maxLen: 8,
    });
    expect(result).to.deep.equal([
      ['user:1', 'John Doe'],
      ['user:2', 'Jane Smith'],
    ]);
  });

  it('should apply custom filter functions', () => {
    const options = {
      keys: true,
      values: true,
      pattern: true,
      filter: (key: string, value: string) => value.includes('John'),
    };
    const result = PatternMatcher.findMatches('user:*', storage, options);
    expect(result).to.deep.equal([['user:1', 'John Doe']]);
  });

  it('should limit the number of results returned', () => {
    const options = { keys: true, values: true, pattern: true, limit: 1 };
    const result = PatternMatcher.findMatches('user:*', storage, options);
    expect(result).to.deep.equal([['user:1', 'John Doe']]);
  });

  it('should transform results when transform option is provided', () => {
    const options = {
      keys: true,
      values: true,
      pattern: true,
      transform: (key: string, value: string) => `${value.toUpperCase()} (${key})`,
    };
    const result = PatternMatcher.findMatches('user:*', storage, options);
    expect(result).to.deep.equal([
      ['user:1', 'JOHN DOE (user:1)'],
      ['user:2', 'JANE SMITH (user:2)'],
    ]);
  });

  it('should sort results in descending order when requested', () => {
    const options: GetOptions<string> = { keys: true, values: true, pattern: true, sort: 'DESC' };
    const result = PatternMatcher.findMatches('user:*', storage, options);
    expect(result).to.deep.equal([
      ['user:2', 'Jane Smith'],
      ['user:1', 'John Doe'],
    ]);
  });

  it('should return null for unmatched patterns', () => {
    const options = { keys: true, values: true, pattern: true };
    const result = PatternMatcher.findMatches('unknown:*', storage, options);
    expect(result).to.deep.equal([]);
  });

  it('should handle edge cases with empty storage', () => {
    storage.clear!();
    const options = { keys: true, values: true, pattern: true };
    const result = PatternMatcher.findMatches('user:*', storage, options);
    expect(result).to.deep.equal([]);
  });
});
