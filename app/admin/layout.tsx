import { AdminSidebar } from "@/components/admin/sidebar";
import { getStoreSettings } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let storeName = "My Store";
  let logoUrl = null;
  try {
    const settings = await getStoreSettings();
    storeName = settings.storeName;
    logoUrl = settings.logoUrl;
  } catch {}

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar storeName={storeName} logoUrl={logoUrl} />
      {/* pt-14 on mobile to clear the fixed top bar */}
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
