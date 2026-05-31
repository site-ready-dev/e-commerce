"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tag,
  ImageIcon,
  FileImage,
  Settings,
  Store,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "./logout-button";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/media", label: "Media", icon: FileImage },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  storeName?: string;
  logoUrl?: string | null;
}

function NavContent({
  storeName,
  logoUrl,
  onNavClick,
}: {
  storeName: string;
  logoUrl?: string | null;
  onNavClick?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex h-14 items-center gap-2.5 border-b border-gray-200 px-4 flex-shrink-0">
        {logoUrl ? (
          <img src={logoUrl} alt={storeName} className="h-7 w-7 rounded object-cover" />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded bg-gray-900 text-xs font-bold text-white">
            {storeName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="truncate text-sm font-semibold text-gray-900">{storeName}</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <div className="mb-1 px-2 pt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Menu</p>
        </div>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavClick}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-gray-100 font-medium text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 flex-shrink-0",
                      isActive ? "text-gray-900" : "text-gray-400"
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-200 p-3 flex-shrink-0 space-y-0.5">
        <Link
          href="/"
          onClick={onNavClick}
          className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          target="_blank"
        >
          <Store className="h-4 w-4 text-gray-400" />
          <span>View Store</span>
        </Link>
        <LogoutButton />
      </div>
    </>
  );
}

export function AdminSidebar({ storeName = "My Store", logoUrl }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt={storeName} className="h-6 w-6 rounded object-cover" />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-900 text-[10px] font-bold text-white">
              {storeName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-semibold text-gray-900">{storeName}</span>
        </div>
      </div>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white shadow-xl transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
          <div className="flex items-center gap-2.5">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="h-7 w-7 rounded object-cover" />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded bg-gray-900 text-xs font-bold text-white">
                {storeName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-semibold text-gray-900">{storeName}</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <NavContent
            storeName={storeName}
            logoUrl={logoUrl}
            onNavClick={() => setMobileOpen(false)}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-screen w-56 flex-col border-r border-gray-200 bg-white flex-shrink-0">
        <NavContent storeName={storeName} logoUrl={logoUrl} />
      </aside>
    </>
  );
}
