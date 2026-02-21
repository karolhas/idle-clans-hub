"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import { fetchLatestMarketPrices, fetchItemComprehensive } from "@/lib/api/market";
import {
    computeGameSell,
    getIndexedItem,
    getItemsIndex,
    findVolumeAtLowest,
    getNegotiationPotionId,
} from "@/utils/market";
import type {
    ItemComprehensive,
    LatestPriceEntry,
    ProfitableRow,
    UnderpricedRow,
} from "@/types/market.types";

interface UseMarketPricesQueryResult {
    loading: boolean;
    error: string | null;
    profitable: ProfitableRow[];
    underpriced: UnderpricedRow[];
    refresh: () => void;
    fetchVolumeFor: (itemId: number) => Promise<{
        volumeAtLowest: number | null;
        details: ItemComprehensive | null;
    }>;
    autoPotionCost: number;
}

export function useMarketPricesQuery(
    clan10: boolean,
    potion5: boolean
): UseMarketPricesQueryResult {
    const { data: latest = [], isFetching, error, refetch } = useQuery<LatestPriceEntry[], Error>({
        queryKey: ["market", "prices"],
        queryFn: () => fetchLatestMarketPrices(true),
        // Market data has no stale time — always refetch on mount for real-time prices
        staleTime: 0,
        gcTime: 60 * 1000,
    });

    const autoPotionCost = useMemo(() => {
        const potionId = getNegotiationPotionId();
        if (potionId == null) return 0;
        const entry = latest.find((e) => e.itemId === potionId);
        return typeof entry?.lowestSellPrice === "number" && entry.lowestSellPrice > 0
            ? entry.lowestSellPrice
            : 0;
    }, [latest]);

    const { profitable, underpriced } = useMemo(() => {
        const profitableRows: ProfitableRow[] = [];
        const underpricedRows: UnderpricedRow[] = [];

        getItemsIndex();

        for (const entry of latest) {
            const base =
                entry && typeof entry.itemId === "number"
                    ? getIndexedItem(entry.itemId)
                    : undefined;
            if (!base) continue;

            const lowest =
                typeof entry.lowestSellPrice === "number" && entry.lowestSellPrice > 0
                    ? entry.lowestSellPrice
                    : null;
            if (!lowest) continue;

            const avg =
                typeof entry.dailyAveragePrice === "number" && entry.dailyAveragePrice > 0
                    ? entry.dailyAveragePrice
                    : null;

            const gameSell = computeGameSell(base.value, clan10, potion5);

            const canSell = base.canSellToGame !== false;
            const profitEach = gameSell - lowest;
            if (canSell && profitEach > 0) {
                profitableRows.push({
                    itemId: base.id,
                    name: base.name,
                    baseValue: base.value,
                    gameSell,
                    currentPrice: lowest,
                    profitEach,
                    profitPercent: (profitEach / lowest) * 100,
                    volume:
                        typeof entry.lowestPriceVolume === "number"
                            ? entry.lowestPriceVolume
                            : null,
                });
            }

            if (avg && lowest < avg) {
                underpricedRows.push({
                    itemId: base.id,
                    name: base.name,
                    averagePrice1d: avg,
                    currentPrice: lowest,
                    priceRatio: (lowest / avg) * 100,
                    priceDiff: avg - lowest,
                    volume:
                        typeof entry.lowestPriceVolume === "number"
                            ? entry.lowestPriceVolume
                            : null,
                });
            }
        }

        return { profitable: profitableRows, underpriced: underpricedRows };
    }, [latest, clan10, potion5]);

    const fetchVolumeFor = useCallback(async (itemId: number) => {
        let data: ItemComprehensive | null = null;
        try {
            data = await fetchItemComprehensive(itemId);
        } catch (err) {
            console.error("Error fetching volume for item", itemId, err);
            return { volumeAtLowest: null, details: null };
        }
        const volumeAtLowest = findVolumeAtLowest(data?.lowestPrices);
        return { volumeAtLowest, details: data };
    }, []);

    return {
        loading: isFetching,
        error: error?.message ?? null,
        profitable,
        underpriced,
        refresh: refetch,
        fetchVolumeFor,
        autoPotionCost,
    };
}
