import { ref, watch, onUnmounted, isRef, unref, type Ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';

interface SWROptions<T = any> {
  dedupingInterval?: number; // Cache validity duration (ms), default 2000ms
  revalidateOnFocus?: boolean; // Revalidate when page shows, default true
  revalidateOnReconnect?: boolean; // Revalidate on network reconnect, default true
  revalidateIfStale?: boolean; // Revalidate even if cache exists (stale-while-revalidate), default true
  initialData?: T; // Initial data
  onSuccess?: (data: T, key: string) => void;
  onError?: (err: any, key: string) => void;
}

interface SWRResponse<T = any> {
  data: Ref<T | undefined>;
  error: Ref<any>;
  isLoading: Ref<boolean>;
  isValidating: Ref<boolean>;
  mutate: (data?: T, shouldRevalidate?: boolean) => Promise<T | undefined>;
}

// Global memory cache to share data between components
const globalCache = new Map<string, { data: any; timestamp: number }>();

// Persistent cache helper
const getPersistentCache = (key: string) => {
  try {
    const value = uni.getStorageSync(`swr_cache_${key}`);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const setPersistentCache = (key: string, data: any) => {
  try {
    // Implement simple LRU for Bazi calculation results (max 1 - current only)
    if (key.includes('/api/bazi/calculate/profile/')) {
      const BAZI_CACHE_INDEX_KEY = 'swr_bazi_keys_index';
      let baziKeys: string[] = [];
      try {
        const stored = uni.getStorageSync(BAZI_CACHE_INDEX_KEY);
        baziKeys = stored ? JSON.parse(stored) : [];
      } catch {
        baziKeys = [];
      }

      // Remove current key if exists (to move to end)
      baziKeys = baziKeys.filter((k) => k !== key);

      // Add to end
      baziKeys.push(key);

      // Enforce limit of 1 (current only)
      while (baziKeys.length > 1) {
        const toRemove = baziKeys.shift();
        if (toRemove) {
          try {
            uni.removeStorageSync(`swr_cache_${toRemove}`);
            // globalCache.delete(toRemove); // Keep in memory for session speed, only clear storage
          } catch (e) {
            console.error('Failed to remove old Bazi cache:', e);
          }
        }
      }

      // Save index
      uni.setStorageSync(BAZI_CACHE_INDEX_KEY, JSON.stringify(baziKeys));
    }

    uni.setStorageSync(`swr_cache_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('SWR Cache Write Error:', e);
    // Optional: Clear all cache if quota exceeded to recover?
    // uni.clearStorageSync();
  }
};

export const clearSWRCache = (key: string) => {
  globalCache.delete(key);
  try {
    uni.removeStorageSync(`swr_cache_${key}`);
  } catch (e) {
    console.error('SWR Cache Clear Error:', e);
  }
};

export function useSWR<T = any>(
  key: string | (() => string | null | undefined),
  fetcher: () => Promise<any>,
  options: SWROptions<T> = {},
  dependencies: Ref<any>[] = [], // Allow passing dependencies to trigger re-fetch
): SWRResponse<T> {
  const {
    dedupingInterval = 2000,
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    revalidateIfStale = true,
    initialData,
    onSuccess,
    onError,
  } = options;

  // Resolve key using computed to automatically track dependencies
  const resolvedKey = computed(() => {
    if (typeof key === 'function') {
      try {
        const k = key();
        // console.log('[useSWR] Resolved key:', k);
        return k;
      } catch (e) {
        console.error('[useSWR] Key resolution error:', e);
        return null;
      }
    }
    return key;
  });

  const currentKey = ref(resolvedKey.value);

  const data = ref<T | undefined>(initialData) as Ref<T | undefined>;
  const error = ref<any>(undefined);
  const isValidating = ref(false);
  const isLoading = ref(!initialData);

  // Initialize from cache
  const initFromCache = (keyVal: string) => {
    // 1. Try memory cache first
    if (globalCache.has(keyVal)) {
      const cached = globalCache.get(keyVal);
      // console.log('[useSWR] Memory cache hit:', keyVal, cached);
      if (cached) {
        data.value = cached.data;
        isLoading.value = false;
        return;
      }
    } else {
      // console.log('[useSWR] Memory cache miss:', keyVal);
    }

    // 2. Try persistent storage
    const persistent = getPersistentCache(keyVal);
    if (persistent) {
      data.value = persistent;
      // Populate memory cache
      globalCache.set(keyVal, { data: persistent, timestamp: Date.now() });
      isLoading.value = false;
    }
  };

  if (currentKey.value) {
    initFromCache(currentKey.value);
  }

  // Fetch Logic
  const fetchData = async (force = false) => {
    const keyVal = currentKey.value;
    // console.log('[useSWR] fetchData called for key:', keyVal, 'force:', force);
    if (!keyVal) return;

    // Deduping check
    if (!force && globalCache.has(keyVal)) {
      const cached = globalCache.get(keyVal);
      if (cached) {
        // If we have cache and revalidateIfStale is false, skip fetch
        if (!revalidateIfStale && data.value !== undefined) {
          isLoading.value = false;
          return;
        }

        if (Date.now() - cached.timestamp < dedupingInterval) {
          // console.log('[useSWR] Cache hit (deduping), skipping fetch:', keyVal);
          // Valid cache, skip fetch unless no data locally
          if (data.value !== undefined) return;
        }
      }
    }

    isValidating.value = true;
    if (data.value === undefined) isLoading.value = true;

    try {
      // console.log('[useSWR] Fetching data for key:', keyVal);
      const result = await fetcher();
      // Handle result structure (axios response)
      const finalData = result.data !== undefined ? result.data : result;

      data.value = finalData;
      error.value = undefined;

      // Update Cache
      globalCache.set(keyVal, { data: finalData, timestamp: Date.now() });
      setPersistentCache(keyVal, finalData);

      if (onSuccess) onSuccess(finalData, keyVal);
    } catch (err) {
      console.error('[useSWR] Fetch error:', err);
      error.value = err;
      if (onError) onError(err, keyVal);
    } finally {
      isValidating.value = false;
      isLoading.value = false;
    }
  };

  // Watch key changes
  watch([resolvedKey, ...dependencies], ([newKey]) => {
    if (newKey !== currentKey.value) {
      // console.log('[useSWR] Key changed from', currentKey.value, 'to', newKey);
      currentKey.value = newKey;

      // Reset data to initialData when key changes
      // This prevents showing stale data from previous key while loading new data
      data.value = initialData;
      error.value = undefined;
      isLoading.value = true;

      // Let's try to load from cache for new key
      if (newKey) {
        initFromCache(newKey);
        fetchData();
      }
    }
  });

  // Initial fetch
  if (currentKey.value) {
    fetchData();
  }

  // Revalidate on focus
  if (revalidateOnFocus) {
    onShow(() => {
      if (currentKey.value) {
        fetchData();
      }
    });
  }

  // Mutate function
  const mutate = async (newData?: T, shouldRevalidate = true) => {
    const keyVal = currentKey.value;
    if (!keyVal) return;

    if (newData !== undefined) {
      data.value = newData;
      globalCache.set(keyVal, { data: newData, timestamp: Date.now() });
      setPersistentCache(keyVal, newData);
    }

    if (shouldRevalidate) {
      await fetchData(true);
    }

    return data.value;
  };

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}
