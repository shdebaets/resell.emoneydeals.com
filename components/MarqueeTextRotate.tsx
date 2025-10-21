"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import clsx from "clsx";

// client-only import to avoid SSR issues
const Marquee = dynamic(() => import("react-fast-marquee"), { ssr: false });

function unique<T>(arr: T[]) {
    const s = new Set<T>();
    const out: T[] = [];
    for (const v of arr) if (v != null && v !== "" && !s.has(v)) { s.add(v); out.push(v); }
    return out;
}

// tiny seeded RNG so the shuffle is stable per item
function xmur3(str: string) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    return () => {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
    };
}
function mulberry32(a: number) {
    return () => {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
function shuffleSeeded<T>(arr: T[], seed: string) {
    const rand = mulberry32(xmur3(seed)());
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function CityMarqueeChip({
    cities,
    seedKey,
    className,
    speed = 30,
}: {
    cities: string[] | undefined;
    /** something stable per item: id, zip, store_id, etc. */
    seedKey: string | number;
    className?: string;
    speed?: number;
}) {
    const list = useMemo(() => {
        const clean = unique((cities ?? []).map((s) => s.trim()));
        if (!clean.length) return clean;
        // base city should be first if you want; otherwise comment out next line
        // return [clean[0], ...shuffleSeeded(clean.slice(1), String(seedKey))];
        return shuffleSeeded(clean, String(seedKey));
    }, [cities, seedKey]);

    // Render a plain chip if 0/1 city to avoid marquee blanks
    if (!list.length) {
        return (
            <span
                className={clsx(
                    "inline-flex items-center rounded-full border border-white/12 bg-white/[.055] px-2.5 py-1",
                    "text-[11px] text-white/85 min-w-0",
                    className
                )}
            />
        );
    }
    if (list.length === 1) {
        return (
            <span
                className={clsx(
                    "inline-flex items-center rounded-full border border-white/12 bg-white/[.055] px-2.5 py-1",
                    "text-[11px] text-white/85 min-w-0",
                    className
                )}
                title={list[0]}
            >
                <span className="truncate">{list[0]}</span>
            </span>
        );
    }

    // Marquee inside a chip
    return (
        <span
            className={clsx(
                "inline-flex items-center rounded-full border border-white/12 bg-white/[.055] px-2.5 py-1",
                "text-[11px] text-white/85 min-w-0 max-w-[220px]", // adjust max width to fit your card
                className
            )}
        >
            <Marquee
                gradient={false}
                pauseOnHover
                speed={speed}
                className="min-w-0"
            >
                {list.map((city, i) => (
                    <span key={`${city}-${i}`} className="px-2 first:pl-0 whitespace-nowrap">
                        {city}
                    </span>
                ))}
            </Marquee>
        </span>
    );
}