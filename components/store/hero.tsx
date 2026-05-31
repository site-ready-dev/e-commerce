"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  mediaUrl: string;
  mediaType: string;
  isFullScreen: boolean;
  ctaText: string | null;
  ctaUrl: string | null;
}

export function HeroSection({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const banner = banners[current];
  const heightClass = banner.isFullScreen ? "h-[100svh]" : "h-[480px]";
  const hasText = banner.title || banner.subtitle || banner.ctaText;
  const isClickable = !banner.ctaText && !!banner.ctaUrl;

  return (
    <section
      className={cn("relative w-full overflow-hidden bg-gray-900", heightClass, isClickable && "cursor-pointer")}
      onClick={isClickable ? () => router.push(banner.ctaUrl!) : undefined}
    >
      {banners.map((b, i) => (
        <div
          key={b.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            i === current ? "opacity-100" : "opacity-0"
          )}
        >
          {b.mediaType === "video" ? (
            <video
              src={b.mediaUrl}
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={b.mediaUrl}
              alt={b.title || "Banner"}
              className="h-full w-full object-cover"
            />
          )}
          {hasText && <div className="absolute inset-0 bg-black/40" />}
        </div>
      ))}

      {hasText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          {banner.title && (
            <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl max-w-3xl leading-tight">
              {banner.title}
            </h1>
          )}
          {banner.subtitle && (
            <p className="mt-4 text-lg text-white/80 max-w-xl">{banner.subtitle}</p>
          )}
          {banner.ctaText && banner.ctaUrl && (
            <Link
              href={banner.ctaUrl}
              onClick={(e) => e.stopPropagation()}
              className="mt-8 inline-flex items-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {banner.ctaText}
            </Link>
          )}
        </div>
      )}

      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + banners.length) % banners.length); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % banners.length); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === current ? "w-6 bg-white" : "w-1.5 bg-white/50"
                )}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
