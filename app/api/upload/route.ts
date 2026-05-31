import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { uploadToR2 } from "@/lib/r2";
import { prisma } from "@/lib/prisma";

const MAX_SIZE = 50 * 1024 * 1024;
const MAX_DIM = 1920;

// These image types are processed by sharp → WebP (includes HEIC/HEIF from iPhone)
const COMPRESSIBLE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif"];
// Passed through unchanged (SVG is vector; GIF may be animated)
const PASSTHROUGH_IMAGE_TYPES = ["image/gif", "image/svg+xml"];
const ALLOWED_IMAGE_TYPES = [...COMPRESSIBLE_TYPES, ...PASSTHROUGH_IMAGE_TYPES];
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

    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
    const shouldCompress = COMPRESSIBLE_TYPES.includes(file.type);

    let buffer: Buffer = Buffer.from(await file.arrayBuffer());
    let mimeType = file.type;
    let ext = file.name.split(".").pop()?.toLowerCase() || "bin";

    if (shouldCompress) {
      const image = sharp(buffer).rotate(); // auto-correct EXIF orientation before anything else
      const meta = await image.metadata();
      const { width = MAX_DIM, height = MAX_DIM } = meta;

      const needsResize = width > MAX_DIM || height > MAX_DIM;

      const pipeline = needsResize
        ? image.resize(MAX_DIM, MAX_DIM, { fit: "inside", withoutEnlargement: true })
        : image;

      buffer = await pipeline.webp({ quality: 85 }).toBuffer();
      mimeType = "image/webp";
      ext = "webp";
    }

    const folder = isVideo ? "media" : "media";
    const filename = `${folder}/${randomUUID()}.${ext}`;
    const url = await uploadToR2(buffer, filename, mimeType);

    const mediaFile = await prisma.mediaFile.create({
      data: {
        filename,
        url,
        size: buffer.length,
        mimeType,
        type: isVideo ? "video" : "image",
      },
    });

    return NextResponse.json(mediaFile);
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
