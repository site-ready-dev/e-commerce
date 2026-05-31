"use client";

import { useTransition } from "react";
import { logoutAdmin } from "@/lib/auth-actions";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => logoutAdmin())}
      disabled={isPending}
      className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors w-full"
    >
      <LogOut className="h-4 w-4 text-gray-400 flex-shrink-0" />
      <span>{isPending ? "Signing out…" : "Sign out"}</span>
    </button>
  );
}
