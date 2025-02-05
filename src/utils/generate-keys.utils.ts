import { EVENT_TYPE_PREFIX, INTERNAL_EVENT_PREFIX, INTERNAL_PREFIX, KEY_PREFIX, INTERNAL_NAMESPACE_PREFIX } from '../common/constants';
import { EventType } from '../common/enums';

/**
 * Generates a event key with structured components for easy extraction.
 * @param event - The name/type of the event.
 * @param key - Optional: A specific key related to the event.
 * @returns A structured, unique event key.
 */
export const generateEventKey = (event: EventType, key?: string): string => {
  // Base event key with event type
  const eventKey = `${INTERNAL_PREFIX}${INTERNAL_EVENT_PREFIX}${EVENT_TYPE_PREFIX}${event}`;
  // Optional parts of the key
  const keyPart = key ? `:${KEY_PREFIX}${key}` : '';

  // Combine all parts into a single event key
  return `${eventKey}${keyPart}`;
};

export const generateNamespaceKey = <K>(perfix: string, key?: K) => {
  const keyPart = key ? `:${KEY_PREFIX}${key}` : '';
  return perfix + keyPart;
};
export const generatePrefixNamespaceKey = (namespace: string) => {
  return INTERNAL_PREFIX + INTERNAL_NAMESPACE_PREFIX + namespace;
};
