"use client";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function TopProgress() {
    const path = usePathname();
    const qp = useSearchParams();
    const bar = useRef<HTMLDivElement>(null);
    const finish = () => {
        if (!bar.current) return;
        bar.current.style.width = "100%";
        bar.current.style.opacity = "1";
        requestAnimationFrame(() => {
            setTimeout(() => {
                if (!bar.current) return;
                bar.current.style.opacity = "0";
                bar.current.style.width = "0%";
            }, 250);
        });
    };

    useEffect(() => {
        const el = bar.current!;
        if (!el) return;
        el.style.opacity = "1";
        el.style.width = "0%";
        let w = 0;
        const id = setInterval(() => {
            w = Math.min(95, w + 7 + Math.random() * 10);
            el.style.width = w + "%";
        }, 120);

        if (document.readyState === "complete") finish();
        else window.addEventListener("load", finish, { once: true });

        return () => { clearInterval(id); finish(); };
    }, [path, qp?.toString()]);

    return (
        <Suspense fallback={<div />}>
            <div className="fixed left-0 right-0 top-0 z-50 h-0.5 pointer-events-none">
                <div
                    ref={bar}
                    className="h-full w-0 origin-left bg-gradient-to-r from-brand-purple to-brand-magenta transition-[width,opacity] duration-300 ease-out"
                    style={{ opacity: 0 }}
                />
            </div>
        </Suspense>
    );
}