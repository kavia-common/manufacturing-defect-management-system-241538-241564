import { format } from "date-fns";

// PUBLIC_INTERFACE
export function formatDateTime(iso) {
  /** Formats an ISO string into a readable date/time. */
  try {
    if (!iso) return "";
    return format(new Date(iso), "yyyy-MM-dd HH:mm");
  } catch {
    return String(iso || "");
  }
}

// PUBLIC_INTERFACE
export function severityBadgeVariant(severity) {
  /** Map severity to badge CSS class. */
  const s = (severity || "").toLowerCase();
  if (s === "critical") return "badgeError";
  if (s === "major") return "badgeAmber";
  if (s === "minor") return "badgePrimary";
  return "";
}

// PUBLIC_INTERFACE
export function statusBadgeVariant(status) {
  /** Map defect status to badge CSS class. */
  const s = (status || "").toLowerCase();
  if (s.includes("closed")) return "badgeSuccess";
  if (s.includes("rca")) return "badgeAmber";
  if (s.includes("action")) return "badgePrimary";
  if (s.includes("open")) return "";
  return "";
}
