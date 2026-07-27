import { clsx, type ClassValue } from "clsx";

/** Small classnames helper used across the UI. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
