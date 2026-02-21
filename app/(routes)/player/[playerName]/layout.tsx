import type { Metadata } from "next";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ playerName: string }>;
}): Promise<Metadata> {
    const { playerName } = await params;
    return { title: `${decodeURIComponent(playerName)} — Idle Clans` };
}

export default function PlayerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
