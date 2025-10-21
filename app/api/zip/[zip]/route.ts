import { NextResponse, NextRequest } from "next/server";
import zipData from "@/data/zips.json";
import storesRaw from "@/data/stores.json";
import coords from "@/data/coords.json";

type ZipEntry = {
    zip_code: number;
    city: string;
    state: string;
    county: string;
    latitude: number;
    longitude: number;
};
type StoreEntry = { store_id: string; postal_code: string; address: string };

const zips: ZipEntry[] = zipData as ZipEntry[];
const stores: StoreEntry[] = storesRaw as StoreEntry[];

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const R = 3958.8; // miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}

const zipByCode = new Map<number, ZipEntry>();
for (const z of zips) zipByCode.set(z.zip_code, z);

const zipCodesSorted = Int32Array.from([...zipByCode.keys()].sort((a, b) => a - b));

const coordMap = new Map<number, { lat: number; lon: number }>();
for (const c of coords as Array<{ zip: number; lat: number; lon: number }>) {
    if (Number.isFinite(c.zip) && Number.isFinite(c.lat) && Number.isFinite(c.lon)) {
        coordMap.set(c.zip, { lat: c.lat, lon: c.lon });
    }
}

const BUCKET = 0.5;
const keyOf = (lat: number, lon: number) =>
    `${Math.floor(lat / BUCKET)},${Math.floor(lon / BUCKET)}`;

const zipBuckets = new Map<string, number[]>();
zips.forEach((z, i) => {
    const k = keyOf(z.latitude, z.longitude);
    const arr = zipBuckets.get(k);
    if (arr) arr.push(i);
    else zipBuckets.set(k, [i]);
});

type StoreIdx = { i: number; lat: number; lon: number };
const storeBuckets = new Map<string, StoreIdx[]>();
stores.forEach((s, i) => {
    const z = zipByCode.get(Number(s.postal_code));
    if (!z) return;
    const k = keyOf(z.latitude, z.longitude);
    const arr = storeBuckets.get(k);
    const entry = { i, lat: z.latitude, lon: z.longitude };
    if (arr) arr.push(entry);
    else storeBuckets.set(k, [entry]);
});

function neighborKeys(lat: number, lon: number, radius = 1) {
    const baseLat = Math.floor(lat / BUCKET);
    const baseLon = Math.floor(lon / BUCKET);
    const keys: string[] = [];
    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            keys.push(`${baseLat + dy},${baseLon + dx}`);
        }
    }
    return keys;
}

function nearestZip(sorted: Int32Array, target: number): number {
    let lo = 0, hi = sorted.length - 1;
    if (target <= sorted[0]) return sorted[0];
    if (target >= sorted[hi]) return sorted[hi];
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const v = sorted[mid]!;
        if (v === target) return v;
        if (v < target) lo = mid + 1;
        else hi = mid - 1;
    }
    const higher = sorted[lo]!;
    const lower = sorted[hi]!;
    return target - lower <= higher - target ? lower : higher;
}

function topNUniqueCities(
    base: ZipEntry,
    baseCoord: { lat: number; lon: number },
    n = 5
) {
    const result: string[] = [];
    const seen = new Set<string>();

    result.push(base.city);
    seen.add(base.city);

    for (let r = 0; r <= 3 && result.length < n; r++) {
        const keys = neighborKeys(baseCoord.lat, baseCoord.lon, r);
        const candidates: number[] = [];
        for (const k of keys) {
            const arr = zipBuckets.get(k);
            if (arr) candidates.push(...arr);
        }
        const sorted = candidates
            .map((idx) => {
                const z = zips[idx]!;
                return {
                    city: z.city,
                    d: haversine(baseCoord.lat, baseCoord.lon, z.latitude, z.longitude),
                };
            })
            .sort((a, b) => a.d - b.d);

        for (const item of sorted) {
            if (result.length >= n) break;
            if (!seen.has(item.city)) {
                seen.add(item.city);
                result.push(item.city);
            }
        }
    }

    return result.slice(0, n);
}

function nearestStores(
    baseCoord: { lat: number; lon: number },
    k = 5
): StoreEntry[] {
    let picks: { i: number; d: number }[] = [];

    for (let r = 0; r <= 3; r++) {
        const keys = neighborKeys(baseCoord.lat, baseCoord.lon, r);
        const cand: StoreIdx[] = [];
        for (const k of keys) {
            const arr = storeBuckets.get(k);
            if (arr) cand.push(...arr);
        }
        if (cand.length === 0) continue;

        picks = cand
            .map((c) => ({
                i: c.i,
                d: haversine(baseCoord.lat, baseCoord.lon, c.lat, c.lon),
            }))
            .sort((a, b) => a.d - b.d)
            .slice(0, k);

        if (picks.length >= k) break;
    }

    return picks.map((p) => stores[p.i]!);
}

const MAX_CACHE = 1000;
const cache = new Map<number, any>();
function setCache(zip: number, value: any) {
    if (cache.size >= MAX_CACHE) {
        const first = cache.keys().next().value as number | undefined;
        if (first !== undefined) cache.delete(first);
    }
    cache.set(zip, value);
}

export async function GET(
    _req: NextRequest,
    ctx: { params: Promise<{ zip: string }> }
) {
    const { zip } = await ctx.params
    const zipNum = Number(zip);
    if (!Number.isFinite(zipNum)) {
        return NextResponse.json({ error: "Invalid ZIP" }, { status: 400 });
    }

    const hit = cache.get(zipNum);
    if (hit) {
        return NextResponse.json(hit, {
            headers: {
                "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
            },
        });
    }

    const found = zipByCode.get(zipNum) ?? zipByCode.get(nearestZip(zipCodesSorted, zipNum));
    if (!found) {
        return NextResponse.json({ error: "ZIP not found" }, { status: 404 });
    }

    const baseCoord =
        coordMap.get(zipNum) ?? { lat: found.latitude, lon: found.longitude };

    const cities = topNUniqueCities(found, baseCoord, 5);
    const storeList = nearestStores(baseCoord, 5);
    const addresses = storeList.map((s) => s.address);

    const body = {
        zip_code: found.zip_code,
        city: found.city,
        state: found.state,
        county: found.county,
        latitude: found.latitude,
        longitude: found.longitude,
        cities,
        addresses,
    };

    setCache(zipNum, body);

    return NextResponse.json(body, {
        headers: {
            "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
    });
}
