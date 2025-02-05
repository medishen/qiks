import { CacheErrorCodes } from '../common';
import { CacheExceptionFactory } from '../errors';
import { Serialization } from './serialization';

export class FileOps<K, V> {
  constructor(private serialization: Serialization<K, V>) {}

  async import(filePath: string): Promise<void> {
    const fs = await import('fs/promises');
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      this.serialization.fromJSON(content);
    } catch (error: any) {
      // Handle file not found error (ENOENT)
      if (error.code === 'ENOENT') {
        throw CacheExceptionFactory.createException(CacheErrorCodes.FILE_NOT_FOUND, `File not found: ${filePath}`, { filePath });
      }

      // Handle syntax errors during JSON parsing
      if (error instanceof SyntaxError) {
        throw CacheExceptionFactory.createException(CacheErrorCodes.JSON_PARSE_ERROR, `Syntax error while parsing JSON from file: ${filePath}`, { filePath, errorMessage: error.message });
      }

      // Handle unexpected errors
      throw CacheExceptionFactory.createException(CacheErrorCodes.UNEXPECTED_ERROR, `Unexpected error during file import: ${error.message}`, { filePath, errorMessage: error.message });
    }
  }

  async export(filePath: string): Promise<string> {
    const json = this.serialization.toJSON();
    if (filePath) {
      const fs = await import('fs/promises');
      try {
        await fs.writeFile(filePath, json);
      } catch (error: any) {
        throw CacheExceptionFactory.createException(CacheErrorCodes.FILE_WRITE_ERROR, `Error writing to file ${filePath}`, { filePath, errorMessage: error.message });
      }
    }
    return json;
  }
}
