export interface WeatherCurrent {
  temp: number;
  feelsLike: number;
  condition: string;
  conditionCode: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  isDay: boolean;
}

export interface WeatherDay {
  date: string; // ISO date string
  tempMax: number;
  tempMin: number;
  condition: string;
  conditionCode: number;
  precipProb: number;
}

export interface WeatherData {
  current: WeatherCurrent;
  forecast: WeatherDay[];
  locationName: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO string
  end: string;   // ISO string
  allDay: boolean;
  color?: string;
  calendarName?: string;
  source: "google" | "icloud" | "local";
}

export interface HAEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_updated: string;
}

export type HAEntityType =
  | "light"
  | "switch"
  | "sensor"
  | "binary_sensor"
  | "climate"
  | "cover"
  | "media_player"
  | "other";
