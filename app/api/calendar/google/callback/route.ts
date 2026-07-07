import { NextResponse } from "next/server";
import { exchangeGoogleCode } from "@/lib/integrations/google-calendar";

export async function GET(req: Request) {
  // In standalone/Docker, req.url reflects the internal bind address
  // (0.0.0.0), which browsers can't visit — redirect to the public URL.
  const base = process.env.NEXT_PUBLIC_APP_URL ?? req.url;
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/?error=no_code", base));

  try {
    await exchangeGoogleCode(code);
    return NextResponse.redirect(new URL("/?connected=google", base));
  } catch (err) {
    console.error("Google OAuth error:", err);
    return NextResponse.redirect(new URL("/?error=google_auth", base));
  }
}
