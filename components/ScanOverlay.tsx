"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SuccessHeroSlider from "./SuccessHeroSlider";

const steps = [
    "Cooking deals…",
    "Finding nearby retailers…",
    "Checking backroom inventory…",
    "Pulling live shelf tags…",
    "Verifying today’s price drops…",
    "Surfacing penny items near you…",
    "Mapping fastest aisles…",
    "Locking alerts for your ZIP…",
];

export default function ScanOverlay({
    zip,
    onDone,
    city,
    state,
    totalMs = 5200,
}: { zip: string; city: string | null; state: string | null; onDone: () => void; totalMs?: number }) {
    const [progress, setProgress] = useState(0);
    const raf = useRef<number | null>(null);
    const startedAt = useRef<number | null>(null);
    const finished = useRef(false);

    const stepIndex = useMemo(() => {
        const idx = Math.min(
            steps.length - 1,
            Math.floor(progress * steps.length)
        );
        return idx;
    }, [progress]);

    useEffect(() => {
        const tick = (now: number) => {
            if (startedAt.current == null) startedAt.current = now;
            const elapsed = now - startedAt.current;
            const pct = Math.min(1, elapsed / totalMs);
            setProgress(pct);

            if (pct < 1) {
                raf.current = requestAnimationFrame(tick);
            } else if (!finished.current) {
                finished.current = true;
                onDone();
            }
        };

        raf.current = requestAnimationFrame(tick);
        return () => {
            if (raf.current) cancelAnimationFrame(raf.current);
        };
    }, [onDone, totalMs]);

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[60] grid place-items-center bg-black/70 backdrop-blur"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div className="card p-6 w-[min(92vw,800px)] text-center bg-black/70">
                    <h3 className="text-xl font-bold">Scanning {city}, {state} {zip}…</h3>

                    <div
                        className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(progress * 100)}
                    >
                        <motion.div
                            className="h-full bg-gradient-to-r from-brand-purple to-brand-magenta"
                            animate={{ width: `${progress * 100}%` }}
                            transition={{ type: "tween", duration: 0.12, ease: "easeOut" }}
                            style={{ width: "0%" }}
                        />
                    </div>

                    <div className="mt-4 h-6 overflow-hidden">
                        {/* <motion.div
                            key={stepIndex}
                            initial={{ y: 16, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -16, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="text-sm text-white/80"
                        >
                            {steps[stepIndex]}
                        </motion.div> */}
                        <div className="text-[11px] text-white/60">
                            {Math.round(progress * 100)}%
                        </div>
                    </div>

                    <SuccessHeroSlider
                        items={[
                            { src: "/success/86b87719-9c9b-4abe-adb5-f1298b3c5d78.jpg", caption: "98% OFF VACUUMS HITTING AGAIN" },
                            { src: "/success/d96cb7ff-a02d-4f25-a219-f24e54c570ec.jpg", caption: "POLAROID CAMERAS 98% OFF — CLEARANCE IS HITTING" },
                            { src: "/success/d0b30164-43ed-49ba-8d6f-841e06c90163.png", caption: "DEWALT FRAMING NAILER KIT: ONE PENNY RIGHT NOW" },
                            { src: "/success/4654a519-5932-46a2-bf13-0abed17ff2be.png", caption: "40V XGT MAKITA — $0.01 TODAY" },
                            { src: "/success/a4991336-170a-438a-9b32-193a41b3ae9a.jpg", caption: "WINDOW A/Cs 95–98% OFF — SUMMER PROFITS LOADING" },
                        ]}
                        height={300}
                        autoplayMs={1200}
                        className="mx-auto"
                    />

                    <p className="mt-2 text-xs text-white/50">This won’t take long.</p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
