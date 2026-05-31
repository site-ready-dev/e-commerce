"use client";

import { useActionState } from "react";
import { setupAdmin } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Store, Loader2 } from "lucide-react";

export function SetupForm() {
  const [error, action, isPending] = useActionState(setupAdmin, null);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900">
          <Store className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Set up your store</h1>
        <p className="mt-1 text-sm text-gray-500">Create your admin account and configure your store to get started.</p>
      </div>

      <form action={action} className="space-y-5">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Your account</p>

        <div className="space-y-1.5">
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" name="name" placeholder="Jane Smith" required autoFocus />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="password">Password *</Label>
            <Input id="password" name="password" type="password" placeholder="Min. 8 characters" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm Password *</Label>
            <Input id="confirm" name="confirm" type="password" placeholder="Repeat password" required />
          </div>
        </div>

        <Separator />

        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Store details</p>

        <div className="space-y-1.5">
          <Label htmlFor="storeName">Store Name *</Label>
          <Input id="storeName" name="storeName" placeholder="My Awesome Store" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="whatsapp">WhatsApp Number <span className="text-gray-400 font-normal">(optional)</span></Label>
          <Input id="whatsapp" name="whatsapp" placeholder="14155552671 (with country code, no +)" />
          <p className="text-xs text-gray-400">Customers will use this to place orders</p>
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up…</> : "Create account & go to admin"}
        </Button>
      </form>
    </div>
  );
}
