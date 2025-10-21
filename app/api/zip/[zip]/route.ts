import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import zipData from "@/data/zips.json";
import storesRaw from "@/data/stores.json";

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

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 3958.8; // miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const coordFile = fs.readFileSync(path.join(process.cwd(), "data/coords.txt"), "utf-8");
const coordMap = new Map<number, { lat: number; lon: number }>();
for (const raw of coordFile.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("ZIP")) continue;
    const parts = line.split(",").map((v) => v.trim());
    if (parts.length < 3) continue;
    const [zipStr, latStr, lonStr] = parts;
    const zip = Number(zipStr), lat = Number(latStr), lon = Number(lonStr);
    if (!Number.isFinite(zip) || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    coordMap.set(zip, { lat, lon });
}

const zipByCode = new Map<number, ZipEntry>();
for (const z of zips) zipByCode.set(z.zip_code, z);

function topNUniqueCities(base: ZipEntry, baseCoord: { lat: number; lon: number }, n = 5) {
    const sorted = [...zips]
        .map((z) => ({ z, d: haversineDistance(baseCoord.lat, baseCoord.lon, z.latitude, z.longitude) }))
        .sort((a, b) => a.d - b.d);

    const result: string[] = [];
    const seen = new Set<string>();

    result.push(base.city);
    seen.add(base.city);

    for (const { z } of sorted) {
        if (result.length >= n) break;
        const city = z.city;
        if (!seen.has(city)) {
            seen.add(city);
            result.push(city);
        }
    }

    return result.slice(0, n);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ zip: string }> }) {
    const { zip: zipStr } = await params;

    const zip = Number(zipStr);
    if (!Number.isFinite(zip)) {
        return NextResponse.json({ error: "Invalid ZIP" }, { status: 400 });
    }

    const base = zipByCode.get(zip);
    if (!base) {
        return NextResponse.json({ error: "ZIP not found" }, { status: 404 });
    }

    const baseCoord = coordMap.get(zip) ?? { lat: base.latitude, lon: base.longitude };

    const nearestStores = stores
        .map((s) => {
            const pzip = Number(s.postal_code);
            const z = zipByCode.get(pzip);
            if (!z) return null;
            const dist = haversineDistance(baseCoord.lat, baseCoord.lon, z.latitude, z.longitude);
            return { store: s, zip: z, distance: dist };
        })
        .filter((x): x is { store: StoreEntry; zip: ZipEntry; distance: number } => !!x)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5);

    const addresses = nearestStores.map((x) => x.store.address);
    const uniqueCities = topNUniqueCities(base, baseCoord, 5);

    return NextResponse.json({
        zip_code: base.zip_code,
        city: base.city,
        state: base.state,
        county: base.county,
        latitude: base.latitude,
        longitude: base.longitude,
        cities: uniqueCities,
        addresses,
    });
}