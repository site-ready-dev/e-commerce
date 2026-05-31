import { MetadataRoute } from "next";
import { getProducts } from "@/lib/actions";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const products = await getProducts({ isActive: true });
    const productUrls = products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [
      { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
      ...productUrls,
    ];
  } catch {
    return [{ url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 }];
  }
}
