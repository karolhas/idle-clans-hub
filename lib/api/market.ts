import axios from 'axios';
import type { ItemComprehensive, LatestPricesResponse } from '@/types/market.types';
import { API_BASE_URL, MARKET_TIMEOUT } from './config';

export const fetchLatestMarketPrices = async (
  includeAveragePrice: boolean = true
): Promise<LatestPricesResponse> => {
  const url = `${API_BASE_URL}/PlayerMarket/items/prices/latest`;
  try {
    const response = await axios.get(url, {
      params: { includeAveragePrice, _: Date.now() },
      timeout: MARKET_TIMEOUT,
      headers: {
        // bypass browser cache for real-time prices
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
    return (response.data ?? []) as LatestPricesResponse;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Market request timed out');
      }
      const msg = error.response?.data?.message || 'Failed to load market prices';
      throw new Error(msg);
    }
    throw new Error('Failed to load market prices');
  }
};

export const fetchItemComprehensive = async (
  itemId: number
): Promise<ItemComprehensive> => {
  const url = `${API_BASE_URL}/PlayerMarket/items/prices/latest/comprehensive/${encodeURIComponent(
    itemId
  )}`;
  try {
    const response = await axios.get(url, {
      timeout: MARKET_TIMEOUT,
      params: { _: Date.now() },
      headers: {
        // bypass browser cache for real-time prices
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
    return (response.data ?? { itemId }) as ItemComprehensive;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Comprehensive market request timed out');
      }
      const msg = error.response?.data?.message || 'Failed to load item details';
      throw new Error(msg);
    }
    throw new Error('Failed to load item details');
  }
};
