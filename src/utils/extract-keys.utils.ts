import { EVENT_TYPE_PREFIX, INTERNAL_EVENT_PREFIX, INTERNAL_NAMESPACE_PREFIX, INTERNAL_PREFIX, KEY_PREFIX } from '../common/constants';
import { CacheErrorCodes, EventType } from '../common/enums';
import { CacheExceptionFactory } from '../errors';

/**
 * Extracts the event type and the optional key from a structured event key.
 * @param eventKey - The event key to extract from.
 * @returns An object containing the event type and the optional key.
 */
export const extractEventKey = (eventKey: string): { event: EventType; key?: string } => {
  if (!eventKey.startsWith(INTERNAL_PREFIX + INTERNAL_EVENT_PREFIX)) {
    throw CacheExceptionFactory.createException(CacheErrorCodes.INVALID_KEY_FORMAT, 'Invalid event key format. The key must start with the correct internal event prefix.', {
      providedKey: eventKey,
      expectedPrefix: INTERNAL_PREFIX + INTERNAL_EVENT_PREFIX,
    });
  }

  // Remove the prefix part to extract the main event type and optional key
  const keyPartStart = `${INTERNAL_PREFIX}${INTERNAL_EVENT_PREFIX}${EVENT_TYPE_PREFIX}`;
  const remainingKey = eventKey.slice(keyPartStart.length);

  // Extract the event type
  const eventType = remainingKey.split(':')[0] as EventType;

  // Validate if the extracted event type is valid
  if (!Object.values(EventType).includes(eventType)) {
    throw CacheExceptionFactory.createException(CacheErrorCodes.INVALID_KEY_FORMAT, `Invalid event type extracted: "${eventType}". Must be one of ${Object.values(EventType).join(', ')}.`, {
      extractedEventType: eventType,
    });
  }
  // Extract the optional key if present
  const keyPart = remainingKey.split(':')[1];
  const key = keyPart && keyPart.startsWith(KEY_PREFIX) ? keyPart.slice(KEY_PREFIX.length) : undefined;

  return { event: eventType, key };
};
export const extractNamespaceKey = <K>(key: string): { namespace: string; key?: K } => {
  if (!key.startsWith(INTERNAL_PREFIX + INTERNAL_NAMESPACE_PREFIX)) {
    throw CacheExceptionFactory.createException(CacheErrorCodes.INVALID_KEY_FORMAT, 'Invalid namespace key format. The key must start with the correct internal namespace prefix.', {
      providedKey: key,
      expectedPrefix: INTERNAL_PREFIX + INTERNAL_NAMESPACE_PREFIX,
    });
  }

  const keyPartStart = `${INTERNAL_PREFIX}${INTERNAL_NAMESPACE_PREFIX}`;
  const remainingKey = key.slice(keyPartStart.length);

  const [namespace, keyPart] = remainingKey.split(':');
  
  if (!namespace) {
    throw CacheExceptionFactory.createException(CacheErrorCodes.INVALID_KEY_FORMAT, 'Namespace extraction failed. The key does not contain a valid namespace.', { providedKey: key });
  }

  const extractedKey = keyPart && keyPart.startsWith(KEY_PREFIX) ? keyPart.slice(KEY_PREFIX.length) : undefined;

  return { namespace, key: extractedKey as K };
};
export const namespaceKey = (key: string) => {
  return key.startsWith(INTERNAL_PREFIX + INTERNAL_NAMESPACE_PREFIX) ?? false;
};
