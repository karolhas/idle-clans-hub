"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { usePlayerQuery } from "@/hooks/queries/usePlayerQuery";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { useSearchStore } from "@/lib/store/searchStore";
import SearchResults from "@/components/search/SearchResults";
import UnifiedSearch from "@/components/search/UnifiedSearch";

export default function PlayerPage() {
  const { playerName } = useParams<{ playerName: string }>();
  const router = useRouter();
  const {
    playerSearchQuery,
    clanSearchQuery,
    setPlayerSearchQuery,
    setClanSearchQuery,
  } = useSearchStore();

  const [activeTab, setActiveTab] = useState<"player" | "clan">("player");

  const playerSearches = useRecentSearches("player");
  const clanSearches = useRecentSearches("clan");

  const {
    data: player,
    isLoading,
    error,
  } = usePlayerQuery(decodeURIComponent(playerName));

  useEffect(() => {
    const decoded = decodeURIComponent(playerName);
    if (decoded) setPlayerSearchQuery(decoded);
  }, [playerName]);

  useEffect(() => {
    if (player) {
      playerSearches.add(player.username);
    }
  }, [player]);

  const handleTabChange = (tab: "player" | "clan") => {
    setActiveTab(tab);
    if (tab === "clan" && clanSearchQuery) {
      router.push(`/clan/${encodeURIComponent(clanSearchQuery)}`);
    }
  };

  const handlePlayerSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setPlayerSearchQuery(trimmed);
    router.push(`/player/${encodeURIComponent(trimmed)}`);
  };

  const handleClanSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setClanSearchQuery(trimmed);
    clanSearches.add(trimmed);
    router.push(`/clan/${encodeURIComponent(trimmed)}`);
  };

  const handleSearch = (query: string) => {
    if (activeTab === "player") {
      handlePlayerSearch(query);
    } else {
      handleClanSearch(query);
    }
  };

  return (
    <main className="min-h-screen bg-[#031111] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <UnifiedSearch
          activeTab={activeTab}
          onTabChange={handleTabChange}
          searchQuery={
            activeTab === "player" ? playerSearchQuery : clanSearchQuery
          }
          setSearchQuery={(q) =>
            activeTab === "player"
              ? setPlayerSearchQuery(q)
              : setClanSearchQuery(q)
          }
          onSearch={handleSearch}
          isLoading={isLoading}
          recentSearches={
            activeTab === "player"
              ? playerSearches.searches
              : clanSearches.searches
          }
          onRecentSearchClick={(name) =>
            activeTab === "player"
              ? router.push(`/player/${encodeURIComponent(name)}`)
              : router.push(`/clan/${encodeURIComponent(name)}`)
          }
          onClearHistory={
            activeTab === "player" ? playerSearches.clear : clanSearches.clear
          }
        />

        {activeTab === "player" && (player || error) && (
          <div className="mt-8">
            <SearchResults
              player={player}
              error={error?.message}
              onSearchMember={(name) =>
                router.push(`/player/${encodeURIComponent(name)}`)
              }
            />
          </div>
        )}
      </div>
    </main>
  );
}
