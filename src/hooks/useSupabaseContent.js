import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient.js";

const listCache = new Map();
const listRequests = new Map();
const SESSION_LIST_CACHE_TTL_MS = 1000 * 60 * 15;
const LOCAL_LIST_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function getStorageCacheKey(cacheKey) {
  return `supabase-list:${cacheKey}`;
}

function readFromStorage(storage, cacheKey, ttlMs) {
  if (!storage) return null;

  try {
    const raw = storage.getItem(getStorageCacheKey(cacheKey));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items) || typeof parsed.timestamp !== "number") {
      return null;
    }

    if (Date.now() - parsed.timestamp > ttlMs) {
      storage.removeItem(getStorageCacheKey(cacheKey));
      return null;
    }

    return parsed.items;
  } catch {
    return null;
  }
}

function readPersistedList(cacheKey) {
  if (typeof window === "undefined") return null;

  return (
    readFromStorage(window.sessionStorage, cacheKey, SESSION_LIST_CACHE_TTL_MS) ||
    readFromStorage(window.localStorage, cacheKey, LOCAL_LIST_CACHE_TTL_MS)
  );
}

function persistList(cacheKey, items) {
  if (typeof window === "undefined") return;

  try {
    const payload = JSON.stringify({ items, timestamp: Date.now() });

    window.sessionStorage.setItem(
      getStorageCacheKey(cacheKey),
      payload,
    );

    window.localStorage.setItem(getStorageCacheKey(cacheKey), payload);
  } catch {
    // Ignore storage quota and serialization errors.
  }
}

export function clearSupabaseListCache() {
  listCache.clear();

  if (typeof window === "undefined") return;

  for (const storage of [window.sessionStorage, window.localStorage]) {
    try {
      for (const key of Array.from({ length: storage.length }, (_, index) => storage.key(index))) {
        if (key && key.startsWith("supabase-list:")) {
          storage.removeItem(key);
        }
      }
    } catch {
      // Ignore storage access errors.
    }
  }
}

function getListCacheKey({ table, orderBy, ascending, select, limit, publishedOnly }) {
  return JSON.stringify({ table, orderBy, ascending, select, limit, publishedOnly });
}

export function useSupabaseList({
  table,
  fallback = [],
  mapper,
  orderBy,
  ascending = false,
  select = "*",
  limit,
  publishedOnly = false,
}) {
  const cacheKey = getListCacheKey({ table, orderBy, ascending, select, limit, publishedOnly });
  const cachedItems = listCache.get(cacheKey) || readPersistedList(cacheKey);

  if (cachedItems && !listCache.has(cacheKey)) {
    listCache.set(cacheKey, cachedItems);
  }

  const [items, setItems] = useState(cachedItems || fallback);
  const [isLoading, setIsLoading] = useState(Boolean(isSupabaseConfigured && !cachedItems));
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadItems() {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }

      const cached = listCache.get(cacheKey);
      if (cached) {
        setItems(cached);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      let request = listRequests.get(cacheKey);

      if (!request) {
        let query = supabase
          .from(table)
          .select(select)
          .order(orderBy, { ascending });

        if (publishedOnly) {
          query = query.not("published_at", "is", null).lte("published_at", new Date().toISOString());
        }

        if (typeof limit === "number") {
          query = query.limit(limit);
        }

        request = query.then(({ data, error: queryError }) => ({
          items: queryError ? null : (data || []).map(mapper),
          error: queryError,
        }));

        listRequests.set(cacheKey, request);
      }

      const result = await request;
      listRequests.delete(cacheKey);

      if (!isMounted) return;

      if (result.error) {
        setError(result.error);
      } else {
        listCache.set(cacheKey, result.items);
        persistList(cacheKey, result.items);
        setItems(result.items);
      }

      setIsLoading(false);
    }

    loadItems();

    return () => {
      isMounted = false;
    };
  }, [ascending, cacheKey, limit, mapper, orderBy, publishedOnly, select, table]);

  return { items, isLoading, error };
}

export function useSupabaseItem({ table, slug, fallback = null, mapper, publishedOnly = false }) {
  const [item, setItem] = useState(fallback);
  const [isLoading, setIsLoading] = useState(Boolean(isSupabaseConfigured));

  useEffect(() => {
    let isMounted = true;

    async function loadItem() {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }

      let query = supabase
        .from(table)
        .select("*")
        .eq("slug", slug);

      if (publishedOnly) {
        query = query.not("published_at", "is", null).lte("published_at", new Date().toISOString());
      }

      const { data, error } = await query.maybeSingle();

      if (!isMounted) return;
      if (!error && data) setItem(mapper(data));
      setIsLoading(false);
    }

    setItem(fallback);
    setIsLoading(Boolean(isSupabaseConfigured));
    loadItem();

    return () => {
      isMounted = false;
    };
  }, [fallback, mapper, publishedOnly, slug, table]);

  return { item, isLoading };
}
