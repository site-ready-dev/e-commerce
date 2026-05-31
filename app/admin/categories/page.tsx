import { getCategories } from "@/lib/actions";
import { CategoriesClient } from "./categories-client";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  try { categories = await getCategories(); } catch {}
  return <CategoriesClient categories={categories} />;
}
