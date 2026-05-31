import { getStoreSettings } from "@/lib/actions";
import { SettingsClient } from "./settings-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let settings: Awaited<ReturnType<typeof getStoreSettings>> | null = null;
  try { settings = await getStoreSettings(); } catch {}
  return <SettingsClient settings={settings} />;
}
