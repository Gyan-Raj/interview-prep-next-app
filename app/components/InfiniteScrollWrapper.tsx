// InfiniteScrollWrapper.tsx
// Reusable HOC-style wrapper that manages an IntersectionObserver sentinel + UI decoration
// Usage: wrap your list component with <InfiniteScrollWrapper ...> and pass loadMore/isLoading/hasMore

// app/components/infinite-scroll/InfiniteScrollWrapper.tsx
"use client";

import React from "react";
import useInfiniteScroll, { FetchPageResult } from "@/app/hooks/hooks";

type InfiniteScrollWrapperProps<T> = {
  /** Fetcher that loads one page */
  fetchPage: (opts: {
    page: number;
    limit: number;
  }) => Promise<FetchPageResult<T>>;

  /** Render prop: receives items */
  children: (items: T[]) => React.ReactNode;

  /** Pagination config */
  initialPage?: number;
  initialLimit?: number;
  deps?: any[];
  autoLoad?: boolean;

  /** UI decoration */
  loader?: React.ReactNode;
  errorRenderer?: (error: Error) => React.ReactNode;
  noMoreMessage?: React.ReactNode;
  emptyMessage?: React.ReactNode;

  /** Wrapper styles */
  className?: string;
};

export default function InfiniteScrollWrapper<T>({
  fetchPage,
  children,
  initialPage = 1,
  initialLimit = 20,
  deps = [],
  autoLoad = true,
  loader = <div className="text-sm opacity-70">Loading...</div>,
  errorRenderer,
  noMoreMessage = <div className="text-sm opacity-60">No more results.</div>,
  className = "",
  emptyMessage = <div className="text-sm opacity-60">No results found.</div>,
}: InfiniteScrollWrapperProps<T>) {
  const { items, isLoading, isError, hasMore, sentinelRef } =
    useInfiniteScroll<T>({
      fetchPage,
      initialPage,
      initialLimit,
      deps,
      autoLoad,
    });
  if (items.length === 0) return emptyMessage;
  return (
    <div className={`w-full ${className}`}>
      {children(items)}

      <div className="flex flex-col items-center gap-2 py-4">
        {isLoading && loader}

        {isError &&
          (errorRenderer ? (
            errorRenderer(isError)
          ) : (
            <div className="text-sm text-rose-600">
              {isError.message || "Failed to load data"}
            </div>
          ))}

        {!hasMore && !isLoading && !isError && noMoreMessage}

        {/* sentinel controlled by hook */}
        <div ref={sentinelRef} style={{ height: 1 }} />
      </div>
    </div>
  );
}

/*
Example usage (in your Questions page):

<InfiniteScrollWrapper
  loadMore={() => loadMore()} // your fetch function that loads next page
  isLoading={isLoading}
  hasMore={hasMore}
  isError={error}
  resetKey={`${debouncedQuery}-${debouncedRoles.join(",")}-${debouncedCompanies.join(",")}-${debouncedRounds.join(",")}`}
>
  <QuestionsList questions={questions} ... />
</InfiniteScrollWrapper>

Notes:
- Pass `resetKey` composed from your filter/search values so the wrapper resets its observer when filters change.
- Set `manualLoadMore=true` if you prefer a "Load more" button instead of automatic loading.
*/
