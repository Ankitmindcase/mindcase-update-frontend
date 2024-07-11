import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export enum Times {
  Today = "Today",
  Yesterday = "Yesterday",
  ThisWeek = "This Week",
  BeforeThisWeek = "Before This Week",
}

export function maxRange(timeText: Times) {
  switch (timeText) {
    case Times.Today:
      return [0, 86400000];
    case Times.Yesterday:
      return [86400000, 172800000];
    case Times.ThisWeek:
      return [172800000, 604800000];
    default:
      return [604800000, Infinity];
  }
}

export function getMappedCourtName(courtName: string | null) {
  switch (courtName) {
    case "Supreme Court of India":
      return "SC";
    case "High Court of Gujarat":
      return "GujaratHC";
    default:
      return null;
  }
}

export function getLocalStorage() {
  if (!window) throw new Error("No window object found");
  return window.localStorage;
}
