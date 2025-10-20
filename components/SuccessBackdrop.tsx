"use client";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    useReducedMotion,
} from "framer-motion";

type Props = {
    images?: string[];
    tiles?: number;
    intervalMs?: number;
    fadeMs?: number;
    parallaxIntensity?: number;
};

export default function SuccessBackdrop({
    images = [],
    tiles = 18,
    intervalMs = 5200,
    fadeMs = 900,
    parallaxIntensity = 0.2,
}: Props) {
    const pool = useMemo(() => {
        const base = images.length
            ? images
            : ["/success/1.jpg", "/success/2.webp", "/success/3.webp", "/success/4.png", "/success/5.png"];
        return Array.from(new Set(base));
    }, [images]);

    useEffect(() => {
        pool.forEach((src) => {
            const img = new window.Image();
            img.decoding = "async";
            img.loading = "eager";
            img.src = src;
        });
    }, [pool]);

    const [vis, setVis] = useState<number[]>(() =>
        Array.from({ length: tiles }, (_, i) => (pool.length ? i % pool.length : 0))
    );

    useEffect(() => {
        setVis((prev) =>
            prev.map((v, i) => (pool.length ? (i % pool.length) : 0))
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pool.length, tiles]);

    function nextIndexForTile(i: number, current: number[], poolLen: number): number {
        if (poolLen <= 1) return current[i];
        const inUse = new Set(current.map((idx, j) => (j === i ? -1 : idx)));
        for (let step = 1; step <= poolLen; step++) {
            const candidate = (current[i] + step) % poolLen;
            if (!inUse.has(candidate)) return candidate;
        }
        return (current[i] + 1) % poolLen;
    }

    useEffect(() => {
        if (!pool.length) return;
        const timers: number[] = [];

        for (let i = 0; i < tiles; i++) {
            const startDelay = 220 * (i % 8);
            const t = window.setTimeout(() => {
                const id = window.setInterval(() => {
                    setVis((cur) => {
                        if (!pool.length) return cur;
                        const next = cur.slice();
                        next[i] = nextIndexForTile(i, cur, pool.length);
                        return next;
                    });
                }, intervalMs + (i % 5) * 180);
                timers.push(id);
            }, startDelay);
            timers.push(t);
        }
        return () => timers.forEach(clearInterval);
    }, [pool.length, tiles, intervalMs]);

    const reduce = useReducedMotion();
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const sx = useSpring(mx, { stiffness: 60, damping: 20, mass: 0.7 });
    const sy = useSpring(my, { stiffness: 60, damping: 20, mass: 0.7 });

    useEffect(() => {
        if (reduce || parallaxIntensity <= 0) return;
        const onMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = (e.clientY / window.innerHeight) * 2 - 1;
            mx.set(x);
            my.set(y);
        };
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, [mx, my, reduce, parallaxIntensity]);

    const parallaxX = useTransform(sx, (v) => v * (12 * parallaxIntensity));
    const parallaxY = useTransform(sy, (v) => v * (8 * parallaxIntensity));

    const mask = "radial-gradient(ellipse at center, rgba(0,0,0,.92), rgba(0,0,0,.24) 63%, transparent 96%)";

    return (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
            <div className="absolute inset-0 bg-[radial-gradient(1000px_400px_at_50%_-10%,rgba(122,60,255,.18),transparent_60%)]" />

            <motion.div
                className="absolute inset-0"
                style={{
                    x: reduce || parallaxIntensity <= 0 ? 0 : parallaxX,
                    y: reduce || parallaxIntensity <= 0 ? 0 : parallaxY,
                    maskImage: mask as any,
                    WebkitMaskImage: mask as any,
                }}
            >
                <div className="grid grid-cols-6 gap-3 opacity-95">
                    {Array.from({ length: tiles }).map((_, i) => {
                        const idx = vis[i] ?? 0;
                        const src = pool[idx] ?? "";

                        return (
                            <motion.div
                                key={i}
                                className="relative h-28 sm:h-32 md:h-36 rounded-xl overflow-hidden border border-white/10"
                                animate={reduce ? {} : { y: [0, -3 - (i % 2), 0] }}
                                transition={
                                    reduce
                                        ? {}
                                        : { duration: 5 + (i % 5) * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.03 }
                                }
                            >
                                <motion.div
                                    key={src}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: fadeMs / 1000 }}
                                    className="absolute inset-0"
                                >
                                    <Image src={src} alt="" fill sizes="25vw" className="object-cover" priority={i < 6} />
                                </motion.div>
                                <div className="absolute inset-0 bg-black/10" />
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
