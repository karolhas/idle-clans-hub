"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEYS = {
    player: "recentPlayerSearches",
    clan: "recentClanSearches",
} as const;

interface UseRecentSearchesResult {
    searches: string[];
    add: (name: string) => void;
    clear: () => void;
}

export function useRecentSearches(
    type: "player" | "clan",
    limit = 5
): UseRecentSearchesResult {
    const key = STORAGE_KEYS[type];
    const [searches, setSearches] = useState<string[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                setSearches(JSON.parse(saved));
            } catch {
                localStorage.removeItem(key);
            }
        }
    }, [key]);

    useEffect(() => {
        if (searches.length > 0) {
            localStorage.setItem(key, JSON.stringify(searches));
        }
    }, [searches, key]);

    const add = useCallback(
        (name: string) => {
            setSearches((prev) => {
                const updated = prev.includes(name) ? prev : [name, ...prev];
                return updated.slice(0, limit);
            });
        },
        [limit]
    );

    const clear = useCallback(() => {
        setSearches([]);
        localStorage.removeItem(key);
    }, [key]);

    return { searches, add, clear };
}
