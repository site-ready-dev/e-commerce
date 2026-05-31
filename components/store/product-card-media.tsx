"use client";

import { useState, useRef } from "react";
import { Package, ChevronLeft, ChevronRight } from "lucide-react";

type MediaItem = { url: string; type: string };

interface ProductCardMediaProps {
  mediaItems: MediaItem[];
  name: string;
}

export function ProductCardMedia({ mediaItems, name }: ProductCardMediaProps) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (mediaItems.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Package className="h-12 w-12 text-gray-200" />
      </div>
    );
  }

  const current = mediaItems[index];
  const hasMultiple = mediaItems.length > 1;

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    setIndex((i) => (i - 1 + mediaItems.length) % mediaItems.length);
  };

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    setIndex((i) => (i + 1) % mediaItems.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      setIndex((i) =>
        delta < 0
          ? (i + 1) % mediaItems.length
          : (i - 1 + mediaItems.length) % mediaItems.length
      );
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="relative h-full w-full group"
      onTouchStart={hasMultiple ? onTouchStart : undefined}
      onTouchEnd={hasMultiple ? onTouchEnd : undefined}
    >
      {current.type === "video" ? (
        <video
          key={current.url}
          src={current.url}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className="h-full w-full object-cover"
        />
      ) : (
        <img
          src={current.url}
          alt={name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          decoding="async"
        />
      )}

      {/* Prev / Next arrows — desktop only, on hover */}
      {hasMultiple && (
        <>
          <button
            onClick={prev}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
          >
            <ChevronLeft className="h-3.5 w-3.5 text-gray-700" />
          </button>
          <button
            onClick={next}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
          >
            <ChevronRight className="h-3.5 w-3.5 text-gray-700" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
            {mediaItems.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); setIndex(i); }}
                className={[
                  "rounded-full transition-all",
                  i === index
                    ? "bg-white w-3.5 h-1.5"
                    : "bg-white/60 w-1.5 h-1.5",
                ].join(" ")}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
