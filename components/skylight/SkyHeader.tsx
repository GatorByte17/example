"use client";

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
    <header className="sky-header flex-none flex items-center justify-between px-6 py-4 gap-4">
      {/* Family member indicators */}
      <div className="flex flex-wrap gap-3 min-w-0">
        {members.length === 0 ? (
          <span className="text-sm text-white/50 italic">No members added</span>
        ) : (
          members.map((m) => (
            <div key={m.id} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: m.color }}
              />
              <span className="text-sm text-white/80 font-medium">{m.name}</span>
            </div>
          ))
        )}
      </div>

      {/* Clock + Date (center) */}
      <div className="text-center flex-shrink-0">
        <div className="text-4xl sm:text-5xl font-bold text-white tabular-nums leading-none">
          {hh}:{mm}
          <span className="text-xl sm:text-2xl font-light ml-2 text-white/70">{ampm}</span>
        </div>
        <div className="text-sm sm:text-base text-white/60 mt-1">
          {format(time, "EEEE, MMMM d")}
        </div>
      </div>

      {/* Weather */}
      <div className="text-right min-w-0">
        {weather ? (
          <div className="flex items-center gap-2 justify-end">
            <span className="text-2xl" aria-hidden>
              {weatherEmoji(weather.current.conditionCode, weather.current.isDay)}
            </span>
            <div>
              <div className="text-2xl font-bold text-white leading-none">
                {Math.round(weather.current.temp)}°F
              </div>
              <div className="text-xs text-white/60 truncate">{weather.locationName}</div>
            </div>
          </div>
        ) : (
          <div className="w-16" />
        )}
      </div>
    </header>
  );
}
