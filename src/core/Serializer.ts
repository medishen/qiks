import { CacheError } from '../errors/CacheError';

export class Serializer<V> {
  static serialize<V>(data: V): string {
    try {
      return JSON.stringify(data);
    } catch (error: any) {
      throw new CacheError(`Serialization failed: ${error.message}`);
    }
  }

  static deserialize<V>(data: string): V {
    try {
      return JSON.parse(data) as V;
    } catch (error: any) {
      throw new CacheError(`Deserialization failed: ${error.message}`);
    }
  }
}