import { HAEntity } from "./types";

export async function fetchHAStates(entityIds?: string[]): Promise<HAEntity[]> {
  const haUrl = process.env.HA_URL;
  const haToken = process.env.HA_TOKEN;

  if (!haUrl || !haToken) {
    throw new Error("HA_URL and HA_TOKEN must be set in environment");
  }

  const res = await fetch(`${haUrl}/api/states`, {
    headers: {
      Authorization: `Bearer ${haToken}`,
      "Content-Type": "application/json",
    },
    // No next cache — caller controls staleness via SWR
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Home Assistant API error: ${res.status}`);
  const all: HAEntity[] = await res.json();

  if (!entityIds || entityIds.length === 0) return all;
  return all.filter((e) => entityIds.includes(e.entity_id));
}

export async function callHAService(
  domain: string,
  service: string,
  data: Record<string, unknown>
): Promise<void> {
  const haUrl = process.env.HA_URL;
  const haToken = process.env.HA_TOKEN;

  if (!haUrl || !haToken) throw new Error("HA not configured");

  const res = await fetch(`${haUrl}/api/services/${domain}/${service}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${haToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`HA service call failed: ${res.status}`);
}
