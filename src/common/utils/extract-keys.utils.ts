import { EVENT_TYPE_PREFIX, INTERNAL_EVENT_PREFIX, INTERNAL_PREFIX, KEY_PREFIX } from '../constants';
import { EventType } from '../enums';

/**
 * Extracts the event type and the optional key from a structured event key.
 * @param eventKey - The event key to extract from.
 * @returns An object containing the event type and the optional key.
 */
export const extractKey = (eventKey: string): { event: EventType; key?: string } => {
  // Ensure the key starts with the expected prefix
  if (!eventKey.startsWith(INTERNAL_PREFIX + INTERNAL_EVENT_PREFIX)) {
    throw new Error('Invalid event key format');
  }

  // Remove the prefix part to extract the main event type and optional key
  const keyPartStart = `${INTERNAL_PREFIX}${INTERNAL_EVENT_PREFIX}${EVENT_TYPE_PREFIX}`;
  const remainingKey = eventKey.slice(keyPartStart.length);

  // Extract the event type
  const eventType = remainingKey.split(':')[0] as EventType;

  // Extract the optional key if present
  const keyPart = remainingKey.split(':')[1];
  const key = keyPart && keyPart.startsWith(KEY_PREFIX) ? keyPart.slice(KEY_PREFIX.length) : undefined;

  return { event: eventType, key };
};
