"use client";

import { useState } from "react";
import { Package, PlayCircle } from "lucide-react";

type MediaItem = { url: string; type: string };

interface ProductImagesProps {
  mediaItems: MediaItem[];
  name: string;
}

export function ProductImages({ mediaItems, name }: ProductImagesProps) {
  const [selected, setSelected] = useState(0);

  if (mediaItems.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-gray-100 flex items-center justify-center">
        <Package className="h-24 w-24 text-gray-200" />
      </div>
    );
  }

  const current = mediaItems[selected];

  return (
    <div className="space-y-3">
      {/* Main view */}
      <div className="aspect-square rounded-2xl bg-gray-50 overflow-hidden border border-gray-100">
        {current.type === "video" ? (
          <video
            key={current.url}
            src={current.url}
            controls
            className="h-full w-full object-contain bg-black"
            preload="metadata"
            playsInline
          />
        ) : (
          <img
            src={current.url}
            alt={name}
            className="h-full w-full object-cover"
            fetchPriority={selected === 0 ? "high" : "auto"}
            decoding="async"
          />
        )}
      </div>

      {/* Thumbnail strip — images AND videos */}
      {mediaItems.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {mediaItems.map((item, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={[
                "relative flex-shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition-colors bg-gray-100",
                i === selected ? "border-gray-900" : "border-gray-100 hover:border-gray-300",
              ].join(" ")}
            >
              {item.type === "video" ? (
                <>
                  <video
                    src={item.url}
                    muted
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <PlayCircle className="h-5 w-5 text-white drop-shadow" />
                  </div>
                </>
              ) : (
                <img
                  src={item.url}
                  alt={`${name} ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
