"use client";

import { useEffect, useMemo, useRef, useState, useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SuccessHeroSlider from "./SuccessHeroSlider";

type SafeItem = {
    id: string;
    name: string;
    brand: string;
    price: string;
    oldPrice?: string;
    image: string;
    retailer: string;
    stock_hint: string;
    distance_hint: string;
    updated_hint: string;
};

const uniq = <T,>(arr: T[]) => [...new Set(arr.filter(Boolean))];
const shuffle = <T,>(arr: T[]) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

export default function ScanOverlayPurchase({
    item,
    cities,
    totalMs = 7200,
    onDone,
}: {
    item: SafeItem;
    cities: string[];
    onDone: () => void;
    totalMs?: number;
}) {
    const titleId = useId();
    
    const cityPhrases = useMemo(
        () => shuffle(uniq(cities ?? [])).slice(0, 6).map((c) => `Checking ${c}…`),
        [cities]
    );

    const tailSteps = useMemo(
        () => ["Cooking deals…", "Finding nearby retailers…", "Items found!", "Preparing your results…"],
        []
    );

    const steps = useMemo(() => [...cityPhrases, ...tailSteps], [cityPhrases, tailSteps]);

    const schedule = useMemo(() => {
        const minStepMs = 800;
        const cityShare = 0.7;
        const cityTime = Math.max(minStepMs * cityPhrases.length, Math.round(totalMs * cityShare));
        const tailTime = Math.max(minStepMs * tailSteps.length, totalMs - cityTime);

        const cityStep = Math.round(cityTime / Math.max(1, cityPhrases.length));
        const tailStep = Math.round(tailTime / Math.max(1, tailSteps.length));

        const durations = [
            ...Array(cityPhrases.length).fill(cityStep),
            ...Array(tailSteps.length).fill(tailStep),
        ];

        const sum = durations.reduce((a, b) => a + b, 0);
        const diff = totalMs - sum;
        if (diff !== 0 && durations.length) durations[durations.length - 1] += diff;

        const cumulative: number[] = [];
        let acc = 0;
        for (const d of durations) {
            acc += d;
            cumulative.push(acc);
        }
        return { durations, cumulative };
    }, [cityPhrases.length, tailSteps.length, totalMs]);

    const [progress, setProgress] = useState(0);
    const [idx, setIdx] = useState(0);
    const raf = useRef<number | null>(null);
    const start = useRef<number | null>(null);
    const done = useRef(false);

    useEffect(() => {
        const tick = (now: number) => {
            if (start.current == null) start.current = now;
            const elapsed = now - start.current;
            const t = Math.min(1, elapsed / totalMs);

            const eased = 1 - Math.pow(1 - t, 3);
            setProgress(eased);

            const cum = schedule.cumulative;
            let i = 0;
            while (i < cum.length && elapsed >= cum[i]) i++;
            setIdx(Math.min(cum.length - 1, i));

            if (t < 1) {
                raf.current = requestAnimationFrame(tick);
            } else if (!done.current) {
                done.current = true;
                onDone();
            }
        };
        raf.current = requestAnimationFrame(tick);
        return () => {
            if (raf.current) cancelAnimationFrame(raf.current);
        };
    }, [onDone, schedule.cumulative, totalMs]);

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[60] grid place-items-center bg-black/70 backdrop-blur"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                aria-modal="true"
                role="dialog"
                aria-labelledby={titleId}
            >
                <div className="card w-[min(92vw,860px)] p-6 text-center bg-black/70 shadow-2xl rounded-2xl border border-white/10">
                    <div className="flex items-center gap-4 justify-center">
                        <div className="size-14 shrink-0 rounded-xl overflow-hidden ring-1 ring-white/10 bg-white/5">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    const el = e.currentTarget as HTMLImageElement;
                                    if (!el.src.endsWith("/logo.png")) el.src = "/logo.png";
                                }}
                            />
                        </div>

                        <div className="min-w-0 text-left">
                            <div className="flex flex-wrap items-center gap-2">
                                {item.brand && (
                                    <span className="px-2 py-0.5 rounded-md text-[11px] uppercase tracking-wide bg-white/10 text-white/70">
                                        {item.brand}
                                    </span>
                                )}
                                {item.retailer && (
                                    <span className="px-2 py-0.5 rounded-md text-[11px] uppercase tracking-wide bg-white/10 text-white/70">
                                        {item.retailer}
                                    </span>
                                )}
                            </div>

                            <h3
                                id={titleId}
                                className="mt-1 text-lg sm:text-xl font-semibold leading-tight text-white line-clamp-2"
                                title={item.name}
                            >
                                {item.name}
                            </h3>

                            <div className="mt-1 flex items-center gap-2">
                                {item.oldPrice && (
                                    <span className="text-white/40 text-sm line-through">{item.oldPrice}</span>
                                )}
                                <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-brand-purple to-brand-magenta bg-clip-text text-transparent">
                                    {item.price}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-white/10">
                        <motion.div
                            className="h-full bg-gradient-to-r from-brand-purple to-brand-magenta"
                            animate={{ width: `${Math.round(progress * 100)}%` }}
                            transition={{ type: "tween", duration: 0.12, ease: "easeOut" }}
                            style={{ width: "0%" }}
                        />
                    </div>

                    <div className="mt-4 h-6 overflow-hidden relative">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={idx}
                                initial={{ y: 16, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -16, opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className="absolute inset-0 flex items-center justify-center text-sm text-white/85"
                                aria-live="polite"
                            >
                                {steps[idx]}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <SuccessHeroSlider
                        items={[
                            { src: "/success/cc26c58d-4d4b-4ac1-8d73-a72bb721e5ab.jpg", caption: "RYOBI WORK LIGHTS RINGING $0.01 — TRUNKS FULL NOW" },
                            { src: "/success/c5477e7d-9777-4808-9cb8-5269f43eb5b1.jpg", caption: "1¢ TECH IS RINGING ALL DAY — DON’T SLEEP" },
                            { src: "/success/74ff36d5-92dd-446d-8484-f132c621c58c.png", caption: "$16 BOWL FOR $0 — CONFIRMED" },
                            { src: "/success/2b49ffdc-7333-4ea7-8c24-f4d57eb0280e.png", caption: "SHARK CORDLESS FOR A PENNY — LIVE" },
                            { src: "/success/bbf1594e-91b4-45dd-be13-7b2ee8067a3d.jpg", caption: "SMART LOCKS AT $0.04 EACH — CRAZY MARGINS" },
                            { src: "/success/198fdf17-948f-4f7d-8af2-cabe976aa30e.jpg", caption: "$549 → $0.01 AT THE REGISTER" },
                        ]}
                        height={300}
                        autoplayMs={1200}
                        className="mx-auto mt-4"
                    />

                    <p className="mt-2 text-xs text-white/50">Hang tight—dialing it in.</p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}