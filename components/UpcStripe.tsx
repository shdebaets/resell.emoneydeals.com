"use client";

import { useEffect, useMemo, useRef } from "react";
import clsx from "clsx";

type Normalized =
    | { format: "UPC"; value: string }
    | { format: "EAN13"; value: string }
    | { format: "EAN8"; value: string };

function normalizeBarcode(raw?: unknown): Normalized | null {
    if (raw == null) return null;

    const d = String(raw).trim().replace(/\D/g, "");

    if (d.length === 12) return { format: "UPC", value: d };

    if (d.length === 11) {
        let odd = 0, even = 0;
        for (let i = 0; i < 11; i++) (i % 2 === 0 ? (odd += +d[i]) : (even += +d[i]));
        const check = (10 - ((odd * 3 + even) % 10)) % 10;
        return { format: "UPC", value: d + check };
    }

    if (d.length === 13) {
        if (d.startsWith("0")) {
            return { format: "UPC", value: d.slice(1) };
        }
        return { format: "EAN13", value: d };
    }

    if (d.length === 8) return { format: "EAN8", value: d };

    return null;
}

export function UpcStripe({
    upc,
    className,
    height = 68,
}: {
    upc?: unknown;
    className?: string;
    height?: number;
}) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const norm = useMemo(() => normalizeBarcode(upc), [upc]);

    useEffect(() => {
        if (!norm || !svgRef.current) return;
        (async () => {
            const JsBarcode = (await import("jsbarcode")).default;
            JsBarcode(svgRef.current, norm.value, {
                format: norm.format,
                displayValue: true,
                background: "transparent",
                lineColor: "#ffffff",
                margin: 0,
                textMargin: 2,
                fontSize: 12,
                width: 2,
                height: Math.max(40, height - 12),
            });
        })();
    }, [norm, height]);

    if (!norm) {
        return (
            <div className={clsx("relative w-full overflow-hidden rounded-md", className)} style={{ height }}>
                <div
                    className="h-full w-full blur-[2px] opacity-90"
                    style={{
                        background:
                            "repeating-linear-gradient(90deg, rgba(255,255,255,.95) 0 2px, rgba(0,0,0,1) 2px 6px)",
                    }}
                />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_70%_at_50%_50%,transparent,rgba(0,0,0,.75))]" />
            </div>
        );
    }

    return (
        <div
            className={clsx("relative w-full overflow-hidden rounded-md bg-black/95", className)}
            style={{ height }}
        >
            <svg ref={svgRef} className="h-full w-full" role="img" aria-label={`${norm.format} ${norm.value}`} />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_70%_at_50%_50%,transparent,rgba(0,0,0,.75))]" />
        </div>
    );
}
