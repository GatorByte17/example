import { NextResponse } from "next/server";
import { exchangeGoogleCode } from "@/lib/integrations/google-calendar";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/?error=no_code", req.url));

  try {
    await exchangeGoogleCode(code);
    return NextResponse.redirect(new URL("/?connected=google", req.url));
  } catch (err) {
    console.error("Google OAuth error:", err);
    return NextResponse.redirect(new URL("/?error=google_auth", req.url));
  }
}
