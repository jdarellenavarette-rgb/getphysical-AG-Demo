import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCorrelationCode,
  createEmptyState,
  createErrorState,
  createLoadingState,
  createNoInternetState,
  createSuccessState,
  type SodiaPostRow,
  type TenStateEnvelope,
} from "sodia-core";
import { useEcosystemStore } from "../store/ecosystemStore";

export const FEED_QUERY_KEY = ["sodia", "feed"] as const;

/**
 * Sodia feed read-model. The ecosystem store is the local source of truth
 * (optimistic writes such as addPost land there first); TanStack Query owns
 * caching, refetch and offline semantics, and is kept in sync with the store.
 */
export function useFeedQuery() {
  const posts = useEcosystemStore((s) => s.posts);
  const isOffline = useEcosystemStore((s) => s.isOffline);
  const client = useQueryClient();

  const query = useQuery({
    queryKey: FEED_QUERY_KEY,
    queryFn: async (): Promise<readonly SodiaPostRow[]> => useEcosystemStore.getState().posts,
    initialData: posts,
  });

  useEffect(() => {
    client.setQueryData(FEED_QUERY_KEY, posts);
  }, [client, posts]);

  const data = query.data ?? posts;
  let state: TenStateEnvelope<readonly SodiaPostRow[]>;
  if (isOffline) state = createNoInternetState(data, { cachedAtIso: new Date(query.dataUpdatedAt).toISOString() });
  else if (query.isError) state = createErrorState(createCorrelationCode("FEED"), "We couldn't refresh your feed.", true, data);
  else if (query.isPending) state = createLoadingState(3);
  else if (data.length === 0) state = createEmptyState("Your feed is quiet. Share a workout or find athletes to follow.", "Create your first post");
  else state = createSuccessState(data);

  return { state, refetch: query.refetch, isRefetching: query.isRefetching };
}
