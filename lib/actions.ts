"use server";

import { prisma } from "./prisma";
import { slugify } from "./utils";
import { revalidatePath } from "next/cache";
import { deleteFromR2 } from "./r2";

// Store Settings
export async function getStoreSettings() {
  let settings = await prisma.storeSettings.findFirst({ orderBy: { createdAt: "asc" } });
  if (!settings) {
    settings = await prisma.storeSettings.create({ data: {} });
  }
  return settings;
}

export async function updateStoreSettings(data: {
  orgName?: string;
  storeName?: string;
  tagline?: string;
  currency?: string;
  logoUrl?: string;
  faviconUrl?: string;
  whatsappNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
}) {
  let settings = await prisma.storeSettings.findFirst({ orderBy: { createdAt: "asc" } });
  if (!settings) {
    settings = await prisma.storeSettings.create({ data: {} });
  }
  const updated = await prisma.storeSettings.update({
    where: { id: settings.id },
    data,
  });
  revalidatePath("/");
  revalidatePath("/admin/settings");
  revalidatePath("/products/[slug]", "page");
  return updated;
}

// Categories
export async function getCategories() {
  return prisma.category.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { products: true } } },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function createCategory(data: {
  name: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}) {
  const slug = slugify(data.name);
  const category = await prisma.category.create({
    data: { ...data, slug },
  });
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/");
  return category;
}

export async function updateCategory(
  id: string,
  data: {
    name?: string;
    description?: string;
    imageUrl?: string;
    isActive?: boolean;
    order?: number;
  }
) {
  const updateData: Record<string, unknown> = { ...data };
  if (data.name) updateData.slug = slugify(data.name);
  const category = await prisma.category.update({ where: { id }, data: updateData });
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/");
  return category;
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function reorderCategories(orderedIds: string[]) {
  await Promise.all(
    orderedIds.map((id, index) =>
      prisma.category.update({ where: { id }, data: { order: index } })
    )
  );
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

// Products
export async function getProducts(options?: {
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  limit?: number;
  search?: string;
}) {
  return prisma.product.findMany({
    where: {
      ...(options?.categoryId ? { categoryId: options.categoryId } : {}),
      ...(options?.isActive !== undefined ? { isActive: options.isActive } : {}),
      ...(options?.isFeatured !== undefined ? { isFeatured: options.isFeatured } : {}),
      ...(options?.search
        ? {
            OR: [
              { name: { contains: options.search, mode: "insensitive" } },
              { description: { contains: options.search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    ...(options?.limit ? { take: options.limit } : {}),
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
}

export async function createProduct(data: {
  name: string;
  description?: string;
  price: number;
  comparePrice?: number;
  mediaItems?: Array<{ url: string; type: string }>;
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  stock?: number;
  sku?: string;
  metaTitle?: string;
  metaDescription?: string;
}) {
  const slug = slugify(data.name);
  const product = await prisma.product.create({
    data: { ...data, slug, mediaItems: data.mediaItems ?? [] },
  });
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  return product;
}

export async function updateProduct(
  id: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    comparePrice?: number;
    mediaItems?: Array<{ url: string; type: string }>;
    categoryId?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    stock?: number;
    sku?: string;
    metaTitle?: string;
    metaDescription?: string;
  }
) {
  const updateData: Record<string, unknown> = { ...data };
  if (data.name) updateData.slug = slugify(data.name);
  const product = await prisma.product.update({ where: { id }, data: updateData });
  revalidatePath("/admin/products");
  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/");
  return product;
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  await prisma.product.delete({ where: { id } });
  if (product) {
    revalidatePath(`/products/${product.slug}`);
  }
  revalidatePath("/admin/products");
  revalidatePath("/");
}

// Banners
export async function getBanners(activeOnly = false) {
  return prisma.banner.findMany({
    where: activeOnly ? { isActive: true } : {},
    orderBy: { order: "asc" },
  });
}

export async function createBanner(data: {
  title?: string;
  subtitle?: string;
  mediaUrl: string;
  mediaType?: string;
  isFullScreen?: boolean;
  isActive?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  order?: number;
}) {
  const banner = await prisma.banner.create({ data });
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return banner;
}

export async function updateBanner(
  id: string,
  data: {
    title?: string;
    subtitle?: string;
    mediaUrl?: string;
    mediaType?: string;
    isFullScreen?: boolean;
    isActive?: boolean;
    ctaText?: string;
    ctaUrl?: string;
    order?: number;
  }
) {
  const banner = await prisma.banner.update({ where: { id }, data });
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return banner;
}

export async function deleteBanner(id: string) {
  await prisma.banner.delete({ where: { id } });
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

// Media
export async function getMediaFiles(type?: "image" | "video") {
  return prisma.mediaFile.findMany({
    where: type ? { type } : {},
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteMediaFile(id: string) {
  const file = await prisma.mediaFile.findUnique({ where: { id } });
  if (!file) return;
  try {
    await deleteFromR2(file.filename);
  } catch {
    // R2 deletion best-effort; remove DB record regardless
  }
  await prisma.mediaFile.delete({ where: { id } });
  revalidatePath("/admin/media");
}
