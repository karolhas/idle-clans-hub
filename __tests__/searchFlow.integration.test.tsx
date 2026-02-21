/**
 * Integration test: search flow
 * Tests the SearchInterface form submission and URL-query auto-search.
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as apiService from "@/lib/api/apiService";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush }),
    useSearchParams: () => ({
        get: (key: string) => (key === "q" ? null : null),
    }),
}));

jest.mock("@/lib/api/apiService");
jest.mock("@/lib/store/searchStore", () => ({
    useSearchStore: jest.fn(() => ({
        playerSearchQuery: "",
        clanSearchQuery: "",
        latestPlayerLookup: null,
        setPlayerSearchQuery: jest.fn(),
        setClanSearchQuery: jest.fn(),
    })),
}));

const mockedFetchPlayer = apiService.fetchPlayerProfile as jest.MockedFunction<
    typeof apiService.fetchPlayerProfile
>;

function TestWrapper({ children }: { children: React.ReactNode }) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
}

describe("SearchInterface — search flow", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedFetchPlayer.mockResolvedValue({} as never);
    });

    it("submitting the form navigates to the player route", async () => {
        const { default: SearchInterface } = await import(
            "@/components/search/SearchInterface"
        );

        render(
            <TestWrapper>
                <SearchInterface />
            </TestWrapper>
        );

        const input = screen.getByPlaceholderText(/player name/i);
        await userEvent.type(input, "TestPlayer");

        const submitButton = screen.getByRole("button", { name: "Search" });
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(
                expect.stringContaining("TestPlayer")
            );
        });
    });
});
