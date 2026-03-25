import { getApiBaseUrl } from "../config/env";

/**
 * Tiny fetch wrapper with JSON parsing and error normalization.
 */

function buildUrl(path) {
  const base = getApiBaseUrl();
  if (!base) return path; // same-origin or dev proxy
  return `${base.replace(/\/+$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;
}

// PUBLIC_INTERFACE
export async function apiRequest(path, options = {}) {
  /** Perform a REST request to the backend API and return parsed JSON (or text). */
  const url = buildUrl(path);
  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(options.headers || {}),
    },
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!res.ok) {
    let detail = "";
    try {
      detail = isJson ? JSON.stringify(await res.json()) : await res.text();
    } catch {
      detail = "";
    }
    const err = new Error(`API ${res.status} ${res.statusText}${detail ? `: ${detail}` : ""}`);
    err.status = res.status;
    err.url = url;
    throw err;
  }

  if (res.status === 204) return null;
  return isJson ? res.json() : res.text();
}
