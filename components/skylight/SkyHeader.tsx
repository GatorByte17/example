"use client";

import Link from "next/link";
import { format } from "date-fns";
import { useClock } from "@/hooks/useClock";
import { useWeather } from "@/hooks/useWeather";
import { useMembers } from "@/hooks/useMembers";

function weatherEmoji(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? "☀️" : "🌙";
  if (code <= 3) return isDay ? "⛅" : "☁️";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌦️";
  if (code <= 99) return "⛈️";
  return "🌡️";
}

export default function SkyHeader() {
  const { time, hours12, minutes, ampm } = useClock();
  const { weather } = useWeather();
  const { members } = useMembers();

  const hh = String(hours12).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");

  return (
    <header className="flex-none flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 sm:px-6 py-3 sm:py-4">
      {/* Clock + Date — own full-width row on phones, centered on larger screens */}
      <div className="w-full sm:w-auto sm:order-2 text-center sm:flex-shrink-0">
        <div className="text-3xl sm:text-5xl font-bold text-[var(--foreground)] tabular-nums leading-none">
          {hh}:{mm}
          <span className="text-lg sm:text-2xl font-semibold ml-2 text-[var(--accent)]">
            {ampm}
          </span>
        </div>
        <div className="text-xs sm:text-base text-[var(--muted)] mt-1 font-medium">
          {format(time, "EEEE, MMMM d")}
        </div>
      </div>

      {/* Family member avatars */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0 sm:flex-1 sm:order-1">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-2">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white flex-shrink-0 shadow-sm"
              style={{ backgroundColor: m.color }}
            >
              {m.initials}
            </div>
            <span className="text-sm font-medium text-[var(--foreground)] hidden lg:inline">
              {m.name}
            </span>
          </div>
        ))}
      </div>

      {/* Weather chip + settings */}
      <div className="flex items-center justify-end gap-2 min-w-0 ml-auto sm:ml-0 sm:flex-1 sm:order-3">
        {weather?.current ? (
          <div className="flex items-center gap-2 sm:gap-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-full pl-2.5 pr-3 sm:pl-3 sm:pr-4 py-1.5 sm:py-2 shadow-sm">
            <span className="text-xl sm:text-2xl" aria-hidden>
              {weatherEmoji(weather.current.conditionCode, weather.current.isDay)}
            </span>
            <div>
              <div className="text-base sm:text-lg font-bold text-[var(--foreground)] leading-none">
                {Math.round(weather.current.temp)}°F
              </div>
              <div className="text-[10px] text-[var(--muted)] truncate">
                {weather.locationName}
              </div>
            </div>
          </div>
        ) : null}
        <Link
          href="/settings"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-sm flex items-center justify-center text-lg hover:bg-[var(--surface-2)] transition flex-shrink-0"
          aria-label="Settings"
        >
          ⚙️
        </Link>
      </div>
    </header>
  );
}
