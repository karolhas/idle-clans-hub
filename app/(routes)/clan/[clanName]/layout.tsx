import type { Metadata } from "next";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ clanName: string }>;
}): Promise<Metadata> {
    const { clanName } = await params;
    return { title: `${decodeURIComponent(clanName)} — Idle Clans` };
}

export default function ClanLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
