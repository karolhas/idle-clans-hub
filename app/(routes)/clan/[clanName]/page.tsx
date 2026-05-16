"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ClanHeader from "@/components/clan/ClanHeader";
import ClanMembersList from "@/components/clan/ClanMembersList";
import ClanDetailsCard from "@/components/clan/ClanDetailsCard";
import ClanUpgradesGrid from "@/components/clan/ClanUpgradesGrid";
import ClanSkills from "@/components/clan/ClanSkills";
import PvmStatsDisplay from "@/components/pvmstats/PvmStatsDisplay";

import { useSearchStore } from "@/lib/store/searchStore";
import UnifiedSearch from "@/components/search/UnifiedSearch";
import { useClanQuery } from "@/hooks/queries/useClanQuery";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { fetchClanLeaderboardProfile } from "@/lib/api/apiService";

import { PvmStats } from "@/types/pvm.types";

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

  const {
    data: clanData,
    isLoading,
    error,
  } = useClanQuery(decodedClanName);

  const [skillRanks, setSkillRanks] = useState<Record<string, number>>({});
  const [clanPvmStats, setClanPvmStats] = useState<PvmStats | null>(null);

  useEffect(() => {
    if (!decodedClanName) return;

    const fetchProfileData = async () => {
      try {
        const profile = await fetchClanLeaderboardProfile(decodedClanName);

        if (!profile?.fields) return;

        const ranks: Record<string, number> = {};

        Object.entries(profile.fields).forEach(([key, value]: any) => {
          ranks[key.toLowerCase()] = value.rank;
        });

        setSkillRanks(ranks);

        // PvM stats
        const pvmStats: PvmStats = {
          Griffin: profile.fields?.griffin?.score || 0,
          Devil: profile.fields?.devil?.score || 0,
          Hades: profile.fields?.hades?.score || 0,
          Zeus: profile.fields?.zeus?.score || 0,
          Medusa: profile.fields?.medusa?.score || 0,
          Chimera: profile.fields?.chimera?.score || 0,

          Kronos: profile.fields?.kronos?.score || 0,
          Sobek: profile.fields?.sobek?.score || 0,
          Mesines: profile.fields?.mesines?.score || 0,

          ReckoningOfTheGods:
            profile.fields?.reckoning_of_the_gods?.score || 0,

          GuardiansOfTheCitadel:
            profile.fields?.guardians_of_the_citadel?.score || 0,

          MalignantSpider:
            profile.fields?.malignant_spider?.score || 0,

          SkeletonWarrior:
            profile.fields?.skeleton_warrior?.score || 0,

          OtherworldlyGolem:
            profile.fields?.otherworldly_golem?.score || 0,

          BloodmoonMassacre:
            profile.fields?.bloodmoon_massacre?.score || 0,
        };

        setClanPvmStats(pvmStats);
      } catch (err) {
        console.error("Failed to fetch clan leaderboard profile:", err);
      }
    };

    fetchProfileData();
  }, [decodedClanName]);

  useEffect(() => {
    if (decodedClanName) {
      setClanSearchQuery(decodedClanName);
    }
  }, [decodedClanName, setClanSearchQuery]);

  useEffect(() => {
    if (clanData) {
      const name =
        clanData.clanName ||
        clanData.guildName ||
        decodedClanName;

      clanSearches.add(name);
    }
  }, [clanData, decodedClanName, clanSearches]);

  const handleTabChange = (tab: "player" | "clan") => {
    setActiveTab(tab);

    if (tab === "player" && playerSearchQuery) {
      router.push(
        `/player/${encodeURIComponent(playerSearchQuery)}`
      );
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
            activeTab === "player"
              ? playerSearchQuery
              : clanSearchQuery
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
              ? router.push(
                  `/player/${encodeURIComponent(name)}`
                )
              : router.push(
                  `/clan/${encodeURIComponent(name)}`
                )
          }
          onClearHistory={
            activeTab === "player"
              ? playerSearches.clear
              : clanSearches.clear
          }
        />

        {activeTab === "clan" && (
          <>
            {isLoading && (
              <p className="text-gray-400 mt-8">
                Loading clan data...
              </p>
            )}

            {error && (
              <p className="text-red-400 font-semibold mt-8">
                {error.message}
              </p>
            )}

            {clanData && (
              <div className="mt-8 space-y-8 animate-fade-in">
                <div className="relative bg-white/5 p-6 md:p-8 rounded-2xl border-2 border-white/10 hover:border-teal-500/50 hover:shadow-teal-900/20 transition-all duration-300 group w-full shadow-2xl backdrop-blur-xl animate-fade-in">
                  <ClanHeader
                    clanName={decodedClanName}
                    memberCount={
                      clanData.memberlist?.length || 0
                    }
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

                  {clanPvmStats && (
                    <div className="relative bg-white/5 p-6 md:p-8 rounded-2xl border-2 border-white/10 hover:border-teal-500/50 hover:shadow-teal-900/20 transition-all duration-300 group w-full shadow-2xl backdrop-blur-xl animate-fade-in">
                      <h2 className="text-3xl font-bold text-teal-400 mb-6 tracking-tight">
                        PvM Stats
                      </h2>

                      <PvmStatsDisplay
                        stats={clanPvmStats}
                      />
                    </div>
                  )}
                
                <div className="space-y-8">
                  {clanData.skills && (
                    <ClanSkills
                      skills={clanData.skills}
                      ranks={skillRanks}
                    />
                  )}

                  {clanData.serializedUpgrades && (
                    <ClanUpgradesGrid
                      serializedUpgrades={
                        clanData.serializedUpgrades
                      }
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
