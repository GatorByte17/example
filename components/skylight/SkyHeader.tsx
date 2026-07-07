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
    <header className="flex-none flex items-center justify-between px-6 py-4 gap-4">
      {/* Family member avatars */}
      <div className="flex flex-wrap items-center gap-3 min-w-0 flex-1">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-sm"
              style={{ backgroundColor: m.color }}
            >
              {m.initials}
            </div>
            <span className="text-sm font-medium text-[var(--foreground)] hidden sm:inline">
              {m.name}
            </span>
          </div>
        ))}
      </div>

      {/* Clock + Date (center) */}
      <div className="text-center flex-shrink-0">
        <div className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] tabular-nums leading-none">
          {hh}:{mm}
          <span className="text-xl sm:text-2xl font-semibold ml-2 text-[var(--accent)]">
            {ampm}
          </span>
        </div>
        <div className="text-sm sm:text-base text-[var(--muted)] mt-1 font-medium">
          {format(time, "EEEE, MMMM d")}
        </div>
      </div>

      {/* Weather chip + settings */}
      <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
        {weather?.current ? (
          <div className="flex items-center gap-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-full pl-3 pr-4 py-2 shadow-sm">
            <span className="text-2xl" aria-hidden>
              {weatherEmoji(weather.current.conditionCode, weather.current.isDay)}
            </span>
            <div>
              <div className="text-lg font-bold text-[var(--foreground)] leading-none">
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
          className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-sm flex items-center justify-center text-lg hover:bg-[var(--surface-2)] transition flex-shrink-0"
          aria-label="Settings"
        >
          ⚙️
        </Link>
      </div>
    </header>
  );
}
