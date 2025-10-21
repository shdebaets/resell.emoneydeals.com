"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { isUSZip, cleanUSZip } from "@/lib/zip";
import ItemCard from "@/components/ItemCard";
import Modal from "@/components/Modal";
import SkeletonCard from "@/components/SkeletonCard";
import { gaEvent } from "@/app/(lib)/ga";
import SuccessHeroSlider from "@/components/SuccessHeroSlider";

const SIGNUP_URL = "https://www.emoneyreselling.com/getaccess";

type ApiResp = { items: any[]; count: number };

export default function Dashboard({ initialZip }: { initialZip: string }) {
    const [zip, setZip] = useState(cleanUSZip(initialZip));
    const [data, setData] = useState<ApiResp | null>(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const next = cleanUSZip(initialZip);
        setZip(next);
    }, [initialZip]);

    useEffect(() => {
        if (isUSZip(zip)) fetchItems(zip);
        else setData(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [zip]);

    async function fetchItems(z: string) {
        setLoading(true);
        setData(null);
        try {
            const res = await fetch(`/api/items?zip=${encodeURIComponent(z)}`, {
                cache: "no-store",
            });
            const json = (await res.json()) as ApiResp;
            setData(json);
        } finally {
            setLoading(false);
        }
    }

    function finalizeRoute() {
        const url = `${SIGNUP_URL}?src=dashboard_modal&zip=${encodeURIComponent(zip)}`;
        gaEvent("buy_click", { zip, url });
        window.open(url, "_blank");
    }

    return (
        <div className="relative min-h-dvh pb-20">
            <section className="container py-6">
                <h1 className="text-2xl font-bold">🔥 Hot in your area</h1>

                {!zip || !isUSZip(zip) ? (
                    <div className="mt-4 card p-6">
                        <h3 className="text-lg font-semibold">Enter your US ZIP to scan</h3>
                        <div className="mt-4 flex gap-3 max-w-md">
                            <input
                                className="input"
                                placeholder="e.g. 33101 or 33101-1234"
                                value={zip}
                                onChange={(e) => setZip(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && isUSZip(zip) && fetchItems(zip)}
                            />
                            <button className="btn btn-primary" onClick={() => isUSZip(zip) && fetchItems(zip)}>Go</button>
                        </div>
                        {zip && !isUSZip(zip) && <p className="mt-2 text-xs text-red-300">Enter a valid US ZIP.</p>}
                    </div>
                ) : null}

                {data?.count ? (
                    <div className="mt-4 card p-4">
                        <div className="text-sm">
                            You have <strong>{data.count.toLocaleString()}</strong> items down to a penny showing up near <strong>{zip}</strong> right now.
                            <span className="ml-2 text-white/70">Click one of the deals to unlock.</span>
                        </div>
                    </div>
                ) : null}
            </section>

            <section className="container mt-4">
                {data === null ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : (
                    <div
                        key={`grid-${zip}`}
                        className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    >
                        {data.items.map((it) => (
                            <motion.div
                                key={it.id}
                                className="h-full"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25 }}
                            >
                                <ItemCard item={it} onClick={() => setOpen(true)} className="h-full" />
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            <AnimatePresence>
                {loading && (
                    <motion.div
                        className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                        <motion.div className="h-1 w-2/3 overflow-hidden rounded-full bg-white/10">
                            <motion.div
                                className="h-full w-1/3 bg-gradient-to-r from-brand-purple to-brand-magenta"
                                initial={{ x: "-100%" }}
                                animate={{ x: "300%" }}
                                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                            />
                        </motion.div>
                        <div className="mt-3 text-sm text-white/70">Scanning inventory near {zip}…</div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Modal open={open} onClose={() => setOpen(false)}>
                <h3 className="text-xl font-bold">Unlock the store & aisle</h3>
                <p className="text-sm text-white/70 mt-1">
                    These deals move fast. Upgrade to VIP to reveal store, aisle, and live stock for your ZIP.
                </p>

                <div className="items-center justify-center text-center">
                    <div className="mt-6">
                        <div className="inline-flex items-center justify-center rounded-xl px-4 py-2 font-semibold transition bg-[color:var(--card)] border border-white/10">
                            <div className="w-[10px] h-[10px] rounded-full bg-green-400 animate-pulse"></div> &nbsp; REAL MEMBER WINS
                        </div>

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
                </div>

                <a href="#" className="btn btn-primary w-full mt-4" onClick={finalizeRoute}>
                    Upgrade to VIP {" "} &nbsp; <strong> %25 OFF</strong>
                </a>
                <button className="btn w-full mt-2" onClick={() => setOpen(false)}>Maybe later</button>
            </Modal>
        </div>
    );
}