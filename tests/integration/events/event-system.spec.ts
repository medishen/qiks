import { EventSystem } from '../../../src/events';
import { expect } from 'chai';
import sinon from 'sinon';
import { EventType } from '../../../src/common';
describe('EventSystem', () => {
  let eventSystem: EventSystem<any, any, any>;
  let listenerSpy: sinon.SinonSpy;
  const eventType = 'testEvent';
  const eventParams = { key: 'testKey', entry: { value: 'testValue' }, type: EventType.Get };

  beforeEach(() => {
    eventSystem = new EventSystem();
    listenerSpy = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('addListener and removeListener', () => {
    it('should add a listener for an event and remove it', () => {
      // Add listener
      eventSystem.addListener(eventType, listenerSpy);
      expect(eventSystem.getListeners(eventType)).to.include(listenerSpy);

      // Remove listener
      eventSystem.removeListener(eventType, listenerSpy);
      expect(eventSystem.getListeners(eventType)).to.not.include(listenerSpy);
    });

    it('should not throw an error when removing a non-existent listener', () => {
      const nonExistentListener = sinon.spy();
      expect(() => eventSystem.removeListener(eventType, nonExistentListener)).to.not.throw();
    });
    it('should handle removing a listener that was added multiple times', () => {
      eventSystem.addListener(eventType, listenerSpy);
      eventSystem.addListener(eventType, listenerSpy);
      expect(eventSystem.getListeners(eventType)).to.have.lengthOf(1);

      eventSystem.removeListener(eventType, listenerSpy);
      expect(eventSystem.getListeners(eventType)).to.have.lengthOf(0);
    });

    it('should not remove listeners of different events', () => {
      const anotherEventType = 'anotherEvent';
      eventSystem.addListener(eventType, listenerSpy);
      const anotherListenerSpy = sinon.spy();
      eventSystem.addListener(anotherEventType, anotherListenerSpy);

      eventSystem.removeListener(eventType, listenerSpy);
      expect(eventSystem.getListeners(eventType)).to.have.lengthOf(0);
      expect(eventSystem.getListeners(anotherEventType)).to.include(anotherListenerSpy);
    });
  });

  describe('getListeners and getAllEvents', () => {
    it('should retrieve all listeners for a specific event', () => {
      eventSystem.addListener(eventType, listenerSpy);
      const listeners = eventSystem.getListeners(eventType);
      expect(listeners).to.have.lengthOf(1);
      expect(listeners).to.include(listenerSpy);
    });

    it('should return an empty array if there are no listeners for an event', () => {
      const listeners = eventSystem.getListeners('nonExistentEvent');
      expect(listeners).to.be.an('array').that.is.empty;
    });

    it('should return an empty array for getAllEvents when no events have listeners', () => {
      const allEvents = eventSystem.getAllEvents();
      expect(allEvents).to.be.an('array').that.is.empty;
    });
  });

  describe('emit', () => {
    it('should not throw an error when emitting an event with no listeners', () => {
      expect(() => eventSystem.emit(eventParams)).to.not.throw();
    });

    it('should not throw an error when emitting an event with no listeners', () => {
      expect(() => eventSystem.emit(eventParams)).to.not.throw();
    });
  });
});
