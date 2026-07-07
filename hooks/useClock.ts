"use client";

import { useState, useEffect } from "react";

export interface ClockState {
  time: Date;
  hours: number;
  minutes: number;
  seconds: number;
  ampm: "AM" | "PM";
  hours12: number;
}

export function useClock(): ClockState {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const ampm = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;

  return { time, hours, minutes, seconds, ampm: hours >= 12 ? "PM" : "AM", hours12 };
}
