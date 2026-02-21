import { useQuery } from "@tanstack/react-query";
import { fetchClanByName } from "@/lib/api/apiService";
import { parseClanSkills } from "@/utils/parseClanSkills";
import type { ClanData } from "@/types/clan.types";

export function useClanQuery(clanName: string | undefined) {
    return useQuery<ClanData, Error>({
        queryKey: ["clan", clanName],
        queryFn: async () => {
            const rawData = await fetchClanByName(clanName!);
            return parseClanSkills(rawData);
        },
        enabled: Boolean(clanName?.trim()),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
}
