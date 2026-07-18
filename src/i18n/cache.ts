interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

export interface CacheConfig {
  maxSize?: number;
  defaultTTL?: number;
  enabled?: boolean;
}

export class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private hits = 0;
  private misses = 0;
  private evictions = 0;

  readonly config: Required<CacheConfig>;

  constructor(config: CacheConfig = {}) {
    this.config = {
      maxSize: config.maxSize ?? 1000,
      defaultTTL: config.defaultTTL ?? 5 * 60 * 1000,
      enabled: config.enabled ?? true,
    };
  }

  get(key: string): T | null {
    if (!this.config.enabled) return null;
    const entry = this.cache.get(key);
    if (!entry) { this.misses++; return null; }
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }
    this.cache.delete(key);
    this.cache.set(key, entry);
    this.hits++;
    return entry.value;
  }

  set(key: string, value: T, ttl?: number): void {
    if (!this.config.enabled) return;
    if (this.cache.size >= this.config.maxSize) {
      const first = this.cache.keys().next().value;
      if (first) { this.cache.delete(first); this.evictions++; }
    }
    this.cache.set(key, { value, timestamp: Date.now(), ttl: ttl ?? this.config.defaultTTL });
  }

  clear(): void { this.cache.clear(); }
  size(): number { return this.cache.size; }
}