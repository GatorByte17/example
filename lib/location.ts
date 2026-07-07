import { getSetting } from "@/lib/db/queries/settings";

// Settings-table values win; NEXT_PUBLIC_ env vars remain as fallback
export function resolveLocation() {
  return {
    latitude: getSetting("weather_lat") ?? process.env.NEXT_PUBLIC_LATITUDE ?? "37.7749",
    longitude: getSetting("weather_lon") ?? process.env.NEXT_PUBLIC_LONGITUDE ?? "-122.4194",
    locationName: getSetting("weather_name") ?? process.env.NEXT_PUBLIC_LOCATION_NAME ?? "Home",
  };
}
