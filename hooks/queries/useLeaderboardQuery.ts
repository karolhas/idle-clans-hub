import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import { fetchLeaderboard } from "@/lib/api/apiService";
import type {
    GameMode,
    LeaderboardStat,
    EntityType,
    LeaderboardCategory,
    LeaderboardData,
    LeaderboardEntry,
} from "@/types/leaderboard.types";

const MAX_COUNT = 100;

interface UseLeaderboardQueryResult {
    entries: LeaderboardEntry[];
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    hasMore: boolean;
    loadMoreData: () => void;
    dataSource: "cache" | "api" | null;
    lastUpdated: Date | null;
    forceRefresh: () => void;
}

export function useLeaderboardQuery(
    gameMode: GameMode,
    entityType: EntityType,
    category: LeaderboardCategory,
    stat: LeaderboardStat | null,
): UseLeaderboardQueryResult {
    const {
        data,
        isFetching,
        isFetchingNextPage,
        error,
        hasNextPage,
        fetchNextPage,
        refetch,
        dataUpdatedAt,
        isFetchedAfterMount,
    } = useInfiniteQuery<LeaderboardData, Error>({
        queryKey: ["leaderboard", gameMode, entityType, category, stat],
        queryFn: ({ pageParam }) =>
            fetchLeaderboard(gameMode, entityType, category, stat!, pageParam as number, MAX_COUNT),
        initialPageParam: 1,
        getNextPageParam: (lastPage, _allPages, lastPageParam) => {
            if (entityType === "clan") return undefined;
            return lastPage.entries.length === MAX_COUNT
                ? (lastPageParam as number) + MAX_COUNT
                : undefined;
        },
        enabled: stat !== null,
        staleTime: 30 * 60 * 1000,
    });

    const entries = useMemo<LeaderboardEntry[]>(
        () => data?.pages.flatMap((page) => page.entries) ?? [],
        [data]
    );

    const isLoading = isFetching && !isFetchingNextPage;

    const dataSource: "cache" | "api" | null = data
        ? isFetchedAfterMount
            ? "api"
            : "cache"
        : null;

    const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

    const loadMoreData = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const forceRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    return {
        entries,
        loading: isLoading,
        loadingMore: isFetchingNextPage,
        error: error?.message ?? null,
        hasMore: hasNextPage ?? false,
        loadMoreData,
        dataSource,
        lastUpdated,
        forceRefresh,
    };
}
