import { google } from "googleapis";
import { getSetting, setSetting } from "@/lib/db/queries/settings";

// Use googleapis' own bundled client type — the standalone
// google-auth-library package is a different copy with clashing privates
type OAuth2Client = InstanceType<typeof google.auth.OAuth2>;

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/tasks",
];

const TOKEN_KEY = "google_calendar_tokens";

export function getOAuth2Client(): OAuth2Client {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/google/callback`
  );
}

// OAuth client loaded with stored tokens (auto-persists refreshes), or null
export function getAuthorizedClient(): OAuth2Client | null {
  const tokenStr = getSetting(TOKEN_KEY);
  if (!tokenStr) return null;

  const client = getOAuth2Client();
  client.setCredentials(JSON.parse(tokenStr));
  client.on("tokens", (tokens) => {
    const existing = JSON.parse(getSetting(TOKEN_KEY) ?? "{}");
    setSetting(TOKEN_KEY, JSON.stringify({ ...existing, ...tokens }));
  });
  return client;
}

export function grantedScopes(): string {
  const tokenStr = getSetting(TOKEN_KEY);
  if (!tokenStr) return "";
  try {
    return (JSON.parse(tokenStr).scope as string) ?? "";
  } catch {
    return "";
  }
}
