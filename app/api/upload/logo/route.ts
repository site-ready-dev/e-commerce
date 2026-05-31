import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { uploadToR2 } from "@/lib/r2";
import { prisma } from "@/lib/prisma";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB input limit
const MAX_DIM = 512; // output square dimension
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif", "image/gif"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    const input = Buffer.from(await file.arrayBuffer());
    const meta = await sharp(input).rotate().metadata();
    const { width = MAX_DIM, height = MAX_DIM } = meta;

    // Square size: use the shorter side, cap at MAX_DIM
    const squareDim = Math.min(width, height, MAX_DIM);

    const processed = await sharp(input)
      .rotate()
      .resize(squareDim, squareDim, { fit: "cover", position: "centre" })
      .webp({ quality: 90 })
      .toBuffer();

    const filename = `logos/${randomUUID()}.webp`;
    const url = await uploadToR2(processed, filename, "image/webp");

    const mediaFile = await prisma.mediaFile.create({
      data: {
        filename,
        url,
        size: processed.length,
        mimeType: "image/webp",
        type: "image",
      },
    });

    return NextResponse.json(mediaFile);
  } catch (err) {
    console.error("Logo upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
