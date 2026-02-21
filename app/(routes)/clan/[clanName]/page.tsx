"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ClanHeader from "@/components/clan/ClanHeader";
import ClanMembersList from "@/components/clan/ClanMembersList";
import ClanDetailsCard from "@/components/clan/ClanDetailsCard";
import ClanUpgradesGrid from "@/components/clan/ClanUpgradesGrid";
import ClanSkills from "@/components/clan/ClanSkills";
import { useSearchStore } from "@/lib/store/searchStore";
import UnifiedSearch from "@/components/search/UnifiedSearch";
import { useClanQuery } from "@/hooks/queries/useClanQuery";
import { useRecentSearches } from "@/hooks/useRecentSearches";

export default function ClanPage() {
  const { clanName } = useParams<{ clanName: string }>();
  const router = useRouter();
  const {
    playerSearchQuery,
    clanSearchQuery,
    setPlayerSearchQuery,
    setClanSearchQuery,
  } = useSearchStore();

  const [activeTab, setActiveTab] = useState<"player" | "clan">("clan");

  const playerSearches = useRecentSearches("player");
  const clanSearches = useRecentSearches("clan");

  const decodedClanName = decodeURIComponent(clanName);
  const { data: clanData, isLoading, error } = useClanQuery(decodedClanName);

  useEffect(() => {
    if (decodedClanName) setClanSearchQuery(decodedClanName);
  }, [clanName]);

  useEffect(() => {
    if (clanData) {
      const name = clanData.clanName || clanData.guildName || decodedClanName;
      clanSearches.add(name);
    }
  }, [clanData, decodedClanName]);

  const handleTabChange = (tab: "player" | "clan") => {
    setActiveTab(tab);
    if (tab === "player" && playerSearchQuery) {
      router.push(`/player/${encodeURIComponent(playerSearchQuery)}`);
    }
  };

  const handlePlayerSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setPlayerSearchQuery(trimmed);
    playerSearches.add(trimmed);
    router.push(`/player/${encodeURIComponent(trimmed)}`);
  };

  const handleClanSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setClanSearchQuery(trimmed);
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

        {activeTab === "clan" && (
          <>
            {isLoading && (
              <p className="text-gray-400 mt-8">Loading clan data...</p>
            )}
            {error && (
              <p className="text-red-400 font-semibold mt-8">{error.message}</p>
            )}

            {clanData && (
              <div className="mt-8 space-y-8 animate-fade-in">
                <div className="relative bg-white/5 p-6 md:p-8 rounded-2xl border-2 border-white/10 hover:border-teal-500/50 hover:shadow-teal-900/20 transition-all duration-300 group w-full shadow-2xl backdrop-blur-xl animate-fade-in">
                  <ClanHeader
                    clanName={decodedClanName}
                    memberCount={clanData.memberlist?.length || 0}
                    clanData={clanData}
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <ClanMembersList
                      clanData={clanData}
                      clanName={decodedClanName}
                    />
                    <ClanDetailsCard clanData={clanData} />
                  </div>
                </div>

                {clanData.serializedUpgrades && (
                  <ClanUpgradesGrid
                    serializedUpgrades={clanData.serializedUpgrades}
                  />
                )}

                {clanData.skills && <ClanSkills skills={clanData.skills} />}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
