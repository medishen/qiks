import { CacheStorageAdapter, QueryOptions } from '../common';
/**
 * Manages pattern-based key matching similar to Redis, supporting wildcards like `*`, `?`, and character classes.
 */
export class PatternManager<K, V> {
  /**
   * Cache for compiled regex patterns to improve performance.
   */
  private patternCache: Map<string, RegExp> = new Map();

  constructor(private storage: CacheStorageAdapter<K, V>) {}
  /**
   * Checks if a given key uses a pattern.
   *
   * @param key The key to check.
   * @returns `true` if the key contains pattern characters (`*`, `?`, `[abc]`, etc.).
   */
  public isPatternKey(key: string): boolean {
    const escapedKey = this.escapeRegExp(key);
    return /[*?\[\]]/.test(escapedKey);
  }

  /**
   * Finds and returns all keys that match a given pattern.
   *
   * @param pattern The Redis-style pattern to match keys against.
   * @returns An array of matching keys.
   */
  public findMatches(pattern: string): K[] {
    const regex = this.getRegexFromPattern(pattern);
    return Array.from(this.storage.keys()).filter((key) => regex.test(String(key)));
  }

  /**
   * Converts a Redis-style pattern into a RegExp object.
   *
   * @param pattern The pattern string (e.g., `user:*`).
   * @returns A compiled `RegExp` object.
   */
  private getRegexFromPattern(pattern: string): RegExp {
    if (this.patternCache.has(pattern)) {
      return this.patternCache.get(pattern)!;
    }

    let regexStr = '';
    let inCharClass = false;
    let escapeNext = false;

    for (let i = 0; i < pattern.length; i++) {
      const char = pattern[i];

      if (escapeNext) {
        regexStr += this.escapeRegExp(char);
        escapeNext = false;
        continue;
      }

      switch (char) {
        case '\\':
          escapeNext = true;
          break;

        case '[':
          if (!inCharClass) {
            inCharClass = true;
            regexStr += '[';
            // Handle negation if next character is ^ or !
            if (pattern[i + 1] === '!' || pattern[i + 1] === '^') {
              regexStr += '^';
              i++;
            }
          } else {
            regexStr += '\\[';
          }
          break;

        case ']':
          if (inCharClass) {
            inCharClass = false;
            regexStr += ']';
          } else {
            regexStr += '\\]';
          }
          break;

        case '*':
          regexStr += inCharClass ? '\\*' : '.*';
          break;

        case '?':
          regexStr += inCharClass ? '\\?' : '.';
          break;

        case '-':
          regexStr += inCharClass && i > 0 && i < pattern.length - 1 && pattern[i - 1] !== '[' && pattern[i + 1] !== ']' ? '-' : '\\-';
          break;

        default:
          regexStr += inCharClass ? char : this.escapeRegExp(char);
      }
    }

    const finalRegex = new RegExp(`^${regexStr}$`);
    this.patternCache.set(pattern, finalRegex);
    return finalRegex;
  }
  private escapeRegExp(char: string): string {
    return /[.$^{}()|[\]\\+*?]/.test(char) ? `\\${char}` : char;
  }
}
