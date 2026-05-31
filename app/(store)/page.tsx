import type { Metadata } from "next";
import { getStoreSettings, getBanners, getProducts, getCategories } from "@/lib/actions";
import { HeroSection } from "@/components/store/hero";
import { CategoryFilter } from "@/components/store/category-filter";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getStoreSettings();
    return {
      title: settings.metaTitle || settings.storeName,
      description: settings.metaDescription || settings.tagline || undefined,
      openGraph: {
        title: settings.metaTitle || settings.storeName,
        description: settings.metaDescription || settings.tagline || undefined,
      },
    };
  } catch {
    return { title: "Store" };
  }
}

async function getData() {
  try {
    const [banners, products, categories, settings] = await Promise.all([
      getBanners(true),
      getProducts({ isActive: true }),
      getCategories(),
      getStoreSettings(),
    ]);
    return { banners, products, categories, settings };
  } catch {
    return { banners: [], products: [], categories: [], settings: null } as {
      banners: Awaited<ReturnType<typeof getBanners>>;
      products: Awaited<ReturnType<typeof getProducts>>;
      categories: Awaited<ReturnType<typeof getCategories>>;
      settings: Awaited<ReturnType<typeof getStoreSettings>> | null;
    };
  }
}

type StoreProduct = Omit<Awaited<ReturnType<typeof getProducts>>[number], "mediaItems"> & {
  mediaItems: Array<{ url: string; type: string }>;
};

export default async function HomePage() {
  const { banners, products: rawProducts, categories, settings } = await getData();
  const products = rawProducts as StoreProduct[];

  return (
    <>
      {banners.length > 0 && <HeroSection banners={banners} />}

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-sm font-medium text-gray-500">No products available yet</p>
            <p className="text-xs text-gray-400 mt-1">Check back soon!</p>
          </div>
        ) : (
          <CategoryFilter
            products={products}
            categories={categories}
            whatsappNumber={settings?.whatsappNumber ?? null}
            currency={settings?.currency ?? "USD"}
          />
        )}
      </div>
    </>
  );
}
