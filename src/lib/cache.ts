/**
 * Smart Caching System for Firebase
 * Reduces read operations while preserving real-time features
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

interface CacheConfig {
    ttl: number; // Time to live in milliseconds
    useLocalStorage?: boolean; // Persist to localStorage
}

// Default TTLs for different collections (in milliseconds)
export const CACHE_TTL = {
    COURSES: 5 * 60 * 1000,        // 5 minutes
    TRAINERS: 10 * 60 * 1000,      // 10 minutes
    SHOWCASE: 10 * 60 * 1000,      // 10 minutes
    ANNOUNCEMENTS: 5 * 60 * 1000,  // 5 minutes
    MODULES: 5 * 60 * 1000,        // 5 minutes
    ENROLLMENTS: 2 * 60 * 1000,    // 2 minutes
    STATS: 5 * 60 * 1000,          // 5 minutes
} as const;

// In-memory cache store
const memoryCache = new Map<string, CacheEntry<any>>();

// localStorage key prefix
const LS_PREFIX = "artvince_cache_";

/**
 * Check if we're in a browser environment
 */
const isBrowser = typeof window !== "undefined";

/**
 * Get item from cache
 */
export function getFromCache<T>(key: string): T | null {
    // Try memory cache first
    const memEntry = memoryCache.get(key);
    if (memEntry) {
        if (Date.now() - memEntry.timestamp < memEntry.ttl) {
            return memEntry.data as T;
        }
        // Expired, remove from memory
        memoryCache.delete(key);
    }

    // Try localStorage
    if (isBrowser) {
        try {
            const stored = localStorage.getItem(LS_PREFIX + key);
            if (stored) {
                const entry: CacheEntry<T> = JSON.parse(stored);
                if (Date.now() - entry.timestamp < entry.ttl) {
                    // Restore to memory cache
                    memoryCache.set(key, entry);
                    return entry.data;
                }
                // Expired, remove from localStorage
                localStorage.removeItem(LS_PREFIX + key);
            }
        } catch (e) {
            console.warn("Cache read error:", e);
        }
    }

    return null;
}

/**
 * Set item in cache
 */
export function setInCache<T>(key: string, data: T, config: CacheConfig): void {
    const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: config.ttl,
    };

    // Store in memory
    memoryCache.set(key, entry);

    // Optionally persist to localStorage
    if (config.useLocalStorage && isBrowser) {
        try {
            localStorage.setItem(LS_PREFIX + key, JSON.stringify(entry));
        } catch (e) {
            console.warn("Cache write error:", e);
        }
    }
}

/**
 * Clear specific cache key
 */
export function clearCache(key: string): void {
    memoryCache.delete(key);
    if (isBrowser) {
        localStorage.removeItem(LS_PREFIX + key);
    }
}

/**
 * Clear cache by prefix (e.g., clear all "courses_" entries)
 */
export function clearCacheByPrefix(prefix: string): void {
    // Clear memory cache
    for (const key of memoryCache.keys()) {
        if (key.startsWith(prefix)) {
            memoryCache.delete(key);
        }
    }

    // Clear localStorage
    if (isBrowser) {
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith(LS_PREFIX + prefix)) {
                localStorage.removeItem(key);
            }
        }
    }
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
    memoryCache.clear();
    if (isBrowser) {
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith(LS_PREFIX)) {
                localStorage.removeItem(key);
            }
        }
    }
}

/**
 * Generate cache key from collection and query params
 */
export function generateCacheKey(collection: string, params?: Record<string, any>): string {
    if (!params) return collection;
    const sortedParams = Object.keys(params)
        .sort()
        .map(k => `${k}=${JSON.stringify(params[k])}`)
        .join("&");
    return `${collection}_${sortedParams}`;
}

/**
 * Check if cache is stale but usable (for stale-while-revalidate pattern)
 */
export function isCacheStale(key: string): boolean {
    const memEntry = memoryCache.get(key);
    if (!memEntry) return true;
    return Date.now() - memEntry.timestamp > memEntry.ttl * 0.8; // 80% of TTL
}
