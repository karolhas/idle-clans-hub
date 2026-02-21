import Link from "next/link";
import { ReactNode } from "react";

type ColorKey = "emerald" | "sky" | "violet" | "amber" | "rose" | "cyan";

interface ColorClasses {
    bg: string;
    text: string;
    hoverBg: string;
    hoverText: string;
}

const COLOR_MAP: Record<ColorKey, ColorClasses> = {
    emerald: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        hoverBg: "group-hover:bg-emerald-500/20",
        hoverText: "group-hover:text-emerald-300",
    },
    sky: {
        bg: "bg-sky-500/10",
        text: "text-sky-400",
        hoverBg: "group-hover:bg-sky-500/20",
        hoverText: "group-hover:text-sky-300",
    },
    violet: {
        bg: "bg-violet-500/10",
        text: "text-violet-400",
        hoverBg: "group-hover:bg-violet-500/20",
        hoverText: "group-hover:text-violet-300",
    },
    amber: {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        hoverBg: "group-hover:bg-amber-500/20",
        hoverText: "group-hover:text-amber-300",
    },
    rose: {
        bg: "bg-rose-500/10",
        text: "text-rose-400",
        hoverBg: "group-hover:bg-rose-500/20",
        hoverText: "group-hover:text-rose-300",
    },
    cyan: {
        bg: "bg-cyan-500/10",
        text: "text-cyan-400",
        hoverBg: "group-hover:bg-cyan-500/20",
        hoverText: "group-hover:text-cyan-300",
    },
};

interface DashboardCardProps {
    title: string;
    description: string;
    icon: ReactNode;
    href: string;
    color?: ColorKey;
}

export default function DashboardCard({
    title,
    description,
    icon,
    href,
    color = "emerald",
}: DashboardCardProps) {
    const colors = COLOR_MAP[color];

    return (
        <Link
            href={href}
            className="group block h-full relative overflow-hidden rounded-xl border-2 border-white/10 bg-white/5 p-6 transition-all hover:bg-white/10 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-900/20"
        >
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-600/10 blur-3xl transition-all group-hover:bg-emerald-500/20" />

            <div className="relative flex flex-col h-full">
                <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${colors.bg} ${colors.text} ${colors.hoverBg} ${colors.hoverText} transition-colors`}
                >
                    {icon}
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                    {title}
                </h3>

                <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                    {description}
                </p>

                <div className="mt-auto pt-4 flex items-center text-sm font-medium text-emerald-500 opacity-0 transform translate-y-2 transition-all group-hover:opacity-100 group-hover:translate-y-0">
                    Explore
                    <svg
                        className="ml-2 w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                    </svg>
                </div>
            </div>
        </Link>
    );
}
