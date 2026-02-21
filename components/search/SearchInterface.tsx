"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Player } from "@/types/player.types";
import type { ClanData } from "@/types/clan.types";
import { fetchPlayerProfile, fetchClanByName } from "@/lib/api/apiService";
import { parseClanSkills } from "@/utils/parseClanSkills";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import SearchResults from "@/components/search/SearchResults";
import ClanInfoModal from "@/components/modals/ClanInfoModal";
import ClanSkillDisplay from "@/components/skills/ClanSkillDisplay";
import UnifiedSearch from "./UnifiedSearch";

export default function SearchInterface() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"player" | "clan">("player");
  const [playerSearchResults, setPlayerSearchResults] = useState<Player | null>(null);
  const [clanSearchResults, setClanSearchResults] = useState<ClanData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const playerSearches = useRecentSearches("player");
  const clanSearches = useRecentSearches("clan");

  // searchParams is read on mount only — handlers are defined below, so the
  // auto-search on ?q= uses a ref-stable callback pattern via the effect below
  useEffect(() => {
    const queryParam = searchParams.get("q");
    const typeParam = searchParams.get("type");
    if (queryParam && queryParam.trim()) {
      const trimmedQuery = queryParam.trim();
      setSearchQuery(trimmedQuery);
      const searchType = typeParam === "clan" ? "clan" : "player";
      setActiveTab(searchType);
      if (searchType === "clan") {
        handleClanSearch(trimmedQuery);
      } else {
        handlePlayerSearch(trimmedQuery);
      }
    }
  }, [searchParams]);

  const handlePlayerSearch = async (query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchPlayerProfile(query);
      setPlayerSearchResults(data);
      setSearchQuery("");
      playerSearches.add(query);
    } catch (err: unknown) {
      console.error("Error searching for player:", err);
      setError("Player not found");
      setPlayerSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClanSearch = async (query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    setError(null);

    try {
      const rawData = await fetchClanByName(query);
      const clanData: ClanData = parseClanSkills(rawData);
      setClanSearchResults(clanData);
      setSearchQuery("");
      clanSearches.add(query);
    } catch (err: unknown) {
      console.error("Error searching for clan:", err);
      setError("Clan not found");
      setClanSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: "player" | "clan") => {
    setActiveTab(tab);
    setError(null);
    setSearchQuery("");
  };

  const handleSearch = (query: string) => {
    if (activeTab === "player") {
      router.push(`/player/${encodeURIComponent(query)}`);
    } else {
      router.push(`/clan/${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="w-full">
      <UnifiedSearch
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        isLoading={isLoading}
        recentSearches={activeTab === "player" ? playerSearches.searches : clanSearches.searches}
        onRecentSearchClick={handleSearch}
        onClearHistory={activeTab === "player" ? playerSearches.clear : clanSearches.clear}
      />

      {activeTab === "player" && (playerSearchResults || error) && (
        <div className="mt-8">
          <SearchResults
            player={playerSearchResults}
            error={error || undefined}
            onSearchMember={handlePlayerSearch}
            onSearchClan={(clanName: string) => {
              setActiveTab("clan");
              handleClanSearch(clanName);
            }}
          />
        </div>
      )}

      {activeTab === "clan" && (
        <>
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl mb-4 mt-8 backdrop-blur-sm shadow-lg">
              {error}
            </div>
          )}
          {clanSearchResults && (
            <div className="mt-8">
              <ClanInfoModal
                isOpen={true}
                variant="inline"
                onClose={() => {}}
                clanName={
                  clanSearchResults.clanName ||
                  clanSearchResults.guildName ||
                  "Clan"
                }
                memberCount={clanSearchResults.memberlist?.length || 0}
                clanData={clanSearchResults}
                onSearchMember={(memberName) => {
                  setActiveTab("player");
                  handlePlayerSearch(memberName);
                }}
              />

              {clanSearchResults.skills && (
                <div className="mt-6">
                  <ClanSkillDisplay skills={clanSearchResults.skills} />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
