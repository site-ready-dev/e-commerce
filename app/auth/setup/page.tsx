import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { SetupForm } from "./setup-form";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const session = await getSession();
  if (session) redirect("/admin");

  const count = await prisma.adminUser.count();
  if (count > 0) redirect("/auth/login");

  return <SetupForm />;
}
