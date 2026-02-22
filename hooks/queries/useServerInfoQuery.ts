import { useQuery } from "@tanstack/react-query";
import { fetchServerInfo } from "@/lib/api/apiService";

export function useServerInfoQuery() {
    return useQuery<number, Error>({
        queryKey: ["serverInfo"],
        queryFn: fetchServerInfo,
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
}
