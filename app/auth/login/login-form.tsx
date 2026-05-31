"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAdmin } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, Loader2 } from "lucide-react";

export function LoginForm({ resetSuccess }: { resetSuccess?: boolean }) {
  const [error, action, isPending] = useActionState(loginAdmin, null);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900">
          <Store className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-500">Sign in to your admin panel</p>
      </div>

      <form action={action} className="space-y-5">
        {resetSuccess && (
          <div className="rounded-lg bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
            Password reset successfully. Please sign in.
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required autoFocus />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/auth/forgot-password" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
              Forgot password?
            </Link>
          </div>
          <Input id="password" name="password" type="password" placeholder="Your password" required />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</> : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
