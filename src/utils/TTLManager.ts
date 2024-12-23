export class TTLManager<K> {
  private expiryMap: Map<K, number>;

  constructor() {
    this.expiryMap = new Map();
  }
  setTTL(key: K, ttl: number): void {
    if (ttl <= 0) {
      throw new Error('TTL must be greater than 0');
    }
    this.expiryMap.set(key, Date.now() + ttl);
  }
  isExpired(key: K): boolean {
    const expiry = this.expiryMap.get(key);
    if (expiry === undefined) return false;

    if (expiry < Date.now()) {
      this.expiryMap.delete(key);
      return true;
    }
    return false;
  }
  clearTTL(key: K): void {
    this.expiryMap.delete(key);
  }

  // Clears all TTLs
  clearAll(): void {
    this.expiryMap.clear();
  }
}
