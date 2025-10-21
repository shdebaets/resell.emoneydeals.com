import { NextResponse } from "next/server";
import { isUSZip } from "@/lib/zip";
import raw from "@/items/items.json";

type RawItem = {
    id: number;
    current_price: number;
    previous_price: number;
    current_stock: number;
    distance_miles: number;
    price_last_updated?: string;
    current_update?: string;
    brand: string;
    item_name: string;
    store_city: string;
    store_state: string;
    location: string;
    image_link: string;
    retailer: string | null;
};

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

function stockHint(n: number): string {
    if (n <= 2) return "≤2";
    if (n <= 5) return "3-5";
    const lo = Math.max(1, Math.round(n * 0.8));
    const hi = Math.round(n * 1.2);
    return `${lo}-${hi}`;
}
function distanceHint(mi: number): string {
    if (!Number.isFinite(mi)) return "~";
    if (mi < 1) return "<1 mi";
    return `~${Math.round(mi)} mi`;
}
function updatedHint(iso?: string) {
    if (!iso) return "Updated recently";
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.max(0, Math.round(diff / 60000));
    if (m < 1) return "Updated just now";
    if (m < 60) return `Updated ${m}m ago`;
    const h = Math.round(m / 60);
    return `Updated ${h}h ago`;
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const zip = (searchParams.get("zip") || "").trim();
    if (!isUSZip(zip)) return NextResponse.json({ items: [], count: 0 });

    const db = raw as unknown as RawItem[];

    const shuffled = db
        .map((item) => ({ item, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ item }) => item);

    const items: SafeItem[] = shuffled.slice(0, 12).map((r) => ({
        id: String(r.id),
        name: r.item_name.slice(0, 140),
        brand: r.brand.slice(0, 60),
        price: r.current_price.toFixed(2),
        oldPrice: r.previous_price ? `$${r.previous_price.toFixed(2)}` : undefined,
        image: r.image_link,
        retailer: r.retailer || (Math.random() < 0.5 ? "Home Depot" : "Walmart"),
        stock_hint: stockHint(r.current_stock),
        distance_hint: distanceHint(r.distance_miles),
        updated_hint: updatedHint(r.price_last_updated || r.current_update),
    }));

    const count = Math.floor(350 + Math.random() * 550);
    return NextResponse.json({ items, count });
}