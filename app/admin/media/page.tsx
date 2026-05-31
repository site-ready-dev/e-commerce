import { getMediaFiles } from "@/lib/actions";
import { MediaPageClient } from "./media-client";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const files = await getMediaFiles();
  return <MediaPageClient files={files} />;
}
