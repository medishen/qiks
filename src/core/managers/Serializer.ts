import { CacheError } from '../../errors/CacheError';

type Handler<T> = {
  serialize: (value: T) => any;
  deserialize: (value: any) => T;
};
type Handlers = {
  Date: Handler<Date>;
  RegExp: Handler<RegExp>;
  Function: Handler<Function>;
  Map: Handler<Map<any, any>>;
  Set: Handler<Set<any>>;
  Buffer: Handler<Buffer>;
  Error: Handler<Error>;
  Promise: Handler<Promise<any>>;
  ArrayBuffer: Handler<ArrayBuffer>;
};

export class Serializer {
  static readonly type_internal = '__TYPE__';
  static handlers = {
    Date: {
      serialize: (value: Date) => ({ [this.type_internal]: 'Date', value: value.toISOString() }),
      deserialize: (value: any) => new Date(value),
    },
    RegExp: {
      serialize: (value: RegExp) => ({ [this.type_internal]: 'RegExp', value: value.toString() }),
      deserialize: (value: any) => new RegExp(value),
    },
    Function: {
      serialize: (value: Function) => ({ [this.type_internal]: 'Function', value: value.toString() }),
      deserialize: (value: any) => new Function(`return ${value}`)(),
    },
    Map: {
      serialize: (value: Map<any, any>) => ({ [this.type_internal]: 'Map', value: Array.from(value.entries()) }),
      deserialize: (value: any) => new Map(value.value),
    },
    Set: {
      serialize: (value: Set<any>) => ({ [this.type_internal]: 'Set', value: Array.from(value) }),
      deserialize: (value: any) => new Set(value.value),
    },
    Buffer: {
      serialize: (value: Buffer) => ({ [this.type_internal]: 'Buffer', value: value.toString('base64') }),
      deserialize: (value: any) => Buffer.from(value.value, 'base64'),
    },
    Error: {
      serialize: (value: Error) => ({ [this.type_internal]: 'Error', message: value.message, stack: value.stack }),
      deserialize: (value: any) => {
        const error = new Error(value.message);
        error.stack = value.stack;
        return error;
      },
    },
    Promise: {
      serialize: (value: Promise<any>) => ({ [this.type_internal]: 'Promise', value: value.toString() }),
      deserialize: (value: any) => {
        return Promise.resolve();
      },
    },
    ArrayBuffer: {
      serialize: (value: ArrayBuffer) => ({ [this.type_internal]: 'ArrayBuffer', value: Array.from(new Uint8Array(value)) }),
      deserialize: (value: any) => new ArrayBuffer(value.value),
    },
  };
  static serialize<V>(data: V): string {
    try {
      return JSON.stringify(data, (key, value) => {
        if (value && typeof value === 'object' && value.constructor) {
          const typeName = value.constructor.name as keyof Handlers;
          if (this.handlers[typeName]) {
            return this.handlers[typeName].serialize(value);
          }
        }
        return value;
      });
    } catch (error: any) {
      throw new CacheError(`Serialization failed: ${error.message}`);
    }
  }

  static deserialize<V>(data: string): V {
    try {
      return JSON.parse(data, (key, value) => {
        if (value && value[this.type_internal]) {
          const typeName = value[this.type_internal] as keyof Handlers;
          if (this.handlers[typeName]) {
            return this.handlers[typeName].deserialize(value);
          }
        }
        return value;
      });
    } catch (error: any) {
      throw new CacheError(`Deserialization failed: ${error.message}`);
    }
  }
}
