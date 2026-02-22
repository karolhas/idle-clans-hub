import { useQuery } from "@tanstack/react-query";

interface AnalyticsResponse {
  views: number;
}

async function fetchMonthlyViews(): Promise<AnalyticsResponse> {
  const res = await fetch('/api/analytics');
  return res.json();
}

export function useMonthlyViewsQuery() {
  return useQuery<AnalyticsResponse, Error>({
    queryKey: ['monthly-views'],
    queryFn: fetchMonthlyViews,
    refetchInterval: 1000 * 60 * 15,
  });
}
