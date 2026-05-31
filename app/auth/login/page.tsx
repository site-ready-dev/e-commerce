import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/admin");

  const count = await prisma.adminUser.count();
  if (count === 0) redirect("/auth/setup");

  const { reset } = await searchParams;

  return <LoginForm resetSuccess={reset === "1"} />;
}
