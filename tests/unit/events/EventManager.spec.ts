import { expect } from 'chai';
import { CacheEvent, EventCallback } from '../../../src/types/CacheTypes';
import { EventManager } from '../../../src/events/EventManager';
import { beforeEach, describe, it } from 'mocha';
describe('EventManager', () => {
  let storage: Map<string, Set<EventCallback<string, number>>>;
  let eventManager: EventManager<string, number>;

  beforeEach(() => {
    storage = new Map();
    eventManager = new EventManager(storage);
  });

  describe('on()', () => {
    it('should register a callback for a specific event', () => {
      const callback = (key: string, value?: number) => {};
      eventManager.on('set', callback);

      const listeners = storage.get('event:set');
      expect(listeners).to.exist;
      expect(listeners!.has(callback)).to.be.true;
    });

    it('should allow multiple callbacks for the same event', () => {
      const callback1 = (key: string, value?: number) => {};
      const callback2 = (key: string, value?: number) => {};
      eventManager.on('set', callback1);
      eventManager.on('set', callback2);

      const listeners = storage.get('event:set');
      expect(listeners).to.exist;
      expect(listeners!.has(callback1)).to.be.true;
      expect(listeners!.has(callback2)).to.be.true;
    });
  });

  describe('off()', () => {
    it('should remove a specific callback for an event', () => {
      const callback = (key: string, value?: number) => {};

      eventManager.on('set', callback);
      // Ensure the callback was added.
      const event = storage.get('event:set');
      expect(event!.has(callback)).to.be.true;

      eventManager.off('set', callback);
      expect(storage.get('event:set')?.has(callback)).to.be.undefined;
      expect(storage.has('event:set')).to.be.false;
    });

    it('should remove the event key from storage if no listeners remain', () => {
      const callback = (key: string, value?: number) => {};
      eventManager.on('set', callback);
      eventManager.off('set', callback);

      expect(storage.has('event:set')).to.be.false;
    });

    it('should do nothing if the callback does not exist for the event', () => {
      const callback = (key: string, value?: number) => {};
      eventManager.off('set', callback);

      expect(storage.has('event:set')).to.be.false;
    });

    it('should do nothing if the event has no registered callbacks', () => {
      const callback = (key: string, value?: number) => {};
      eventManager.on('get', callback);
      eventManager.off('set', callback);

      expect(storage.has('event:get')).to.be.true;
      expect(storage.has('event:set')).to.be.false;
    });
  });

  describe('emit()', () => {
    it('should invoke all callbacks registered for an event', () => {
      const results: [string, number | undefined][] = [];
      const callback1 = (key: string, value?: number) => results.push([key, value]);
      const callback2 = (key: string, value?: number) => results.push([key, value]);

      eventManager.on('set', callback1);
      eventManager.on('set', callback2);

      eventManager.emit('set', 'key1', 100);

      expect(results).to.deep.equal([
        ['key1', 100],
        ['key1', 100],
      ]);
    });

    it('should handle callbacks that throw errors and continue executing others', () => {
      const results: [string, number | undefined][] = [];
      const failingCallback = () => {
        try {
          throw new Error('Callback error');
        } catch (error: any) {
          console.log(error.message);
        }
      };
      const successfulCallback = (key: string, value?: number) => results.push([key, value]);

      eventManager.on('set', failingCallback);
      eventManager.on('set', successfulCallback);

      expect(() => eventManager.emit('set', 'key1', 100)).not.to.throw();
      expect(results).to.deep.equal([['key1', 100]]);
    });

    it('should do nothing if no callbacks are registered for the event', () => {
      expect(() => eventManager.emit('set', 'key1', 100)).not.to.throw();
    });

    it('should support events without associated values', () => {
      const results: [string, number | undefined][] = [];
      const callback = (key: string, value?: number) => results.push([key, value]);

      eventManager.on('expire', callback);
      eventManager.emit('expire', 'key1');

      expect(results).to.deep.equal([['key1', undefined]]);
    });
  });

  describe('Edge Cases', () => {
    it('should correctly handle multiple events with independent listeners', () => {
      const results: { event: CacheEvent; key: string; value?: number }[] = [];
      const callback1 = (key: string, value?: number) => results.push({ event: 'set', key, value });
      const callback2 = (key: string, value?: number) => results.push({ event: 'delete', key, value });

      eventManager.on('set', callback1);
      eventManager.on('delete', callback2);

      eventManager.emit('set', 'key1', 100);
      eventManager.emit('delete', 'key2');

      expect(results).to.deep.equal([
        { event: 'set', key: 'key1', value: 100 },
        { event: 'delete', key: 'key2', value: undefined },
      ]);
    });

    it('should remove the correct callback when multiple callbacks exist for an event', () => {
      const results: [string, number | undefined][] = [];
      const callback1 = (key: string, value?: number) => results.push([key, value]);
      const callback2 = (key: string, value?: number) => results.push([key, value]);

      eventManager.on('set', callback1);
      eventManager.on('set', callback2);

      eventManager.off('set', callback1);

      eventManager.emit('set', 'key1', 100);

      expect(results).to.deep.equal([['key1', 100]]);
    });
  });
});
