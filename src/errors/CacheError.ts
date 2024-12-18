export class CacheError extends Error {
  line?: number;
  fileName?: string;
  functionName?: string;

  constructor(message: string) {
    super(message);
    this.name = 'CacheError';
    Error.captureStackTrace(this, this.constructor);
    const stackDetails = this.parseStackTrace();
    if (stackDetails) {
      this.line = stackDetails.line;
      this.fileName = stackDetails.fileName;
      this.functionName = stackDetails.functionName;
    }
  }
  private parseStackTrace(): { fileName: string; line: number; functionName?: string } | null {
    const stackLines = this.stack?.split('\n');
    if (!stackLines || stackLines.length < 2) return null;
    const traceLine = stackLines[1];
    const match = traceLine.match(/at (.+?) \((.+):(\d+):\d+\)/) || traceLine.match(/at (.+):(\d+):\d+/);

    if (match) {
      return {
        functionName: match[1]?.trim() || undefined,
        fileName: match[2]?.trim() || '',
        line: parseInt(match[3], 10) || 0,
      };
    }

    return null;
  }
  toString(): string {
    return `${this.name}: ${this.message} (File: ${this.fileName || 'unknown'}, Line: ${this.line || 'unknown'})`;
  }
}
