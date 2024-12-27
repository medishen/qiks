import { Serializer } from '../core/managers/Serializer';
import { CacheItem, GetOptions, StorageAdapter } from '../types/CacheTypes';

export class PatternMatcher {
  private static globToRegex(pattern: string): RegExp {
    const escaped = pattern.replace(/([.+^${}()|[\]\\])/g, '\\$1');
    const regexString = escaped
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')
      .replace(/\\\[!([^\\\]]+)\\\]/g, '[^$1]')
      .replace(/\\\[(.*?)\\\]/g, '[$1]');
    return new RegExp(`^${regexString}$`);
  }

  public static findMatches<K, V>(pattern: string, storage: StorageAdapter<K, CacheItem<string>>, options: GetOptions<K>): Array<K | V | [K, V]> {
    const regex = this.globToRegex(pattern);
    const results: Array<K | V | [K, V]> = [];
    for (const [key, entry] of storage.entries()) {
      if (typeof key === 'string' && regex.test(key)) {
        if (options.minLen && key.length < options.minLen) continue;
        if (options.maxLen && key.length > options.maxLen) continue;
        const deserializedValue = entry?.value ? Serializer.deserialize(entry.value) : null;
        if (options.prefix && !key.startsWith(options.prefix)) continue;
        if (options.suffix && !key.endsWith(options.suffix)) continue;
        if (options.exclude) {
          const excludePatterns = Array.isArray(options.exclude) ? options.exclude : [options.exclude];
          if (
            excludePatterns.some((excludePattern) => {
              try {
                const excludeRegex = this.globToRegex(excludePattern);
                return excludeRegex.test(key);
              } catch {
                return false;
              }
            })
          ) {
            continue;
          }
        }
        if (options.filter && !options.filter(key, deserializedValue)) continue;

        // Build results
        if ((options.keys && options.values) || options.withTuples) {
          results.push([key as K, deserializedValue as V]);
        } else if (options.keys) {
          results.push(key as K);
        } else if (options.values && deserializedValue !== null) {
          results.push(deserializedValue as V);
        }

        if (results.length >= (options.limit ?? Infinity)) break;
      }
    }
    const sortedResults = options.sort === 'DESC' ? results.reverse() : results;
    if (options.transform) {
      return sortedResults.map((item) => {
        if (Array.isArray(item)) {
          const [k, v] = item as [K, V];
          return [k, options.transform!(k, v)] as [K, V];
        }
        return options.transform!(item as K, item as V);
      });
    }

    return sortedResults;
  }
}
