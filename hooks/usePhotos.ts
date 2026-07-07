"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function usePhotos() {
  const { data } = useSWR<{ photos: string[] }>("/api/photos", fetcher, {
    refreshInterval: 5 * 60 * 1000,
    revalidateOnFocus: false,
  });

  return { photos: data?.photos ?? [] };
}
