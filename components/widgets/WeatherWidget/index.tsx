"use client";

import { useWeather } from "@/hooks/useWeather";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { WidgetProps } from "@/lib/widgets/registry";
import { cn } from "@/lib/utils";
import { WeatherDay } from "@/lib/integrations/types";

// WMO code → emoji mapping
function weatherEmoji(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? "☀️" : "🌙";
  if (code <= 2) return isDay ? "⛅" : "🌙";
  if (code === 3) return "☁️";
  if (code <= 48) return "🌫️";
  if (code <= 55) return "🌦️";
  if (code <= 65) return "🌧️";
  if (code <= 75) return "❄️";
  if (code <= 82) return "🌦️";
  if (code <= 86) return "🌨️";
  return "⛈️";
}

function ForecastDay({ day, isDay }: { day: WeatherDay; isDay: boolean }) {
  const label = new Date(day.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" });
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <span className="text-[var(--muted)] text-xs">{label}</span>
      <span className="text-xl">{weatherEmoji(day.conditionCode, isDay)}</span>
      <div className="flex gap-1 text-xs tabular-nums">
        <span className="text-[var(--foreground)] font-medium">{day.tempMax}°</span>
        <span className="text-[var(--muted)]">{day.tempMin}°</span>
      </div>
      {day.precipProb > 0 && (
        <span className="text-xs text-blue-400">{day.precipProb}%</span>
      )}
    </div>
  );
}

export default function WeatherWidget({ size }: WidgetProps) {
  const { weather, isLoading, error } = useWeather();
  const isCompact = size === "sm";

  if (isLoading) return <SkeletonLoader count={3} />;
  if (error || !weather) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <p className="text-[var(--muted)] text-sm text-center">
          Weather unavailable
        </p>
      </div>
    );
  }

  const { current, forecast, locationName } = weather;

  return (
    <div className="h-full flex flex-col p-4 gap-3">
      {/* Current conditions */}
      <div className="flex items-center gap-3">
        <span className={cn("leading-none", isCompact ? "text-3xl" : "text-5xl")}>
          {weatherEmoji(current.conditionCode, current.isDay)}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-end gap-1">
            <span className={cn(
              "font-bold text-[var(--foreground)] tabular-nums leading-none",
              isCompact ? "text-3xl" : "text-5xl"
            )}>
              {current.temp}°
            </span>
            <span className="text-[var(--muted)] text-sm mb-1">F</span>
          </div>
          {!isCompact && (
            <p className="text-[var(--muted)] text-sm truncate">
              {current.condition}
            </p>
          )}
        </div>
        {!isCompact && (
          <div className="text-right text-xs text-[var(--muted)] space-y-1">
            <p>Feels {current.feelsLike}°</p>
            <p>💧 {current.humidity}%</p>
            <p>💨 {current.windSpeed} mph</p>
          </div>
        )}
      </div>

      {!isCompact && (
        <p className="text-xs text-[var(--muted)] -mt-1">{locationName}</p>
      )}

      {/* 4-day forecast */}
      {(size === "lg" || size === "xl") && forecast.length > 0 && (
        <>
          <div className="h-px bg-white/10" />
          <div className="flex gap-2">
            {forecast.map((day) => (
              <ForecastDay key={day.date} day={day} isDay={current.isDay} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
