/**
 * Shared types for the /admin dashboard (client side only).
 */

export type VisitorRow = {
  id: number;
  created_at: string;
  visitor_id: string | null;
  path: string | null;
  method?: string | null;
  ip: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  is_bot: boolean | null;
  referer: string | null;
  accept_language: string | null;
  country: string | null;
  country_code: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  isp: string | null;
  org: string | null;
  proxy_host: boolean | null;
  hosting: boolean | null;
};

export type VisitorStats = {
  totalVisits: number;
  humanVisits: number;
  totalBots: number;
  todayVisits: number;
  weekVisits: number;
  uniqueIps: number;
  uniqueVisitors: number;
  topCountries: Tally[];
  topCities: Tally[];
  topPaths: Tally[];
  topBrowsers: Tally[];
  topOs: Tally[];
  topDevices: Tally[];
  topReferrers: Tally[];
  topIsp: Tally[];
};

export type Tally = { key: string; value: number };

export type AdminProject = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image_url: string | null;
  tech: string[] | null;
  features: string[] | null;
  challenges: string[] | null;
  improvements: string[] | null;
  github_url: string | null;
  live_url: string | null;
  coming_soon: boolean | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
};

export type ProjectFormState = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  image_url: string;
  tech: string;
  features: string;
  challenges: string;
  improvements: string;
  github_url: string;
  live_url: string;
  coming_soon: boolean;
  sort_order: number;
};

export const emptyProjectForm: ProjectFormState = {
  slug: "",
  title: "",
  description: "",
  image_url: "",
  tech: "",
  features: "",
  challenges: "",
  improvements: "",
  github_url: "",
  live_url: "",
  coming_soon: false,
  sort_order: 0,
};

export const joinLines = (items: string[] | null | undefined): string =>
  (items ?? []).join("\n");

export const splitLines = (text: string): string[] =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

export const splitTech = (text: string): string[] =>
  text
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

export const formatDhakaTime = (iso: string): string =>
  new Date(iso).toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatGeo = (row: Pick<VisitorRow, "latitude" | "longitude" | "city" | "region" | "country" | "country_code">): string => {
  const coords =
    row.latitude !== null && row.longitude !== null
      ? `${row.latitude.toFixed(4)}, ${row.longitude.toFixed(4)}`
      : null;
  const place = [row.city, row.region, row.country_code]
    .filter(Boolean)
    .join(", ");
  return [coords, place].filter(Boolean).join(" · ");
};

export const mapsLink = (
  row: Pick<VisitorRow, "latitude" | "longitude">,
): string | null =>
  row.latitude !== null && row.longitude !== null
    ? `https://www.google.com/maps?q=${row.latitude},${row.longitude}`
    : null;
