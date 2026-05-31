import { getProducts, getCategories, getStoreSettings } from "@/lib/actions";
import { ProductsClient } from "./products-client";
import type { MediaItem } from "@/components/admin/media-items-editor";

export const dynamic = "force-dynamic";

type TypedProduct = Omit<Awaited<ReturnType<typeof getProducts>>[number], "mediaItems"> & {
  mediaItems: MediaItem[];
};

export default async function ProductsPage() {
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let currency = "USD";
  try {
    [products, categories] = await Promise.all([getProducts(), getCategories()]);
    const settings = await getStoreSettings();
    currency = settings.currency;
  } catch {}

  return <ProductsClient products={products as TypedProduct[]} categories={categories} currency={currency} />;
}
