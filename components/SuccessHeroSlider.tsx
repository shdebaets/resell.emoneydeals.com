"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import { AnimatePresence, motion } from "framer-motion";
import RotatingTitle from "./RotatingTitle";

import "swiper/css";
import "swiper/css/effect-fade";

type Item = { src: string; caption?: string };
type Props = {
    items: Item[];
    height?: number;
    autoplayMs?: number;
    className?: string;
};

export default function SuccessHeroSlider({
    items,
    height = 560,
    autoplayMs = 2200,
    className = "",
}: Props) {
    const pool = useMemo(() => {
        const seen = new Set<string>();
        return items.filter(({ src }) => (seen.has(src) ? false : (seen.add(src), true)));
    }, [items]);

    useEffect(() => {
        pool.forEach(({ src }) => {
            const img = new window.Image();
            img.decoding = "async";
            img.loading = "eager";
            img.src = src;
        });
    }, [pool]);

    const [open, setOpen] = useState<string | null>(null);
    const [idx, setIdx] = useState(0);

    const cardH = height;
    const cardW = Math.round((cardH * 16) / 9);

    if (!pool.length) return null;

    return (
        <div className={`relative ${className}`}>
            <div className="mx-auto max-w-[1248px] px-2 py-4">
                <RotatingTitle title={pool[idx]?.caption ?? ""} />

                <Swiper
                    modules={[Autoplay, EffectFade]}
                    effect="fade"
                    fadeEffect={{ crossFade: true }}
                    slidesPerView={1}
                    centeredSlides
                    loop
                    autoplay={{ delay: autoplayMs, disableOnInteraction: false, pauseOnMouseEnter: false }}
                    allowTouchMove
                    onSlideChange={(swiper) => setIdx(swiper.realIndex)}
                    className="select-none mt-4 mx-auto"
                    style={{ width: cardW, height: cardH }}
                >
                    {pool.map(({ src, caption }, i) => (
                        <SwiperSlide key={`${src}-${i}`}>
                            <button
                                aria-label="Open success image"
                                onClick={() => setOpen(src)}
                                className="relative block overflow-hidden rounded-2xl border border-white/10 shadow-2xl leading-none"
                                style={{
                                    width: cardW,
                                    height: cardH,
                                    contain: "layout paint size",
                                    background: "transparent",
                                }}
                            >
                                <Image
                                    src={src}
                                    alt={caption ?? ""}
                                    fill
                                    sizes={`${cardW}px`}
                                    className="absolute inset-0 h-full w-full object-cover"
                                    priority={i < 4}
                                />

                                
                                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
                            </button>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        className="fixed inset-0 z-[70] grid place-items-center bg-black/85"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.97 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-xl border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={open}
                                alt=""
                                width={900}
                                height={1600}
                                className="h-[min(90vh,1600px)] w-auto object-contain bg-black"
                                sizes="90vw"
                                priority
                            />
                            <button
                                onClick={() => setOpen(null)}
                                className="absolute right-3 top-3 rounded-md bg-black/60 px-3 py-1 text-sm hover:bg-black/80"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}