"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const phrases = [
    "a penny",
    "90% off",
    "clearance steals",
    "wild markdowns",
];

export default function RotatingHeadline() {
    const [idx, setIdx] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setIdx((i) => (i + 1) % phrases.length), 1700);
        return () => clearInterval(t);
    }, []);

    return (
        <h1 className="text-5xl sm:text-6xl font-black leading-[1.05] tracking-tight">
            Find deals for{" "}
            {/* keep on the same line */}
            <span className="whitespace-nowrap inline-flex relative">
                <AnimatePresence mode="wait">
                    <motion.span
                        key={phrases[idx]}
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: "0%", opacity: 1 }}
                        exit={{ y: "-100%", opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="bg-gradient-to-r from-brand-purple to-brand-magenta bg-clip-text text-transparent"
                    >
                        {phrases[idx]}
                    </motion.span>
                </AnimatePresence>
            </span>{" "}
            in your area.
        </h1>
    );
}
