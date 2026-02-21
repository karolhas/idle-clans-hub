import { useQuery } from "@tanstack/react-query";
import { fetchPlayerProfile } from "@/lib/api/apiService";
import type { Player } from "@/types/player.types";

export function usePlayerQuery(username: string | undefined) {
    return useQuery<Player, Error>({
        queryKey: ["player", username],
        queryFn: () => fetchPlayerProfile(username!),
        enabled: Boolean(username?.trim()),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
}
