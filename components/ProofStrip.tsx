"use client";
import { motion } from "framer-motion";

export default function ProofStrip() {
    const items = [
        "Real people finding penny deals",
        "Shelving, tools, home goods & more",
        "Results vary by ZIP — check yours",
    ];
    return (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-white/70">
            {items.map((t, i) => (
                <motion.span
                    key={t}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 * i, duration: .25 }}
                    className="badge bg-white/5"
                >
                    {t}
                </motion.span>
            ))}
        </div>
    );
}