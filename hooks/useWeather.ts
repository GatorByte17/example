"use client";

import useSWR from "swr";
import { WeatherData } from "@/lib/integrations/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useWeather() {
  const lat = process.env.NEXT_PUBLIC_LATITUDE ?? "37.7749";
  const lon = process.env.NEXT_PUBLIC_LONGITUDE ?? "-122.4194";
  const name = process.env.NEXT_PUBLIC_LOCATION_NAME ?? "Home";

  const { data, error, isLoading } = useSWR<WeatherData>(
    `/api/weather?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name)}`,
    fetcher,
    {
      refreshInterval: 10 * 60 * 1000, // 10 minutes
      revalidateOnFocus: false,
    }
  );

  return { weather: data, error, isLoading };
}
