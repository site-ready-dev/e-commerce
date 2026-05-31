import { getProducts, getCategories, getBanners, getStoreSettings } from "@/lib/actions";
import { formatPrice } from "@/lib/utils";
import { Package, Tag, ImageIcon, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let banners: Awaited<ReturnType<typeof getBanners>> = [];
  let storeName = "My Store";
  let currency = "USD";

  try {
    [products, categories, banners] = await Promise.all([
      getProducts(),
      getCategories(),
      getBanners(),
    ]);
    const settings = await getStoreSettings();
    storeName = settings.storeName;
    currency = settings.currency;
  } catch {}

  const stats = [
    { label: "Products", value: products.length, icon: Package, href: "/admin/products", color: "bg-blue-50 text-blue-700" },
    { label: "Categories", value: categories.length, icon: Tag, href: "/admin/categories", color: "bg-purple-50 text-purple-700" },
    { label: "Banners", value: banners.length, icon: ImageIcon, href: "/admin/banners", color: "bg-green-50 text-green-700" },
    { label: "Active Products", value: products.filter((p) => p.isActive).length, icon: Package, href: "/admin/products", color: "bg-orange-50 text-orange-700" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back to {storeName}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`rounded-lg p-2.5 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Recent Products</h2>
            <Link href="/admin/products" className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1">
              View all <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {products.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center gap-3 px-5 py-3">
                <div className="h-9 w-9 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {(() => {
                    const items = (product.mediaItems as Array<{ url: string; type: string }>) ?? [];
                    const img = items.find((m) => m.type === "image");
                    return img ? (
                      <img src={img.url} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-4 w-4 text-gray-400" />
                      </div>
                    );
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.category?.name || "Uncategorized"}</p>
                </div>
                <span className="text-sm font-semibold text-gray-900">{formatPrice(product.price, currency)}</span>
              </div>
            ))}
            {products.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-gray-400">No products yet. <Link href="/admin/products" className="text-gray-900 underline">Add one</Link></p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              { href: "/admin/products", label: "Add new product", desc: "Create and publish a product", icon: Package },
              { href: "/admin/categories", label: "Manage categories", desc: "Organize your products", icon: Tag },
              { href: "/admin/banners", label: "Update banners", desc: "Change hero section media", icon: ImageIcon },
            ].map((action) => (
              <Link key={action.href} href={action.href} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors">
                <div className="rounded-md bg-gray-100 p-2">
                  <action.icon className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{action.label}</p>
                  <p className="text-xs text-gray-500">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
