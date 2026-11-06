import { QueryClient, onlineManager } from "@tanstack/react-query";

/**
 * Shared TanStack Query client. `networkMode: "offlineFirst"` lets cached
 * reads resolve and pauses mutations while offline (AGENTS.md §5), replaying
 * them once `onlineManager` reports connectivity again.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: "offlineFirst",
      staleTime: 30_000,
      gcTime: 24 * 60 * 60 * 1000,
      retry: 2,
    },
    mutations: {
      networkMode: "offlineFirst",
      retry: 1,
    },
  },
});

/** Wire the demo offline toggle (ecosystemStore.isOffline) into TanStack's online manager. */
export function setQueryOnline(isOnline: boolean): void {
  onlineManager.setOnline(isOnline);
}
