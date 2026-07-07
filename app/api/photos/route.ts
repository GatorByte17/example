import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import path from "path";
import fs from "fs";

const PHOTOS_DIR = path.join(process.cwd(), "data", "photos");
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!fs.existsSync(PHOTOS_DIR)) {
    return NextResponse.json({ photos: [] });
  }

  const files = fs
    .readdirSync(PHOTOS_DIR)
    .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
    .sort();

  return NextResponse.json({ photos: files });
}
