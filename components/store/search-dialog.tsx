"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Package } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command";
import { getProducts } from "@/lib/actions";
import { formatPrice } from "@/lib/utils";

type Product = Awaited<ReturnType<typeof getProducts>>[number];

export function SearchDialog({ currency = "USD" }: { currency?: string }) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open && products.length === 0) {
      getProducts({ isActive: true }).then(setProducts);
    }
  }, [open, products.length]);

  const handleSelect = (slug: string) => {
    setOpen(false);
    router.push(`/products/${slug}`);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md px-2 py-2 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        aria-label="Search products"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline text-sm">Search</span>
        <kbd className="hidden sm:inline text-[10px] text-gray-400 border border-gray-200 rounded px-1 py-0.5 ml-0.5">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search products..." />
        <CommandList>
          <CommandEmpty>
            <Package className="h-8 w-8 text-gray-200 mb-2" />
            No products found.
          </CommandEmpty>
          <CommandGroup heading="Products">
            {products.map((product) => {
              const items = (product.mediaItems as Array<{ url: string; type: string }>) ?? [];
              const firstImg = items.find((m) => m.type === "image");
              return (
                <CommandItem
                  key={product.id}
                  value={product.name + " " + (product.category?.name ?? "") + " " + (product.description ?? "")}
                  onSelect={() => handleSelect(product.slug)}
                >
                  {firstImg ? (
                    <img
                      src={firstImg.url}
                      alt={product.name}
                      className="h-9 w-9 rounded-md object-cover shrink-0 bg-gray-100"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                      <Package className="h-4 w-4 text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    {product.category && (
                      <p className="text-xs text-gray-400">{product.category.name}</p>
                    )}
                  </div>
                  <CommandShortcut>{formatPrice(product.price, currency)}</CommandShortcut>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
        <div className="border-t border-gray-100 px-4 py-2 flex items-center gap-4 text-[11px] text-gray-400">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </CommandDialog>
    </>
  );
}
