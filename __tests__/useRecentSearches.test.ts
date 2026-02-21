import { renderHook, act } from "@testing-library/react";
import { useRecentSearches } from "@/hooks/useRecentSearches";

const STORAGE_KEY = "recentPlayerSearches";

beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
});

describe("useRecentSearches", () => {
    it("initialises empty when localStorage is empty", () => {
        const { result } = renderHook(() => useRecentSearches("player"));
        expect(result.current.searches).toEqual([]);
    });

    it("loads persisted searches from localStorage on mount", () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(["Alice", "Bob"]));

        const { result } = renderHook(() => useRecentSearches("player"));
        expect(result.current.searches).toEqual(["Alice", "Bob"]);
    });

    it("adds a new search and prepends it", () => {
        const { result } = renderHook(() => useRecentSearches("player"));

        act(() => result.current.add("Charlie"));

        expect(result.current.searches[0]).toBe("Charlie");
    });

    it("does not duplicate an existing search", () => {
        const { result } = renderHook(() => useRecentSearches("player"));

        act(() => result.current.add("Alice"));
        act(() => result.current.add("Alice"));

        expect(result.current.searches.filter((s) => s === "Alice")).toHaveLength(1);
    });

    it("caps list to the specified limit", () => {
        const { result } = renderHook(() => useRecentSearches("player", 3));

        act(() => {
            result.current.add("A");
            result.current.add("B");
            result.current.add("C");
            result.current.add("D");
        });

        expect(result.current.searches).toHaveLength(3);
    });

    it("clear() removes all searches and deletes from localStorage", () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(["Alice"]));

        const { result } = renderHook(() => useRecentSearches("player"));

        act(() => result.current.clear());

        expect(result.current.searches).toEqual([]);
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
});
