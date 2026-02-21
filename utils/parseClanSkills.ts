import type { ClanData } from '@/types/clan.types';

export function parseClanSkills(rawData: ClanData): ClanData {
    if (!rawData.serializedSkills) return rawData;

    try {
        const skills = JSON.parse(rawData.serializedSkills);
        return { ...rawData, skills };
    } catch {
        return rawData;
    }
}
