"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const path = usePathname();
    const isLanding = path === "/" || path?.startsWith("/?");

    return (
        <nav className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-md">
            <div className="container h-16 flex items-center justify-between">
                <Link href="/" className="cusror-pointer flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-magenta shadow-glow" />
                    <span className="font-bold tracking-wide">EMONEY</span>
                </Link>
                
                {!isLanding && <div className="text-sm text-white/60">Deals near you</div>}
            </div>
        </nav>
    );
}