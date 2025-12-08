const CACHE_VERSION = '1.0.0';
const CACHE_PREFIX = 'lulu_k_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

interface CacheData<T> {
  version: string;
  timestamp: number;
  data: T;
}

export function saveToCache<T>(key: string, data: T): void {
  try {
    const cacheData: CacheData<T> = {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      data,
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Failed to save to cache:', error);
  }
}

export function getFromCache<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (!cached) return null;

    const cacheData: CacheData<T> = JSON.parse(cached);

    if (cacheData.version !== CACHE_VERSION) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    if (Date.now() - cacheData.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return cacheData.data;
  } catch (error) {
    console.error('Failed to get from cache:', error);
    return null;
  }
}
