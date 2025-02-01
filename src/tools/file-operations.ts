import { CacheExceptionFactory } from '../errors';
import { Serialization } from './serialization';

export class FileOperations<K, V> {
  constructor(private serialization: Serialization<K, V>) {}

  async import(filePath: string): Promise<void> {
    const fs = await import('fs/promises');
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      this.serialization.fromJSON(content);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw CacheExceptionFactory.fileNotFound(filePath); // File not found error
      }
      if (error instanceof SyntaxError) {
        throw CacheExceptionFactory.jsonParseError(error.message); // JSON parse error
      }
      throw CacheExceptionFactory.unexpectedError(error.message); // Unexpected error
    }
  }

  async export(filePath: string): Promise<string> {
    const json = this.serialization.toJSON();
    if (filePath) {
      const fs = await import('fs/promises');
      try {
        await fs.writeFile(filePath, json);
      } catch (error: any) {
        throw CacheExceptionFactory.fileWriteError(filePath, error.message); // File write error
      }
    }
    return json;
  }
}
