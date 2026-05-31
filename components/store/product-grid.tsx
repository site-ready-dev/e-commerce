import Link from "next/link";
import { buildWhatsAppUrl, formatPrice } from "@/lib/utils";
import { MessageCircle, ArrowRight } from "lucide-react";
import { ProductCardMedia } from "./product-card-media";

type MediaItem = { url: string; type: string };

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  mediaItems: MediaItem[];
  description: string | null;
  isFeatured: boolean;
  stock: number;
  category: { name: string } | null;
}

interface ProductGridProps {
  products: Product[];
  whatsappNumber: string | null;
  currency?: string;
}

export function ProductGrid({ products, whatsappNumber, currency = "USD" }: ProductGridProps) {
  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <div
          key={product.id}
          className={[
            "group rounded-xl border bg-white overflow-hidden transition-all duration-200",
            product.stock === 0
              ? "border-gray-100 opacity-60"
              : "border-gray-100 hover:shadow-md hover:border-gray-200",
          ].join(" ")}
        >
          <Link href={`/products/${product.slug}`} className="block">
            <div className="aspect-square bg-gray-50 overflow-hidden relative">
              <ProductCardMedia mediaItems={product.mediaItems} name={product.name} />
              {product.stock === 0 && (
                <div className="absolute inset-0 flex items-end justify-start p-2 pointer-events-none">
                  <span className="rounded-md bg-gray-900/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    Sold Out
                  </span>
                </div>
              )}
            </div>
          </Link>
          <div className="p-3">
            <Link href={`/products/${product.slug}`}>
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-gray-600 transition-colors">
                {product.name}
              </h3>
            </Link>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">{formatPrice(product.price, currency)}</span>
              {product.comparePrice && (
                <span className="text-xs line-through text-gray-400">
                  {formatPrice(product.comparePrice, currency)}
                </span>
              )}
            </div>
            <div className="mt-2.5 flex gap-1.5">
              <Link
                href={`/products/${product.slug}`}
                className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-gray-200 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                View <ArrowRight className="h-3 w-3" />
              </Link>
              {whatsappNumber && product.stock > 0 && (
                <a
                  href={buildWhatsAppUrl(whatsappNumber, product.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 rounded-lg bg-green-500 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="h-3 w-3" />
                  Buy
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
