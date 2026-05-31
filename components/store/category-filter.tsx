"use client";

import { useState } from "react";
import { ProductGrid } from "./product-grid";
import { Package } from "lucide-react";

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

  // When a category is selected: show only its products (or empty state)
  if (selected !== null) {
    const cat = activeCategories.find((c) => c.id === selected)!;
    const catProducts = products.filter((p) => p.categoryId === selected);

    return (
      <>
        {activeCategories.length > 1 && (
          <FilterBar categories={activeCategories} selected={selected} onToggle={toggle} />
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

  // Default: show all categories with products (skip empty ones)
  return (
    <>
      {activeCategories.length > 1 && (
        <FilterBar categories={activeCategories} selected={null} onToggle={toggle} />
      )}

      {activeCategories.length > 0 ? (
        activeCategories.map((cat) => {
          const catProducts = products.filter((p) => p.categoryId === cat.id);
          if (catProducts.length === 0) return null;
          return (
            <section key={cat.id} className="mb-12">
              <div className="mb-5 flex items-baseline justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{cat.name}</h2>
                <span className="text-xs text-gray-400">{catProducts.length} items</span>
              </div>
              <ProductGrid products={catProducts} whatsappNumber={whatsappNumber} currency={currency} />
            </section>
          );
        })
      ) : (
        <section>
          <ProductGrid products={products} whatsappNumber={whatsappNumber} currency={currency} />
        </section>
      )}
    </>
  );
}

function FilterBar({
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
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onToggle(cat.id)}
            className={[
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              selected === cat.id
                ? "bg-gray-900 text-white border-gray-900"
                : "border-gray-200 text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900",
            ].join(" ")}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
