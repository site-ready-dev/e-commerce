"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Suspense } from "react";

function ResetForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [error, action, isPending] = useActionState(resetPassword, null);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">Reset password</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter the 6-digit code sent to <span className="font-medium text-gray-700">{email || "your email"}</span> and choose a new password.
        </p>
      </div>

      <form action={action} className="space-y-5">
        <input type="hidden" name="email" value={email} />

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="otp">6-Digit Code</Label>
          <Input
            id="otp"
            name="otp"
            placeholder="123456"
            maxLength={6}
            inputMode="numeric"
            pattern="[0-9]{6}"
            className="text-center text-2xl tracking-[0.5em] font-bold"
            required
            autoFocus
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="password">New Password</Label>
            <Input id="password" name="password" type="password" placeholder="Min. 8 characters" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input id="confirm" name="confirm" type="password" placeholder="Repeat password" required />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting…</> : "Reset password"}
        </Button>

        <Link href="/auth/forgot-password" className="flex items-center justify-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Request a new code
        </Link>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
