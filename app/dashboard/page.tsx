"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { isUSZip, cleanUSZip } from "@/lib/zip";
import ItemCard from "@/components/ItemCard";
import Modal from "@/components/Modal";
import SkeletonCard from "@/components/SkeletonCard";
import { gaEvent } from "@/app/(lib)/ga";
import SuccessHeroSlider from "@/components/SuccessHeroSlider";
import { useSearchParams, useRouter } from "next/navigation";
import ScanOverlayPurchase from "@/components/ScanOverlayPurchase";

const SIGNUP_URL = "https://www.emoneyreselling.com/getaccess";

type ApiResp = { items: any[]; count: number };

interface ZipData {
    zip_code: number;
    city: string;
    state: string;
    county: string;
    latitude: number;
    longitude: number;
    cities: string[];
    uniqueCities: string[];
    addresses: string[];
}

type FomoProps = {
    min?: number;
    max?: number;
    durationMs?: number;
    autoReset?: boolean;
    onExpire?: () => void;
    label?: string;
};

export default function Dashboard() {
    const searchParams = useSearchParams();
    const initialZip = searchParams.get("zip");
    const [zip, setZip] = useState(cleanUSZip(initialZip || ""));
    const [data, setData] = useState<ApiResp | null>(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [zipData, setZipData] = useState<ZipData | null>(null);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        const next = cleanUSZip(initialZip || "");
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

            const response = await fetch(`/api/zip/${z}`);

            const data = await response.json();

            setZipData(data);
        } catch (e) {
            console.error("Error fetching items:", e);
            setData({ items: [], count: 0 });
            setZipData(null);
        } finally {
            setLoading(false);
        }
    }

    function finalizeRoute() {
        const url = `${SIGNUP_URL}?src=dashboard_modal&zip=${encodeURIComponent(zip)}`;
        gaEvent("buy_click", { zip, url });
        window.open(url, "_blank");
    }

    const router = useRouter();

    function getDealItem(item: any) {
        setSelectedItem(item);
        setScanning(true);
    }

    function openPurchaseOverlay() {
        setScanning(false);
        setOpen(true);
    }

    if (!isUSZip(zip) || !initialZip || !initialZip?.length) {
        router.push("/");
        return null;
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
                                <ItemCard item={it} cities={zipData?.cities || []} onClick={() => getDealItem(it)} className="h-full" />
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
                <h3 className="text-xl font-bold">ACCESS THOUSANDS OF 99% OFF DEALS NOW 🤫</h3>
                <p className="text-sm text-white/70 mt-1">
                    Upgrade to access our hidden clearance AI software
                </p>

                <div className="items-center justify-center text-center">
                    <div className="mt-6">
                        <div className="inline-flex items-center justify-center rounded-xl px-4 py-2 font-semibold transition bg-[color:var(--card)] border border-white/10" onClick={finalizeRoute}>
                            <div className="w-[10px] h-[10px] rounded-full bg-green-400 animate-pulse"></div> &nbsp; Upgrade to VIP to Unlock These Deals 🔓
                        </div>

                    </div>

                    <SuccessHeroSlider
                        items={[
                            { src: "/success/success1.png", caption: "$400 CAMERAS ARE RINGING UP FOR $18 ...👀" },
                            { src: "/success/success2.png", caption: "$5 GAMING LAPTOPS ON AMAZON🤫" },
                            { src: "/success/success4.jpg", caption: "AIRPODS ARE GLITCHING TO 90% OFF🤯" },
                            { src: "/success/success5.png", caption: "ENTIRE GAMING PC FOR $125 …🤫" },
                            { src: "/success/successwin3.jpg", caption: "$250 VACUUMS FOR $0.01 ..👀" },
                            { src: "/success/success6.png", caption: "$500 T.V. FOR $65 😱" },
                            { src: "/success/success7.png", caption: "$215 TENT DOWN TO $0.75 … 🚨" },
                            { src: "/success/success9.png", caption: "90% OFF IPADS GLITCH 🤯" },
                            { src: "/success/successwin11.jpg", caption: "EVERYTHING IS GLITCHING FOR 90% OFF 🤣" },
                            { src: "/success/success10.png", caption: "GAMING MONITORS FOR $20 😱" },
                            
                        ]}
                        height={300}
                        autoplayMs={1200}
                        className="mx-auto"
                    />
                </div>

                <div className="mt-3 flex items-center justify-center">
                    <FomoBadge min={18} max={42} durationMs={15 * 60_000} />
                </div>

                <div className="flex items-center justify-center">
                    <button className="btn btn-primary mt-4 py-4! cursor-pointer hover:opacity-80 transition-all duration-200" onClick={finalizeRoute}>
                        Upgrade to VIP to Unlock These Deals 🔓
                    </button>
                </div>

                <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm -translate-x-1/3 -translate-y-1/3 shadow-glow">
                        %25 OFF
                </div>
            </Modal>

            {scanning && <ScanOverlayPurchase item={selectedItem} cities={zipData?.cities || []} onDone={openPurchaseOverlay} />}
        </div>
    );
}

function FomoBadge({
    min = 17,
    max = 33,
    durationMs = 15 * 60_000,
    autoReset = false,
    onExpire,
    label = "bought in the last hour",
}: FomoProps) {
    const randInt = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
    const [count] = useState(() => randInt(min, max));
    const endTs = useRef<number>(Date.now() + durationMs);
    const [remaining, setRemaining] = useState<number>(durationMs);

    // keep min/max valid
    const safeCount = useMemo(
        () => Math.min(Math.max(count, Math.min(min, max)), Math.max(min, max)),
        [count, min, max]
    );

    useEffect(() => {
        // reset endTs when duration changes
        endTs.current = Date.now() + durationMs;
        setRemaining(durationMs);

        const id = window.setInterval(() => {
            const left = Math.max(0, endTs.current - Date.now());
            setRemaining(left);

            if (left === 0) {
                onExpire?.();
                if (autoReset) {
                    endTs.current = Date.now() + durationMs;
                    setRemaining(durationMs);
                } else {
                    window.clearInterval(id);
                }
            }
        }, 1000);

        return () => window.clearInterval(id);
    }, [durationMs, autoReset, onExpire]);

    const mm = String(Math.floor(remaining / 60_000)).padStart(2, "0");
    const ss = String(Math.floor((remaining % 60_000) / 1000)).padStart(2, "0");
    const urgent = remaining <= 60_000; // last minute → subtle pulse

    return (
        <span
            className={[
                "inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5",
                "px-3 py-1 text-xs font-semibold text-white/80",
                urgent ? "ring-1 ring-red-500/20 animate-[pulse_1.6s_ease-in-out_infinite]" : "",
            ].join(" ")}
            aria-live="polite"
            title={`Offer window ends in ${mm}:${ss}`}
        >
            <span className="text-base leading-none">🔥</span>
            <span>
                <strong className="text-white">{safeCount}</strong> {label}
            </span>
            <span className="inline-flex items-center gap-1 text-white/70">
                • <span className="tabular-nums">{mm}:{ss}</span>
            </span>
        </span>
    );
}
