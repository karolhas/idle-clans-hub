import axios from 'axios';
import { Player } from '@/types/player.types';
import { ClanData } from '@/types/clan.types';
import { LeaderboardData, LeaderboardProfile, GameMode, LeaderboardStat, EntityType, LeaderboardCategory, LeaderboardEntry } from '@/types/leaderboard.types';
import { API_BASE_URL, DEFAULT_TIMEOUT } from './config';

interface LeaderboardApiEntry {
    username?: string;
    name?: string;
    level?: number;
    score?: number;
}

export const fetchPlayerProfile = async (username: string): Promise<Player> => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Player/profile/${encodeURIComponent(username)}`,
            { timeout: DEFAULT_TIMEOUT }
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
                throw new Error('Request timed out. Please try again.');
            }
            if (error.response?.status === 404) {
                throw new Error('Player not found.');
            }
        }
        throw new Error('Failed to fetch player data. Please try again.');
    }
};

export const fetchClanByName = async (clanName: string): Promise<ClanData> => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Clan/recruitment/${encodeURIComponent(clanName)}`,
            { timeout: DEFAULT_TIMEOUT }
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
                throw new Error('Request timed out. Please try again.');
            }
            if (error.response?.status === 404) {
                throw new Error('Clan not found.');
            }
        }
        throw new Error('Failed to fetch clan data. Please try again.');
    }
};

export const fetchLeaderboardProfile = async (
    username: string,
    gameMode: GameMode
): Promise<LeaderboardProfile | null> => {
    try {
        const leaderboardName = `players:${gameMode}`;
        const response = await axios.get(
            `${API_BASE_URL}/Leaderboard/profile/${encodeURIComponent(leaderboardName)}/${encodeURIComponent(username)}`,
            { timeout: DEFAULT_TIMEOUT }
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                return null;
            }
        }
        return null;
    }
};

export const fetchServerInfo = async (): Promise<number> => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Server/info`,
            { timeout: DEFAULT_TIMEOUT }
        );
        const servers: { currentPlayers: number }[] = response.data?.allServers ?? [];
        return servers.reduce((sum, s) => sum + s.currentPlayers, 0);
    } catch {
        throw new Error('Failed to fetch server info.');
    }
};

export const fetchLeaderboard = async (
    gameMode: GameMode,
    entityType: EntityType,
    category: LeaderboardCategory,
    stat: LeaderboardStat,
    startCount: number = 1,
    maxCount: number = 100
): Promise<LeaderboardData> => {
    try {
        const leaderboardName = entityType === 'pet' ? `pets:${gameMode}` : `${entityType}s:${gameMode}`;
        const response = await axios.get(
            `${API_BASE_URL}/Leaderboard/top/${leaderboardName}/${stat}`,
            {
                timeout: DEFAULT_TIMEOUT,
                params: { startCount, maxCount }
            }
        );

        const isTotalLevel = category === 'skills' && stat === 'total_level';

        let entries: LeaderboardEntry[] = [];
        if (Array.isArray(response.data)) {
            entries = response.data.map((entry: LeaderboardApiEntry, index: number) => ({
                rank: startCount + index,
                name: entry.username || entry.name || `Player ${startCount + index}`,
                value: isTotalLevel ? (entry.level || 0) : (entry.score || 0)
            }));
        }

        return {
            entries,
            totalCount: entries.length
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
                throw new Error('Request timed out. Please try again.');
            }
            if (error.response?.status === 404) {
                return { entries: [], totalCount: 0 };
            }
        }
        throw new Error('Failed to fetch leaderboard data. Please try again.');
    }
};
