import { getStoreSettings } from "@/lib/actions";
import { StoreNav } from "@/components/store/nav";
import { StoreFooter } from "@/components/store/footer";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  let settings: Awaited<ReturnType<typeof getStoreSettings>> | null = null;
  try { settings = await getStoreSettings(); } catch {}

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <StoreNav settings={settings} />
      <main className="flex-1">{children}</main>
      <StoreFooter settings={settings} />
    </div>
  );
}
