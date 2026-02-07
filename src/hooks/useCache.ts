"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    getDocs,
    QueryConstraint,
    DocumentData,
    getDoc,
    doc
} from "firebase/firestore";
import {
    getFromCache,
    setInCache,
    generateCacheKey,
    isCacheStale,
    CACHE_TTL
} from "@/lib/cache";

interface UseCachedQueryOptions {
    ttl?: number;
    useLocalStorage?: boolean;
    enabled?: boolean;
}

interface UseCachedQueryResult<T> {
    data: T[];
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
    isFromCache: boolean;
}

/**
 * Hook for cached Firestore collection queries
 * Reduces read operations by caching results
 */
export function useCachedQuery<T = DocumentData>(
    collectionName: string,
    constraints: QueryConstraint[] = [],
    options: UseCachedQueryOptions = {}
): UseCachedQueryResult<T> {
    const {
        ttl = CACHE_TTL.COURSES,
        useLocalStorage = true,
        enabled = true
    } = options;

    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isFromCache, setIsFromCache] = useState(false);

    // Generate cache key based on collection and constraints
    const cacheKey = generateCacheKey(collectionName, {
        constraints: constraints.map(c => c.toString())
    });

    const fetchData = useCallback(async (forceRefresh = false) => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        // Check cache first (unless forcing refresh)
        if (!forceRefresh) {
            const cached = getFromCache<T[]>(cacheKey);
            if (cached) {
                setData(cached);
                setLoading(false);
                setIsFromCache(true);

                // If cache is stale, fetch in background (stale-while-revalidate)
                if (isCacheStale(cacheKey)) {
                    fetchFromFirestore(true);
                }
                return;
            }
        }

        await fetchFromFirestore(false);
    }, [cacheKey, enabled]);

    const fetchFromFirestore = async (isBackground: boolean) => {
        if (!isBackground) {
            setLoading(true);
        }

        try {
            const q = query(collection(db, collectionName), ...constraints);
            const snapshot = await getDocs(q);
            const results = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as T[];

            setData(results);
            setError(null);
            setIsFromCache(false);

            // Store in cache
            setInCache(cacheKey, results, { ttl, useLocalStorage });
        } catch (e) {
            setError(e as Error);
        } finally {
            if (!isBackground) {
                setLoading(false);
            }
        }
    };

    const refresh = useCallback(async () => {
        await fetchData(true);
    }, [fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refresh, isFromCache };
}

interface UseCachedDocOptions {
    ttl?: number;
    useLocalStorage?: boolean;
    enabled?: boolean;
}

interface UseCachedDocResult<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
    isFromCache: boolean;
}

/**
 * Hook for cached single Firestore document
 */
export function useCachedDoc<T = DocumentData>(
    collectionName: string,
    docId: string | undefined,
    options: UseCachedDocOptions = {}
): UseCachedDocResult<T> {
    const {
        ttl = CACHE_TTL.COURSES,
        useLocalStorage = true,
        enabled = true
    } = options;

    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isFromCache, setIsFromCache] = useState(false);

    const cacheKey = `${collectionName}_doc_${docId}`;

    const fetchData = useCallback(async (forceRefresh = false) => {
        if (!enabled || !docId) {
            setLoading(false);
            return;
        }

        // Check cache first
        if (!forceRefresh) {
            const cached = getFromCache<T>(cacheKey);
            if (cached) {
                setData(cached);
                setLoading(false);
                setIsFromCache(true);

                if (isCacheStale(cacheKey)) {
                    fetchFromFirestore(true);
                }
                return;
            }
        }

        await fetchFromFirestore(false);
    }, [cacheKey, docId, enabled]);

    const fetchFromFirestore = async (isBackground: boolean) => {
        if (!docId) return;

        if (!isBackground) {
            setLoading(true);
        }

        try {
            const docRef = doc(db, collectionName, docId);
            const snapshot = await getDoc(docRef);

            if (snapshot.exists()) {
                const result = { id: snapshot.id, ...snapshot.data() } as T;
                setData(result);
                setInCache(cacheKey, result, { ttl, useLocalStorage });
            } else {
                setData(null);
            }

            setError(null);
            setIsFromCache(false);
        } catch (e) {
            setError(e as Error);
        } finally {
            if (!isBackground) {
                setLoading(false);
            }
        }
    };

    const refresh = useCallback(async () => {
        await fetchData(true);
    }, [fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refresh, isFromCache };
}
