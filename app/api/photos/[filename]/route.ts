import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import path from "path";
import fs from "fs";

const PHOTOS_DIR = path.join(process.cwd(), "data", "photos");
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

export async function GET(
  _req: Request,
  { params }: { params: { filename: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const filename = params.filename;

  // Prevent path traversal
  if (!filename || filename.includes("..") || /[/\\]/.test(filename)) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const ext = path.extname(filename).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    return NextResponse.json({ error: "Not an image" }, { status: 400 });
  }

  const filePath = path.join(PHOTOS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": MIME[ext] ?? "image/jpeg",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
