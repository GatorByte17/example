import { parseISO, startOfDay, addDays } from "date-fns";
import { eventCoversDay } from "./events";
import type { CalendarEvent } from "./integrations/types";

export const HOUR_HEIGHT = 64; // px per hour in the timeline (taller = more legible)
const MIN_DISPLAY_MINUTES = 30; // short events still get a readable block

export interface PositionedEvent {
  event: CalendarEvent;
  top: number;     // px from midnight
  height: number;  // px
  leftPct: number; // % within the day column
  widthPct: number;
}

interface Segment {
  event: CalendarEvent;
  startMin: number;
  endMin: number;
}

// Timed events for one day, clamped to that day's bounds, positioned by
// time, with overlapping events split side-by-side into lanes.
export function layoutDayEvents(events: CalendarEvent[], day: Date): PositionedEvent[] {
  const dayStart = startOfDay(day);
  const dayEnd = addDays(dayStart, 1);

  const segments: Segment[] = events
    .filter((e) => !e.allDay && eventCoversDay(e, day))
    .map((e) => {
      const s = Math.max(parseISO(e.start).getTime(), dayStart.getTime());
      const en = Math.min(parseISO(e.end).getTime(), dayEnd.getTime());
      const startMin = (s - dayStart.getTime()) / 60000;
      const endMin = Math.max(
        (en - dayStart.getTime()) / 60000,
        startMin + MIN_DISPLAY_MINUTES
      );
      return { event: e, startMin, endMin: Math.min(endMin, 1440) };
    })
    .sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);

  const results: PositionedEvent[] = [];
  let cluster: Segment[] = [];
  let clusterEnd = -1;

  const flush = () => {
    if (cluster.length === 0) return;
    // Greedy lane assignment within the overlap cluster
    const laneEnds: number[] = [];
    const laned = cluster.map((seg) => {
      let lane = laneEnds.findIndex((end) => end <= seg.startMin);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(0);
      }
      laneEnds[lane] = seg.endMin;
      return { ...seg, lane };
    });
    const laneCount = laneEnds.length;
    for (const seg of laned) {
      results.push({
        event: seg.event,
        top: (seg.startMin / 60) * HOUR_HEIGHT,
        height: ((seg.endMin - seg.startMin) / 60) * HOUR_HEIGHT,
        leftPct: (seg.lane / laneCount) * 100,
        widthPct: 100 / laneCount,
      });
    }
    cluster = [];
    clusterEnd = -1;
  };

  for (const seg of segments) {
    if (cluster.length > 0 && seg.startMin >= clusterEnd) flush();
    cluster.push(seg);
    clusterEnd = Math.max(clusterEnd, seg.endMin);
  }
  flush();

  return results;
}

export function allDayEventsFor(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events.filter((e) => e.allDay && eventCoversDay(e, day));
}
