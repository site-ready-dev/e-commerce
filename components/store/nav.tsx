import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { SearchDialog } from "./search-dialog";

interface NavSettings {
  storeName: string;
  logoUrl: string | null;
  currency: string;
}

export function StoreNav({ settings }: { settings: NavSettings | null }) {
  const storeName = settings?.storeName || "Store";
  const logoUrl = settings?.logoUrl;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          {logoUrl ? (
            <img src={logoUrl} alt={storeName} className="h-8 w-8 rounded-lg object-cover" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
          )}
          <span className="text-sm font-semibold text-gray-900">{storeName}</span>
        </Link>
        <div className="flex items-center gap-1">
          <SearchDialog currency={settings?.currency || "USD"} />
          <Link href="/" className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">Home</Link>
        </div>
      </div>
    </header>
  );
}
