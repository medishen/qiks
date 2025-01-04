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
  Object: Handler<Object>;
};

export class Serializer {
  static readonly type_internal = '__TYPE__';
  static handlers = {
    Object: {
      serialize: (value: object) => {
        const serializedObject: Record<string, any> = {};
        for (const key in value) {
          if (value.hasOwnProperty(key)) {
            const propertyValue = (value as any)[key];
            serializedObject[key] = Serializer.serialize(propertyValue);
          }
        }
        return {
          [Serializer.type_internal]: 'Object',
          value: serializedObject,
        };
      },

      deserialize: (value: any): object => {
        const deserializedObject: Record<string, any> = {};

        for (const key in value.value) {
          if (value.value.hasOwnProperty(key)) {
            const serializedPropertyValue = value.value[key];
            deserializedObject[key] = Serializer.deserialize(serializedPropertyValue);
          }
        }

        return deserializedObject;
      },
    },
    Date: {
      serialize: (value: Date) => {
        return { [Serializer.type_internal]: 'Date', value: value };
      },
      deserialize: (value: any) => new Date(value.value),
    },
    RegExp: {
      serialize: (value: RegExp) => ({
        [Serializer.type_internal]: 'RegExp',
        value: {
          source: value.source,
          flags: value.flags,
        },
      }),
      deserialize: (value: any) => new RegExp(value.value.source, value.value.flags),
    },
    Function: {
      serialize: (value: Function) => ({ [Serializer.type_internal]: 'Function', value: value.toString(), name: value.name }),
      deserialize: (value: any) => {
        const func = new Function(`return ${value.value}`)();
        Object.defineProperty(func, 'name', { value: value.name });
        return func;
      },
    },
    Map: {
      serialize: (value: Map<any, any>) => ({
        [Serializer.type_internal]: 'Map',
        value: Array.from(value.entries()).map(([key, val]) => {
          return [Serializer.serialize(key), Serializer.serialize(val)];
        }),
      }),
      deserialize: (value: any) =>
        new Map(
          value.value.map(([key, val]: [key: string, val: string]) => {
            return [Serializer.deserialize(key), Serializer.deserialize(val)];
          }),
        ),
    },
    Set: {
      serialize: (value: Set<any>) => ({ [Serializer.type_internal]: 'Set', value: Array.from(value) }),
      deserialize: (value: any) => new Set(value.value),
    },
    Buffer: {
      serialize: (value: Buffer) => {
        return { [Serializer.type_internal]: 'Buffer', value: value.toString('base64') };
      },
      deserialize: (value: any) => Buffer.from(value.value, 'base64'),
    },
    Error: {
      serialize: (value: Error) => ({ [Serializer.type_internal]: 'Error', message: value.message, stack: value.stack }),
      deserialize: (value: any) => {
        const error = new Error(value.message);
        error.stack = value.stack;
        return error;
      },
    },
    Promise: {
      serialize: (value: Promise<any>) => ({ [Serializer.type_internal]: 'Promise', value: value.toString() }),
      deserialize: (value: any) => {
        return Promise.resolve();
      },
    },
    ArrayBuffer: {
      serialize: (value: ArrayBuffer) => ({ [Serializer.type_internal]: 'ArrayBuffer', value: Array.from(new Uint8Array(value)) }),
      deserialize: (value: any) => {
        const byteArray = new Uint8Array(value.value);
        return byteArray.buffer;
      },
    },
  };
  static serialize<V>(data: V): string {
    try {
      if (data instanceof Date) {
        return JSON.stringify(Serializer.handlers.Date.serialize(data));
      }
      if (data instanceof ArrayBuffer) {
        return JSON.stringify(Serializer.handlers.ArrayBuffer.serialize(data));
      }
      if (data instanceof Buffer) {
        return JSON.stringify(Serializer.handlers.Buffer.serialize(data));
      }

      return JSON.stringify(data, (key, value) => {
        if (value && (typeof value === 'object' || typeof value === 'function') && value.constructor) {
          const typeName = value.constructor.name as keyof Handlers;
          if (Serializer.handlers[typeName]) {
            if (value.hasOwnProperty('__SERIALIZED__')) {
              return value;
            }
            value['__SERIALIZED__'] = true;
            return Serializer.handlers[typeName].serialize(value);
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
        if (value && value[Serializer.type_internal]) {
          const typeName = value[Serializer.type_internal] as keyof Handlers;
          if (Serializer.handlers[typeName]) {
            return Serializer.handlers[typeName].deserialize(value);
          }
        }
        return value;
      });
    } catch (error: any) {
      throw new CacheError(`Deserialization failed: ${error.message}`);
    }
  }
}
