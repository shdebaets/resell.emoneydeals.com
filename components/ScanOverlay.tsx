"use client";
import { useEffect, useState, useMemo } from "react";
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
    totalMs = 5200,
}: { zip: string; onDone: () => void; totalMs?: number }) {
    const [i, setI] = useState(0);

    const stepMs = useMemo(() => Math.max(450, Math.floor(totalMs / steps.length)), [totalMs]);

    useEffect(() => {
        const stepTimer = setInterval(() => {
            setI((p) => (p < steps.length - 1 ? p + 1 : p));
        }, stepMs);

        const done = setTimeout(() => {
            clearInterval(stepTimer);
            onDone();
        }, totalMs);

        return () => {
            clearInterval(stepTimer);
            clearTimeout(done);
        };
    }, [onDone, stepMs, totalMs]);

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[60] grid place-items-center bg-black/70 backdrop-blur"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
                <div className="card p-6 w-[min(92vw,800px)] text-center bg-black/70">
                    <h3 className="text-xl font-bold">Scanning {zip}…</h3>

                    <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/10">
                        <motion.div
                            className="h-full w-1/3 bg-gradient-to-r from-brand-purple to-brand-magenta"
                            initial={{ x: "-100%" }} animate={{ x: "300%" }}
                            transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
                        />
                    </div>

                    <div className="mt-4 h-6 overflow-hidden">
                        <motion.div
                            key={i}
                            initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }}
                            transition={{ duration: .25 }}
                            className="text-sm text-white/80"
                        >
                            {steps[i]}
                        </motion.div>
                    </div>

                    <SuccessHeroSlider
                        items={[
                            { src: "/success/906214d1-f74a-427a-9745-0d76e76ce16b.png", caption: "BOXES TO BANK IN 24H" },
                            { src: "/success/78bd80e2-2c2b-4a68-ac30-89ce9dbed60d.png", caption: "PRO TOOLS AT PENNY PRICES" },
                            { src: "/success/949ca9d4-5f82-4a40-9c87-2a61e22d27c0.jpg", caption: "SEALED POKÉMON MOVING CHEAP" },
                            { src: "/success/99078559-e25f-42c7-a691-fe0b4e88c05b.jpg", caption: "GALAXY TAB HAUL LIVE" },
                            { src: "/success/4dbf0823-7ec7-48ec-9786-c041503fcd2b.png", caption: "FIRE STICKS AT A PENNY — CART ‘EM" },
                            { src: "/success/6908e66c-668f-4501-83fe-6770a5f3b024.jpg", caption: "$800 PHONES DOWN TO $74" },
                            { src: "/success/4dcb9289-bdc5-4c28-81e7-96d6015fe614.png", caption: "NINTENDO SWITCH HAUL — STUPID LOW" },
                            { src: "/success/ebbbaa5a-3ca0-47f0-a1cb-d66a8f1dac12.png", caption: "FREE CHIPOTLE MEALS — $16 BAG TOTAL → $0.00" },
                            { src: "/success/8e4b238e-381b-4873-a0a2-dc236bfc18b7.jpg", caption: "SEALED POKÉMON AT DUMP PRICING" },
                            { src: "/success/659a7d01-ff20-4a5a-9710-358b841ac6df.png", caption: "FIRE TV BULK AT PENNY-LEVEL" },
                            { src: "/success/01c6e90b-dad7-4cc2-a0aa-550f02fcc6c7.webp", caption: "$350 BATHROOM VANITY COMBO FOR $0.01" },
                            { src: "/success/16a091d8-1bd7-4cc2-907c-912882b40172.png", caption: "FAMILY MEALS RINGING $0.00 — LIVE" },
                            { src: "/success/0fd30ad2-0f84-4a4f-860f-a304b324937d.png", caption: "$800+ IN LIGHTS FOR $0.01 EACH" },
                            { src: "/success/c21df215-c58f-4ec5-a8a9-ceaa5ba6b93e.png", caption: "DYSON VACUUMS DOWN TO A PENNY — GO NOW" },
                            { src: "/success/b946e987-dc13-4221-ac4d-03814d260d4f.png", caption: "GOOGLE NEST HUBS SCANNING $0.01 — RUN IT" },
                            { src: "/success/d0406031-3b89-465d-a7ea-748bd78e36ef.jpg", caption: "CARTS OF POKÉMON FOR PENNIES — STOCK UP FAST" },
                            { src: "/success/91702644-8188-4f87-b262-7fd40c5d9d7d.webp", caption: "$249 → $0.01 — CONFIRMED" },
                            { src: "/success/5f57b9c0-9787-4e21-b151-4127b3cb8a21.png", caption: "$0.56 RECEIPT — NO TYPO" },
                            { src: "/success/33c67520-e042-4663-9b6e-59821aaf4bce.jpg", caption: "INSTINCT 2S RINGING DIRT CHEAP" },
                            { src: "/success/75e866bf-18a8-44af-8b58-f4138f8f216c.png", caption: "$500+ DOWN TO $0.01 — LIVE" },
                            { src: "/success/54e6f19c-c305-48d5-ac3e-10cb5ddfbf77.png", caption: "TABLETS IN, PAYOUT OUT" },
                            { src: "/success/124f290b-24df-4fec-b09e-7778f4c33e13.png", caption: "FOUR FIGURES LOADED" },
                            { src: "/success/86b87719-9c9b-4abe-adb5-f1298b3c5d78.jpg", caption: "98% OFF VACUUMS HITTING AGAIN" },
                            { src: "/success/d96cb7ff-a02d-4f25-a219-f24e54c570ec.jpg", caption: "POLAROID CAMERAS 98% OFF — CLEARANCE IS HITTING" },
                            { src: "/success/d0b30164-43ed-49ba-8d6f-841e06c90163.png", caption: "DEWALT FRAMING NAILER KIT: ONE PENNY RIGHT NOW" },
                            { src: "/success/4654a519-5932-46a2-bf13-0abed17ff2be.png", caption: "40V XGT MAKITA — $0.01 TODAY" },
                            { src: "/success/a4991336-170a-438a-9b32-193a41b3ae9a.jpg", caption: "WINDOW A/Cs 95–98% OFF — SUMMER PROFITS LOADING" },
                            { src: "/success/cc26c58d-4d4b-4ac1-8d73-a72bb721e5ab.jpg", caption: "RYOBI WORK LIGHTS RINGING $0.01 — TRUNKS FULL NOW" },
                            { src: "/success/c5477e7d-9777-4808-9cb8-5269f43eb5b1.jpg", caption: "1¢ TECH IS RINGING ALL DAY — DON’T SLEEP" },
                            { src: "/success/74ff36d5-92dd-446d-8484-f132c621c58c.png", caption: "$16 BOWL FOR $0 — CONFIRMED" },
                            { src: "/success/2b49ffdc-7333-4ea7-8c24-f4d57eb0280e.png", caption: "SHARK CORDLESS FOR A PENNY — LIVE" },
                            { src: "/success/bbf1594e-91b4-45dd-be13-7b2ee8067a3d.jpg", caption: "SMART LOCKS AT $0.04 EACH — CRAZY MARGINS" },
                            { src: "/success/198fdf17-948f-4f7d-8af2-cabe976aa30e.jpg", caption: "$549 → $0.01 AT THE REGISTER" },
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