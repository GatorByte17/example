"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import useSWR, { useSWRConfig } from "swr";
import { useMembers } from "@/hooks/useMembers";
import { useTodos } from "@/hooks/useTodos";
import { useThemeStore } from "@/store/themeStore";
import { MEMBER_COLORS } from "@/lib/colors";
import type { Member } from "@/lib/db/queries/members";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const inputClass =
  "bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 transition";

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="sky-card p-5 flex flex-col gap-4">
      <div>
        <h2 className="text-base font-bold text-[var(--foreground)]">{title}</h2>
        {description && (
          <p className="text-xs text-[var(--muted)] mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {MEMBER_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`w-7 h-7 rounded-full transition flex-shrink-0 ${
            value === c ? "ring-2 ring-offset-2 ring-[var(--foreground)]/40" : ""
          }`}
          style={{ backgroundColor: c }}
          aria-label={`Color ${c}`}
        />
      ))}
    </div>
  );
}

function MemberRow({
  member,
  onSave,
  onDelete,
}: {
  member: Member;
  onSave: (id: number, patch: { name?: string; color?: string }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [name, setName] = useState(member.name);

  async function commitName() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === member.name) {
      setName(member.name);
      return;
    }
    await onSave(member.id, { name: trimmed });
  }

  return (
    <div className="flex flex-col gap-2 py-3 border-b border-[var(--border)] last:border-0">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ backgroundColor: member.color }}
        >
          {member.initials}
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
          className={`flex-1 min-w-0 ${inputClass}`}
          aria-label="Member name"
        />
        <button
          onClick={() => {
            if (window.confirm(`Remove ${member.name}? Their chores will move to Everyone.`)) {
              onDelete(member.id);
            }
          }}
          className="text-xs font-semibold text-[var(--muted)] hover:text-red-500 transition px-2 py-1"
        >
          Remove
        </button>
      </div>
      <div className="pl-12">
        <ColorPicker
          value={member.color}
          onChange={(color) => onSave(member.id, { color })}
        />
      </div>
    </div>
  );
}

function FamilySection() {
  const { members, addMember, updateMember, deleteMember } = useMembers();
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await addMember(newName.trim(), MEMBER_COLORS[members.length % MEMBER_COLORS.length]);
      setNewName("");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member");
    }
  }

  async function save(id: number, patch: { name?: string; color?: string }) {
    try {
      await updateMember(id, patch);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update member");
    }
  }

  async function remove(id: number) {
    try {
      await deleteMember(id);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove member");
    }
  }

  return (
    <SectionCard
      title="Family"
      description="Everyone gets a color used across chores and the dashboard."
    >
      <div>
        {members.length === 0 && (
          <p className="text-sm text-[var(--muted)] italic py-1">No members yet — add one below.</p>
        )}
        {members.map((m) => (
          <MemberRow key={m.id} member={m} onSave={save} onDelete={remove} />
        ))}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add a person…"
          className={`flex-1 min-w-0 ${inputClass}`}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-bold transition"
        >
          Add
        </button>
      </form>

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </SectionCard>
  );
}

function AppearanceSection() {
  const { accentColor, setAccentColor } = useThemeStore();

  return (
    <SectionCard
      title="Appearance"
      description="Accent color for today's date, buttons, and highlights (per device)."
    >
      <ColorPicker value={accentColor} onChange={setAccentColor} />
    </SectionCard>
  );
}

function PanelsSection() {
  const { panels, setPanelVisible } = useThemeStore();

  const rows: { key: keyof typeof panels; label: string; description: string }[] = [
    { key: "agenda", label: "Agenda", description: "Today & tomorrow's events" },
    { key: "lists", label: "Lists", description: "Chores, shopping lists, …" },
  ];

  return (
    <SectionCard
      title="Dashboard panels"
      description="Choose what shows next to the calendar on this device."
    >
      <div className="flex flex-col gap-1">
        {rows.map((row) => (
          <label
            key={row.key}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[var(--surface-2)]/60 transition cursor-pointer"
          >
            <input
              type="checkbox"
              checked={panels[row.key]}
              onChange={(e) => setPanelVisible(row.key, e.target.checked)}
              className="w-4 h-4 accent-[var(--accent)]"
            />
            <span className="flex-1">
              <span className="block text-sm font-medium text-[var(--foreground)]">
                {row.label}
              </span>
              <span className="block text-xs text-[var(--muted)]">{row.description}</span>
            </span>
          </label>
        ))}
      </div>
    </SectionCard>
  );
}

interface LocationSettings {
  latitude: string;
  longitude: string;
  locationName: string;
}

function LocationSection() {
  const { data, mutate } = useSWR<LocationSettings>("/api/settings", fetcher, {
    revalidateOnFocus: false,
  });
  const { mutate: globalMutate } = useSWRConfig();
  const [form, setForm] = useState<LocationSettings>({
    latitude: "",
    longitude: "",
    locationName: "",
  });
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setErrorMsg(body.error ?? `Failed to save (HTTP ${res.status})`);
      setStatus("error");
      return;
    }
    setStatus("saved");
    setErrorMsg("");
    await mutate();
    await globalMutate("/api/weather");
    setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <SectionCard
      title="Location & weather"
      description="Used for the weather forecast. Takes effect immediately — no rebuild needed."
    >
      <form onSubmit={handleSave} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--muted)]">
          Location name
          <input
            value={form.locationName}
            onChange={(e) => setForm({ ...form, locationName: e.target.value })}
            className={inputClass}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--muted)]">
            Latitude
            <input
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              inputMode="decimal"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--muted)]">
            Longitude
            <input
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              inputMode="decimal"
              className={inputClass}
            />
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-bold transition self-start"
          >
            Save
          </button>
          {status === "saved" && (
            <span className="text-xs font-semibold text-[var(--teal)]">Saved ✓</span>
          )}
          {status === "error" && (
            <span className="text-xs font-semibold text-red-500">{errorMsg}</span>
          )}
        </div>
      </form>
    </SectionCard>
  );
}

interface CalendarStatus {
  connected: { google: boolean; icloud: boolean };
}

function CalendarsSection() {
  const { data, mutate } = useSWR<CalendarStatus>("/api/calendar", fetcher, {
    revalidateOnFocus: false,
  });
  const connected = data?.connected;

  async function disconnectGoogle() {
    if (!window.confirm("Disconnect Google Calendar? Events will disappear from the dashboard.")) return;
    await fetch("/api/calendar/google/disconnect", { method: "POST" });
    await mutate();
  }

  function StatusDot({ on }: { on: boolean }) {
    return (
      <span
        className={`w-2 h-2 rounded-full inline-block ${on ? "bg-[var(--teal)]" : "bg-[var(--muted)]/40"}`}
      />
    );
  }

  return (
    <SectionCard
      title="Calendars"
      description="Client IDs and passwords stay in .env.local — connections are managed here."
    >
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          <StatusDot on={Boolean(connected?.google)} />
          <span className="text-sm font-medium text-[var(--foreground)]">Google Calendar</span>
        </div>
        {connected?.google ? (
          <button
            onClick={disconnectGoogle}
            className="text-xs font-semibold text-[var(--muted)] hover:text-red-500 transition"
          >
            Disconnect
          </button>
        ) : (
          <a
            href="/api/calendar/google/connect"
            className="text-xs font-semibold text-[var(--teal)] hover:text-[var(--accent)] transition"
          >
            Connect
          </a>
        )}
      </div>

      <GoogleTasksRow
        googleConnected={Boolean(connected?.google)}
        StatusDot={StatusDot}
      />

      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          <StatusDot on={Boolean(connected?.icloud)} />
          <span className="text-sm font-medium text-[var(--foreground)]">iCloud (CalDAV)</span>
        </div>
        <span className="text-xs text-[var(--muted)]">
          {connected?.icloud ? "Configured via .env.local" : "Set ICLOUD_* in .env.local"}
        </span>
      </div>
    </SectionCard>
  );
}

function GoogleTasksRow({
  googleConnected,
  StatusDot,
}: {
  googleConnected: boolean;
  StatusDot: (props: { on: boolean }) => React.ReactNode;
}) {
  const { data } = useSWR<{ connected: boolean }>("/api/google-tasks", fetcher, {
    revalidateOnFocus: false,
  });
  const tasksConnected = Boolean(data?.connected);

  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        <StatusDot on={tasksConnected} />
        <span className="text-sm font-medium text-[var(--foreground)]">Google Tasks</span>
      </div>
      {tasksConnected ? (
        <span className="text-xs text-[var(--muted)]">Lists sync in the Lists panel</span>
      ) : googleConnected ? (
        <span className="text-xs text-[var(--muted)]">
          Disconnect &amp; reconnect Google to grant Tasks access
        </span>
      ) : (
        <span className="text-xs text-[var(--muted)]">Connect Google to enable</span>
      )}
    </div>
  );
}

function ChoresSection() {
  const { todos, clearCompleted } = useTodos("chores");
  const doneCount = todos.filter((t) => t.done).length;
  const [error, setError] = useState("");

  async function handleClear() {
    try {
      await clearCompleted();
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear");
    }
  }

  return (
    <SectionCard title="Chores" description="Housekeeping for the chore board.">
      <div className="flex items-center gap-3">
        <button
          onClick={handleClear}
          disabled={doneCount === 0}
          className="px-4 py-2 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--accent)] hover:text-white text-[var(--foreground)] text-sm font-semibold transition disabled:opacity-40 disabled:hover:bg-[var(--surface-2)] disabled:hover:text-[var(--foreground)]"
        >
          Clear completed ({doneCount})
        </button>
        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
      </div>
    </SectionCard>
  );
}

export default function SettingsView() {
  const { accentColor } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.classList.add("light");
    root.style.setProperty("--accent", accentColor);
    root.style.setProperty("--accent-hover", accentColor + "cc");
  }, [accentColor]);

  return (
    <div className="h-screen w-screen overflow-y-auto bg-[var(--background)]">
      <div className="max-w-2xl mx-auto flex flex-col gap-4 p-4 sm:p-6 pb-12">
        <div className="flex items-center justify-between pt-2">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
          <Link
            href="/"
            className="text-sm font-semibold text-[var(--teal)] hover:text-[var(--accent)] transition"
          >
            ← Back to dashboard
          </Link>
        </div>

        <FamilySection />
        <PanelsSection />
        <AppearanceSection />
        <LocationSection />
        <CalendarsSection />
        <ChoresSection />
      </div>
    </div>
  );
}
