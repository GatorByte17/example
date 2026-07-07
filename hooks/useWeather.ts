"use client";

import useSWR from "swr";
import { WeatherData } from "@/lib/integrations/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useWeather() {
  // Location is resolved server-side (Settings page → SQLite, env as fallback)
  const { data, error, isLoading } = useSWR<WeatherData>("/api/weather", fetcher, {
    refreshInterval: 10 * 60 * 1000, // 10 minutes
    revalidateOnFocus: false,
  });

  return { weather: data, error, isLoading };
}
