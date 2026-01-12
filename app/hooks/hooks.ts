"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/app/store/hooks";
import { setUser } from "@/app/store/slices/authSlice";
import { me } from "@/app/actions";
import { roleDashboardRoute } from "@/app/utils/utils";
import api from "@/app/api";
import { RoleOps } from "@/app/types";

export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

export function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  onClose: () => void
) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!ref.current) return;

      if (!ref.current.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

export function useAuthBootstrap() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    const bootstrap = async () => {
      try {
        let res = await me();

        if (res.status === 401) {
          // Axios: success if no throw
          await api.post("/refresh");
          res = await me();
        }

        if (res.status === 200) {
          const roleName = res.data.activeRole.name as RoleOps;

          dispatch(setUser(res.data));
          router.replace(roleDashboardRoute[roleName]);
        }
      } catch (err) {
        // silently fail → user remains logged out
        console.error("Auth bootstrap failed", err);
      }
    };

    bootstrap();
  }, [dispatch, router]);
}

export type FetchPageResult<T> = {
  items: T[];
  hasMore: boolean;
};

export default function useInfiniteScroll<T>({
  fetchPage,
  initialPage = 1,
  initialLimit = 20,
  deps = [],
  autoLoad = true,
}: {
  fetchPage: (opts: {
    page: number;
    limit: number;
  }) => Promise<FetchPageResult<T>>;
  initialPage?: number;
  initialLimit?: number;
  deps?: any[]; // dependencies that reset the pagination (filters, search)
  autoLoad?: boolean; // whether to auto-load first page on mount / deps change
}) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const loadPage = useCallback(
    async (targetPage: number) => {
      if (isLoading) return;
      setIsLoading(true);
      setIsError(null);
      try {
        const { items: newItems, hasMore: newHasMore } = await fetchPage({
          page: targetPage,
          limit,
        });

        if (!isMountedRef.current) return;

        if (targetPage === initialPage) {
          // first page => replace
          setItems(newItems);
        } else {
          // append
          setItems((prev) => [...prev, ...newItems]);
        }

        setHasMore(Boolean(newHasMore));
        // increment page only if we got items
        if (newItems.length > 0) {
          setPage(targetPage + 1);
        } else {
          // no items, stop further loads
          setHasMore(false);
        }
      } catch (err) {
        setIsError(err as Error);
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    },
    [fetchPage, initialPage, isLoading, limit]
  );

  // reset when deps change
  useEffect(() => {
    setItems([]);
    setPage(initialPage);
    setHasMore(true);
    setIsError(null);

    if (autoLoad) {
      // load first page after reset
      loadPage(initialPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps); // intentionally depends on user-provided deps

  // IntersectionObserver setup
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isLoading && hasMore) {
          // load next page using current page state
          loadPage(page);
        }
      },
      { root: null, rootMargin: "200px", threshold: 0.1 }
    );

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [page, loadPage, isLoading, hasMore]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadPage(page);
    }
  }, [hasMore, isLoading, loadPage, page]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(initialPage);
    setHasMore(true);
    setIsError(null);
    if (autoLoad) {
      loadPage(initialPage);
    }
  }, [initialPage, loadPage, autoLoad]);

  return {
    items,
    isLoading,
    isError,
    hasMore,
    sentinelRef,
    loadMore,
    reset,
  };
}
