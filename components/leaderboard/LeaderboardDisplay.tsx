import Image from "next/image";
import { LeaderboardProfile } from "@/types/leaderboard.types";
import { SKILL_ORDER } from "@/utils/skills/constants/skillOrder";

interface LeaderboardDisplayProps {
  profile: LeaderboardProfile;
}

// Fix 1 — all entries from BossStat / RaidStat in leaderboard.types.ts
const BOSS_FIELDS = [
  "chimera",
  "devil",
  "griffin",
  "hades",
  "medusa",
  "zeus",
  "kronos",
  "sobek",
  "mesines",
];
const RAID_FIELDS = [
  "guardians_of_the_citadel",
  "reckoning_of_the_gods",
  "bloodmoon_massacre",
];
const CLAN_BOSS_FIELDS = ["otherworldly_golem"];

// Fix 4 — floor-based formatting so 4555M never rounds up to 4.56B
const formatTotalScore = (score: number): string => {
  if (score >= 1_000_000_000) {
    return `${Math.floor(score / 10_000_000) / 100}B score`;
  }
  if (score >= 1_000_000) {
    return `${Math.floor(score / 10_000) / 100}M score`;
  }
  return `${score.toLocaleString()} score`;
};

const getRankColor = (rank: number): string => {
  if (rank <= 100) return "text-amber-400";
  if (rank <= 500) return "text-emerald-400";
  if (rank <= 1000) return "text-teal-400";
  if (rank <= 5000) return "text-blue-400";
  return "text-gray-400";
};

const formatFieldName = (name: string): string =>
  name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// Fix 3 — .NET Ticks → DD.MM.YYYY
const NET_EPOCH_OFFSET = 621_355_968_000_000_000;

function ticksToDate(ticks: number): string | null {
  if (!ticks || ticks <= 0) return null;
  const ms = (ticks - NET_EPOCH_OFFSET) / 10_000;
  const d = new Date(ms);
  const dd = d.getUTCDate().toString().padStart(2, "0");
  const mm = (d.getUTCMonth() + 1).toString().padStart(2, "0");
  return `${dd}.${mm}.${d.getUTCFullYear()}`;
}

const formatScore = (
  score: number,
  isSkill: boolean,
  expCapDate: number,
): string => {
  let base: string;
  if (!isSkill) {
    base = score.toLocaleString();
  } else if (score >= 1_000_000) {
    base = `${(score / 1_000_000).toFixed(2)}M XP`;
  } else if (score >= 1_000) {
    base = `${(score / 1_000).toFixed(1)}K XP`;
  } else {
    base = `${score.toLocaleString()} XP`;
  }

  const capDate = ticksToDate(expCapDate);
  return capDate ? `${base} · ${capDate}` : base;
};

interface RankRowProps {
  name: string;
  rank: number;
  score: number;
  expCapDate: number;
  iconSrc: string;
  isSkill: boolean;
}

// Fix 2 — removed `group` and `group-hover:text-emerald-300`
function RankRow({ name, rank, score, expCapDate, iconSrc, isSkill }: RankRowProps) {
  return (
    <div className="bg-white/5 rounded-lg p-2 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-200">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Image
            src={iconSrc}
            alt={name}
            width={22}
            height={22}
            className="rounded-sm flex-shrink-0"
            loading="lazy"
          />
          <span className="text-white font-medium text-xs truncate">
            {formatFieldName(name)}
          </span>
        </div>
        <div className="flex flex-col items-end flex-shrink-0">
          <span className={`text-sm font-bold leading-tight ${getRankColor(rank)}`}>
            #{rank.toLocaleString()}
          </span>
          <span className="text-xs text-gray-400 leading-tight">
            {formatScore(score, isSkill, expCapDate)}
          </span>
        </div>
      </div>
    </div>
  );
}

interface RankCategoryProps {
  title: string;
  fields: string[];
  profile: LeaderboardProfile;
  isSkill?: boolean;
}

function RankCategory({
  title,
  fields,
  profile,
  isSkill = false,
}: RankCategoryProps) {
  const available = fields.filter((f) => profile.fields[f] !== undefined);
  if (available.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
        <div className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0" />
        {title}
      </h3>
      <div className="grid gap-1.5">
        {available.map((field) => (
          <RankRow
            key={field}
            name={field}
            rank={profile.fields[field].rank}
            score={profile.fields[field].score}
            expCapDate={profile.fields[field].expCapDate}
            iconSrc={`/pvmstats/${field.toLowerCase().replace(/_/g, "")}.png`}
            isSkill={isSkill}
          />
        ))}
      </div>
    </div>
  );
}

export default function LeaderboardDisplay({ profile }: LeaderboardDisplayProps) {
  const skillFields = SKILL_ORDER.filter(
    (skill) => profile.fields[skill] !== undefined,
  );

  return (
    <div className="space-y-5">
      {/* Total Level highlight */}
      <div className="bg-gradient-to-r from-amber-900/20 to-yellow-900/20 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
        <span className="text-sm text-amber-300 font-medium">
          Total Level Rank
        </span>
        <div className="flex flex-col items-end">
          <span
            className={`text-2xl font-bold leading-tight ${getRankColor(profile.totalLevelResult.rank)}`}
          >
            #{profile.totalLevelResult.rank.toLocaleString()}
          </span>
          <span className="text-xs text-gray-400">
            {formatTotalScore(profile.totalLevelResult.score)}
          </span>
        </div>
      </div>

      {/* Skills grid */}
      {skillFields.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0" />
            Skills
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {skillFields.map((skill) => (
              <RankRow
                key={skill}
                name={skill}
                rank={profile.fields[skill].rank}
                score={profile.fields[skill].score}
                expCapDate={profile.fields[skill].expCapDate}
                iconSrc={`/skills/${skill}.png`}
                isSkill={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bosses & Raids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RankCategory
          title="Bosses"
          fields={BOSS_FIELDS}
          profile={profile}
        />
        <div className="space-y-4">
          <RankCategory
            title="Raids"
            fields={RAID_FIELDS}
            profile={profile}
          />
          <RankCategory
            title="Clan Bosses"
            fields={CLAN_BOSS_FIELDS}
            profile={profile}
          />
        </div>
      </div>
    </div>
  );
}
