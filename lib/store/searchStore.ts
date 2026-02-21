import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Player } from '@/types/player.types';

interface SearchState {
    playerSearchQuery: string;
    clanSearchQuery: string;
    latestPlayerLookup: Player | null;
    setPlayerSearchQuery: (query: string) => void;
    setClanSearchQuery: (query: string) => void;
    setLatestPlayerLookup: (player: Player | null) => void;
}

export const useSearchStore = create<SearchState>()(
    persist(
        (set) => ({
            playerSearchQuery: '',
            clanSearchQuery: '',
            latestPlayerLookup: null,
            setPlayerSearchQuery: (query: string) =>
                set({ playerSearchQuery: query }),
            setClanSearchQuery: (query: string) =>
                set({ clanSearchQuery: query }),
            setLatestPlayerLookup: (player: Player | null) =>
                set({ latestPlayerLookup: player }),
        }),
        {
            name: 'search-store',
            partialize: (state) => ({
                playerSearchQuery: state.playerSearchQuery,
                clanSearchQuery: state.clanSearchQuery,
            }),
        }
    )
);
