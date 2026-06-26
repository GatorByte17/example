"use client";

import { useHomeAssistant } from "@/hooks/useHomeAssistant";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { WidgetProps } from "@/lib/widgets/registry";
import { HAEntity } from "@/lib/integrations/types";
import { cn } from "@/lib/utils";

// Read entity IDs from env (comma-separated); fallback to all states
const ENTITY_IDS = process.env.NEXT_PUBLIC_HA_ENTITIES?.split(",").map((s) => s.trim()).filter(Boolean);

function entityIcon(entityId: string, state: string): string {
  const domain = entityId.split(".")[0];
  if (domain === "light") return state === "on" ? "💡" : "🔦";
  if (domain === "switch") return state === "on" ? "🔌" : "⭕";
  if (domain === "sensor") {
    if (entityId.includes("temp")) return "🌡️";
    if (entityId.includes("humid")) return "💧";
    if (entityId.includes("motion")) return "🚶";
    if (entityId.includes("door") || entityId.includes("window")) return "🚪";
    return "📡";
  }
  if (domain === "binary_sensor") return state === "on" ? "🟢" : "⚫";
  if (domain === "climate") return "🌡️";
  if (domain === "media_player") return state === "playing" ? "▶️" : "⏸️";
  if (domain === "cover") return state === "open" ? "🔓" : "🔒";
  return "🏠";
}

function isToggleable(entityId: string): boolean {
  const domain = entityId.split(".")[0];
  return ["light", "switch", "input_boolean", "fan"].includes(domain);
}

function formatState(entity: HAEntity): string {
  const domain = entity.entity_id.split(".")[0];
  if (domain === "sensor") {
    const unit = entity.attributes.unit_of_measurement as string | undefined;
    return unit ? `${entity.state} ${unit}` : entity.state;
  }
  if (domain === "climate") {
    const target = entity.attributes.temperature;
    return target ? `${entity.state} · ${target}°` : entity.state;
  }
  return entity.state;
}

function EntityCard({
  entity,
  onToggle,
  compact,
}: {
  entity: HAEntity;
  onToggle: () => void;
  compact: boolean;
}) {
  const domain = entity.entity_id.split(".")[0];
  const displayName =
    (entity.attributes.friendly_name as string | undefined) ??
    entity.entity_id.split(".")[1].replace(/_/g, " ");
  const isOn = entity.state === "on" || entity.state === "playing" || entity.state === "open";
  const toggleable = isToggleable(entity.entity_id);

  return (
    <button
      onClick={toggleable ? onToggle : undefined}
      disabled={!toggleable}
      className={cn(
        "flex items-center gap-2 rounded-xl p-2 transition text-left w-full",
        toggleable ? "hover:bg-white/10 active:scale-95 cursor-pointer" : "cursor-default",
        isOn && domain !== "sensor" && domain !== "binary_sensor"
          ? "bg-[var(--accent)]/20"
          : "bg-white/5"
      )}
    >
      <span className={compact ? "text-lg" : "text-2xl"}>
        {entityIcon(entity.entity_id, entity.state)}
      </span>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium text-[var(--foreground)] truncate",
          compact ? "text-xs" : "text-sm"
        )}>
          {displayName}
        </p>
        {!compact && (
          <p className="text-xs text-[var(--muted)] truncate capitalize">
            {formatState(entity)}
          </p>
        )}
      </div>
      {isOn && toggleable && (
        <div className={cn(
          "rounded-full bg-[var(--accent)] flex-shrink-0",
          compact ? "w-1.5 h-1.5" : "w-2 h-2"
        )} />
      )}
    </button>
  );
}

export default function HomeAssistantWidget({ size }: WidgetProps) {
  const { entities, isLoading, error, callService } = useHomeAssistant(ENTITY_IDS);
  const compact = size === "sm";
  const maxVisible = size === "xl" ? 12 : size === "lg" ? 8 : size === "md" ? 6 : 4;

  if (isLoading) return <SkeletonLoader count={4} />;

  if (error || (entities.length === 0 && !isLoading)) {
    const isUnconfigured = !process.env.NEXT_PUBLIC_HA_ENTITIES &&
      (!process.env.HA_URL || !process.env.HA_TOKEN);
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center gap-2">
        <span className="text-4xl">🏠</span>
        <p className="text-sm text-[var(--muted)]">
          {isUnconfigured
            ? "Set HA_URL and HA_TOKEN in .env.local"
            : "No entities found"}
        </p>
      </div>
    );
  }

  async function toggle(entity: HAEntity) {
    const domain = entity.entity_id.split(".")[0];
    const service = entity.state === "on" ? "turn_off" : "turn_on";
    await callService(domain, service, { entity_id: entity.entity_id });
  }

  const visible = entities.slice(0, maxVisible);

  return (
    <div className="h-full flex flex-col p-3 gap-2 overflow-hidden">
      {!compact && (
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Home
          </h3>
          <span className="text-xs text-[var(--muted)]">
            {entities.length} device{entities.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}
      <div className={cn(
        "flex-1 overflow-hidden",
        size === "xl" || size === "lg"
          ? "grid grid-cols-2 gap-1.5 content-start"
          : "flex flex-col gap-1"
      )}>
        {visible.map((entity) => (
          <EntityCard
            key={entity.entity_id}
            entity={entity}
            onToggle={() => toggle(entity)}
            compact={compact}
          />
        ))}
      </div>
      {entities.length > maxVisible && (
        <p className="text-xs text-[var(--muted)] text-center">
          +{entities.length - maxVisible} more
        </p>
      )}
    </div>
  );
}
