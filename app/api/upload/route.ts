import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { uploadToR2 } from "@/lib/r2";
import { prisma } from "@/lib/prisma";

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/svg+xml"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large (max 50 MB)" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const filename = `media/${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToR2(buffer, filename, file.type);
    const type = ALLOWED_VIDEO_TYPES.includes(file.type) ? "video" : "image";

    const mediaFile = await prisma.mediaFile.create({
      data: {
        filename,
        url,
        size: file.size,
        mimeType: file.type,
        type,
      },
    });

    return NextResponse.json(mediaFile);
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
