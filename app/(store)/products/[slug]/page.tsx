import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getStoreSettings } from "@/lib/actions";
import { buildWhatsAppUrl, formatPrice } from "@/lib/utils";
import Link from "next/link";
import { MessageCircle, ChevronLeft, Package, Tag } from "lucide-react";
import { ProductImages } from "@/components/store/product-images";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const [product, settings] = await Promise.all([
      getProductBySlug(slug),
      getStoreSettings(),
    ]);
    if (!product) return { title: "Product Not Found" };
    return {
      title: product.metaTitle || product.name,
      description: product.metaDescription || product.description || undefined,
      openGraph: {
        title: product.metaTitle || product.name,
        description: product.metaDescription || product.description || undefined,
        images: (() => {
          const items = (product.mediaItems as Array<{ url: string; type: string }>) ?? [];
          const first = items.find((m) => m.type === "image");
          return first ? [{ url: first.url, alt: product.name }] : [];
        })(),
        type: "website",
        siteName: settings.storeName,
      },
      other: {
        "product:price:amount": product.price.toString(),
        "product:price:currency": settings.currency || "USD",
      },
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let product: Awaited<ReturnType<typeof getProductBySlug>> = null;
  let whatsappNumber: string | null = null;
  let currency = "USD";

  try {
    const [p, settings] = await Promise.all([
      getProductBySlug(slug),
      getStoreSettings(),
    ]);
    product = p;
    whatsappNumber = settings.whatsappNumber || null;
    currency = settings.currency || "USD";
  } catch {}

  if (!product || !product.isActive) notFound();

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: ((product.mediaItems as Array<{ url: string; type: string }>) ?? [])
      .filter((m) => m.type === "image")
      .map((m) => m.url),
    sku: product.sku,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: currency,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to store
        </Link>

        <div className="grid gap-6 sm:gap-10 lg:grid-cols-2">
          <ProductImages
            mediaItems={(product.mediaItems as Array<{ url: string; type: string }>) ?? []}
            name={product.name}
          />

          <div className="flex flex-col">
            {product.category && (
              <div className="mb-3 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  {product.category.name}
                </span>
              </div>
            )}

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{product.name}</h1>

            {product.sku && (
              <p className="mt-1 text-xs text-gray-400">SKU: {product.sku}</p>
            )}

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price, currency)}
              </span>
              {product.comparePrice && (
                <>
                  <span className="text-lg line-through text-gray-400">
                    {formatPrice(product.comparePrice, currency)}
                  </span>
                  {discount && (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                      {discount}% off
                    </span>
                  )}
                </>
              )}
            </div>

            {product.description && (
              <div className="mt-6 border-t border-gray-100 pt-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3">
              {product.stock === 0 ? (
                <button
                  disabled
                  className="flex items-center justify-center gap-2 rounded-xl bg-gray-200 px-6 py-3.5 text-sm font-semibold text-gray-500 cursor-not-allowed"
                >
                  <Package className="h-5 w-5" />
                  Sold Out
                </button>
              ) : whatsappNumber ? (
                <a
                  href={buildWhatsAppUrl(whatsappNumber, product.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 rounded-xl bg-green-500 px-6 py-3.5 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  Buy via WhatsApp
                </a>
              ) : (
                <button
                  disabled
                  className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3.5 text-sm font-semibold text-white opacity-60 cursor-not-allowed"
                >
                  <Package className="h-5 w-5" />
                  Contact to Purchase
                </button>
              )}
            </div>

            <div className="mt-6 rounded-xl bg-gray-50 p-4 text-xs text-gray-500 space-y-1">
              <p>✓ Secure ordering via WhatsApp</p>
              <p>✓ Direct communication with seller</p>
              <p>✓ No hidden fees</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
