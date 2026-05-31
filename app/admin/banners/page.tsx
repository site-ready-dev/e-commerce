import { getBanners } from "@/lib/actions";
import { BannersClient } from "./banners-client";

export const dynamic = "force-dynamic";

export default async function BannersPage() {
  let banners: Awaited<ReturnType<typeof getBanners>> = [];
  try { banners = await getBanners(); } catch {}
  return <BannersClient banners={banners} />;
}
