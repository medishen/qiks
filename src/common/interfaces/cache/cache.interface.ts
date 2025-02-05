/**
 * QueryOptions defines various parameters for retrieving entries from the cache.
 * These options allow you to filter, sort, and transform the results returned by a cache query.
 *
 * @template K - The type for keys in the cache.
 */
export interface QueryOptions<K> {
  /**
   * If true, results are returned as an array of key-value tuples.
   */
  withTuple?: boolean;

  /**
   * Only include keys with a length greater than or equal to this value.
   */
  minLen?: number;

  /**
   * Only include keys with a length less than or equal to this value.
   */
  maxLen?: number;

  /**
   * Only include keys that start with this prefix.
   */
  prefix?: string;

  /**
   * A filter function that receives a key and its associated value.
   * Only entries for which this function returns true will be included in the result.
   */
  filter?: (key: K, value: any) => boolean;
}
