import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { BlueprintHotspot } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** SVG path for a hotspot leader line (coords are % of the image).
 *  Shared by the public blueprint and the admin editor so both render
 *  straight / curved / elbow callouts identically. */
export function leaderLinePath(h: BlueprintHotspot): string | null {
  const l = h.line
  if (!l) return null
  if (l.cx != null && l.cy != null) {
    return l.kind === 'elbow'
      ? `M ${h.x} ${h.y} L ${l.cx} ${l.cy} L ${l.x2} ${l.y2}`
      : `M ${h.x} ${h.y} Q ${l.cx} ${l.cy} ${l.x2} ${l.y2}`
  }
  return `M ${h.x} ${h.y} L ${l.x2} ${l.y2}`
}
