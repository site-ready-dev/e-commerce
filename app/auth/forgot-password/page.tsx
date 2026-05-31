"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [state, action, isPending] = useActionState(requestPasswordReset, null);

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
          <Mail className="h-6 w-6 text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Check your email</h1>
        <p className="text-sm text-gray-500 mb-6">{state.success}</p>
        <Link
          href={`/auth/reset-password?email=${encodeURIComponent(state.email ?? "")}`}
          className="inline-flex items-center justify-center w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
        >
          Enter code
        </Link>
        <Link href="/auth/login" className="mt-4 flex items-center justify-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">Forgot password</h1>
        <p className="mt-1 text-sm text-gray-500">Enter your email and we&apos;ll send you a reset code.</p>
      </div>

      <form action={action} className="space-y-5">
        {state?.error && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required autoFocus />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</> : "Send reset code"}
        </Button>

        <Link href="/auth/login" className="flex items-center justify-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
      </form>
    </div>
  );
}
