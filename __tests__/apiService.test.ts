import axios, { type AxiosError } from "axios";
import {
    fetchPlayerProfile,
    fetchClanByName,
    fetchLeaderboard,
} from "@/lib/api/apiService";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

function mockIsAxiosError(): void {
    const ax = mockedAxios as { isAxiosError: (payload: unknown) => payload is AxiosError };
    ax.isAxiosError = jest.fn((payload: unknown): payload is AxiosError => true) as unknown as (
        payload: unknown
    ) => payload is AxiosError;
}

describe("fetchPlayerProfile", () => {
    afterEach(() => jest.clearAllMocks());

    it("returns player data on success", async () => {
        const player = { username: "TestPlayer", gameMode: "default" };
        mockedAxios.get.mockResolvedValueOnce({ data: player });

        const result = await fetchPlayerProfile("TestPlayer");

        expect(result).toEqual(player);
        expect(mockedAxios.get).toHaveBeenCalledWith(
            expect.stringContaining("/Player/profile/TestPlayer"),
            expect.objectContaining({ timeout: expect.any(Number) })
        );
    });

    it("throws 'Player not found.' on 404", async () => {
        mockIsAxiosError();
        mockedAxios.get.mockRejectedValueOnce({
            isAxiosError: true,
            response: { status: 404 },
        });

        await expect(fetchPlayerProfile("Ghost")).rejects.toThrow("Player not found.");
    });

    it("throws timeout error on ECONNABORTED", async () => {
        mockIsAxiosError();
        mockedAxios.get.mockRejectedValueOnce({
            isAxiosError: true,
            code: "ECONNABORTED",
        });

        await expect(fetchPlayerProfile("Slow")).rejects.toThrow(
            "Request timed out. Please try again."
        );
    });
});

describe("fetchClanByName", () => {
    afterEach(() => jest.clearAllMocks());

    it("returns clan data on success", async () => {
        const clan = { guildName: "Warriors", memberlist: [] };
        mockedAxios.get.mockResolvedValueOnce({ data: clan });

        const result = await fetchClanByName("Warriors");

        expect(result).toEqual(clan);
        expect(mockedAxios.get).toHaveBeenCalledWith(
            expect.stringContaining("/Clan/recruitment/Warriors"),
            expect.any(Object)
        );
    });

    it("throws 'Clan not found.' on 404", async () => {
        mockIsAxiosError();
        mockedAxios.get.mockRejectedValueOnce({
            isAxiosError: true,
            response: { status: 404 },
        });

        await expect(fetchClanByName("UnknownClan")).rejects.toThrow("Clan not found.");
    });
});

describe("fetchLeaderboard", () => {
    afterEach(() => jest.clearAllMocks());

    it("maps API response to LeaderboardEntry array", async () => {
        const apiResponse = [
            { username: "Player1", score: 9999 },
            { username: "Player2", score: 8888 },
        ];
        mockedAxios.get.mockResolvedValueOnce({ data: apiResponse });

        const result = await fetchLeaderboard("default", "player", "skills", "total_level", 1, 100);

        expect(result.entries).toHaveLength(2);
        expect(result.entries[0]).toMatchObject({ rank: 1, name: "Player1" });
        expect(result.entries[1]).toMatchObject({ rank: 2, name: "Player2" });
    });

    it("returns empty entries on 404", async () => {
        mockIsAxiosError();
        mockedAxios.get.mockRejectedValueOnce({
            isAxiosError: true,
            response: { status: 404 },
        });

        const result = await fetchLeaderboard("default", "player", "skills", "total_level");

        expect(result.entries).toHaveLength(0);
        expect(result.totalCount).toBe(0);
    });
});
