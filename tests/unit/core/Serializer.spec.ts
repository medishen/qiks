import { expect } from 'chai';
import { it, describe } from 'mocha';
import { Serializer } from '../../../src/core/managers/Serializer';

describe('Serializer', () => {
  const serialize = Serializer.serialize;
  const deserialize = Serializer.deserialize;

  describe('Serializer - Date', () => {
    it('should serialize and deserialize a Date object', () => {
      const date = new Date();
      const serialized = serialize(date);
      const deserialized = deserialize<Date>(serialized);
      expect(deserialized).to.be.instanceOf(Date);
      expect(deserialized.getTime()).to.equal(date.getTime());
    });
  });

  describe('Serializer - RegExp', () => {
    it('should serialize and deserialize a RegExp object', () => {
      const regex = /test/i;
      const serialized = serialize(regex);

      const deserialized = deserialize<RegExp>(serialized);
      expect(deserialized).to.be.instanceOf(RegExp);
      expect(deserialized.source).to.equal(regex.source);
      expect(deserialized.flags).to.equal(regex.flags);
    });
  });

  describe('Serializer - Function', () => {
    it('should serialize and deserialize a Function', () => {
      const func = function testFunc() {
        return 'test';
      };
      const serialized = serialize(func);
      const deserialized = deserialize<Function>(serialized);
      expect(typeof deserialized).to.equal('function');
      expect(deserialized.name).to.equal(func.name);
      expect(deserialized()).to.equal(func());
    });

    it('should handle a function with regex inside', () => {
      const func = function testFunc() {
        return /regex/.test('regex');
      };
      const serialized = serialize(func);
      const deserialized = deserialize<Function>(serialized);
      expect(typeof deserialized).to.equal('function');
      expect(deserialized.name).to.equal(func.name);
      expect(deserialized()).to.equal(func());
    });
  });

  describe('Serializer - Map', () => {
    it('should serialize and deserialize a Map', () => {
      const map = new Map<string, any>([
        ['key1', 'value1'],
        ['key2', 42],
        ['key3', new Date()],
      ]);
      const serialized = serialize(map);
      const deserialized = deserialize<Map<any, any>>(serialized);
      expect(deserialized).to.be.instanceOf(Map);
      expect(deserialized.size).to.equal(map.size);
    });

    it('should serialize a Map containing a function and a regex', () => {
      const map = new Map<string, any>([
        [
          'func',
          function testFunc() {
            return 42;
          },
        ],
        ['regex', /abc/i],
      ]);
      const serialized = serialize(map);
      const deserialized = deserialize<Map<any, any>>(serialized);
      expect(typeof deserialized.get('func')).to.equal('function');
      expect(deserialized.get('func')()).to.equal(42);
      expect(deserialized.get('regex')).to.be.instanceOf(RegExp);
    });
  });

  describe('Serializer - Set', () => {
    it('should serialize and deserialize a Set', () => {
      const set = new Set([1, 2, 3, new Date(), /test/i]);
      const serialized = serialize(set);
      const deserialized = deserialize<Set<any>>(serialized);
      expect(deserialized).to.be.instanceOf(Set);
      expect(deserialized.size).to.equal(set.size);
    });
  });

  describe('Serializer - Buffer', () => {
    it('should serialize and deserialize a Buffer', () => {
      const buffer = Buffer.from('Hello, World!');
      const serialized = serialize(buffer);
      const deserialized = deserialize<Buffer>(serialized);
      expect(deserialized).to.be.instanceOf(Buffer);
      expect(deserialized.toString()).to.equal(buffer.toString());
    });
  });

  describe('Serializer - Error', () => {
    it('should serialize and deserialize an Error', () => {
      const error = new Error('Something went wrong');
      const serialized = serialize(error);
      const deserialized = deserialize<Error>(serialized);
      expect(deserialized).to.be.instanceOf(Error);
      expect(deserialized.message).to.equal(error.message);
    });
  });

  describe('Serializer - Promise', () => {
    it('should serialize and deserialize a resolved Promise', async () => {
      const promise = Promise.resolve(42);
      const serialized = serialize(promise);
      const deserialized = deserialize<Promise<any>>(serialized);
      expect(deserialized).to.be.instanceOf(Promise);
    });
  });

  describe('Serializer - ArrayBuffer', () => {
    it('should serialize and deserialize an ArrayBuffer', () => {
      const buffer = new Uint8Array([1, 2, 3]).buffer;
      const serialized = serialize(buffer);
      const deserialized = deserialize<ArrayBuffer>(serialized);
      expect(deserialized).to.be.instanceOf(ArrayBuffer);
      expect(new Uint8Array(deserialized)).to.deep.equal(new Uint8Array(buffer));
    });
  });

  describe('Serializer - Complex Cases', () => {
    it('should handle nested structures', () => {
      const map = new Map<string, any>([
        ['set', new Set([1, 2, /abc/i])],
        ['date', new Date()],
      ]);
      const nested = {
        buffer: Buffer.from('nested'),
        map,
        regex: /complex/i,
      };
      const serialized = serialize(nested);
      const deserialized = deserialize<typeof nested>(serialized);
      expect(deserialized.buffer.toString()).to.equal(nested.buffer.toString());
      expect(deserialized.map).to.be.instanceOf(Map);
      expect(deserialized.regex).to.be.instanceOf(RegExp);
    });
  });
});
