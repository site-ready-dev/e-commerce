"use client";

import { useState } from "react";
import { ProductGrid } from "./product-grid";
import { Package, Tag } from "lucide-react";

type MediaItem = { url: string; type: string };

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  mediaItems: MediaItem[];
  description: string | null;
  categoryId: string | null;
  isFeatured: boolean;
  stock: number;
  category: { name: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  isActive: boolean;
  _count: { products: number };
}

interface CategoryFilterProps {
  products: Product[];
  categories: Category[];
  whatsappNumber: string | null;
  currency?: string;
}

export function CategoryFilter({ products, categories, whatsappNumber, currency = "USD" }: CategoryFilterProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const activeCategories = categories.filter((c) => c.isActive);

  const toggle = (id: string) => setSelected((prev) => (prev === id ? null : id));

  // A category is selected — show only its products
  if (selected !== null) {
    const cat = activeCategories.find((c) => c.id === selected)!;
    const catProducts = products.filter((p) => p.categoryId === selected);

    return (
      <>
        {activeCategories.length > 1 && (
          <CategoryCards categories={activeCategories} selected={selected} onToggle={toggle} />
        )}
        <section>
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{cat.name}</h2>
            <span className="text-xs text-gray-400">{catProducts.length} items</span>
          </div>
          {catProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
              <Package className="h-8 w-8 text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-500">No products in this category</p>
              <button
                onClick={() => setSelected(null)}
                className="mt-3 text-xs text-gray-400 underline underline-offset-2 hover:text-gray-700"
              >
                View all products
              </button>
            </div>
          ) : (
            <ProductGrid products={catProducts} whatsappNumber={whatsappNumber} currency={currency} />
          )}
        </section>
      </>
    );
  }

  // No category selected — show category cards then all products flat (no section labels)
  return (
    <>
      {activeCategories.length > 1 && (
        <CategoryCards categories={activeCategories} selected={null} onToggle={toggle} />
      )}
      <ProductGrid products={products} whatsappNumber={whatsappNumber} currency={currency} />
    </>
  );
}

function CategoryCards({
  categories,
  selected,
  onToggle,
}: {
  categories: Category[];
  selected: string | null;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="mb-10">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
        Browse by Category
      </h2>
      <div className="flex gap-3 overflow-x-auto p-1 -mx-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selected === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onToggle(cat.id)}
              className={[
                "shrink-0 flex flex-col items-center gap-1.5 rounded-xl p-1.5 transition-all",
                isSelected
                  ? "ring-2 ring-gray-900 bg-gray-50"
                  : "ring-1 ring-gray-100 hover:ring-gray-300 bg-white",
              ].join(" ")}
            >
              <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Tag className="h-6 w-6 text-gray-300" />
                )}
              </div>
              <span className={[
                "text-xs font-medium max-w-18 text-center leading-tight truncate w-full",
                isSelected ? "text-gray-900" : "text-gray-600",
              ].join(" ")}>
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
