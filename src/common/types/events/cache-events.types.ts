export type EventParams<K, V> = {
  key: K;
  value: V;
};
export type EventCallback<K, V> = (key: K, value?: V) => void;
