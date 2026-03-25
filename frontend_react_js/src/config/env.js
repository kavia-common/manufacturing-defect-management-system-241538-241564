/**
 * Resolve environment values for the frontend.
 * Supports either REACT_APP_API_BASE or REACT_APP_BACKEND_URL.
 */

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Returns the base URL for backend REST API calls. */
  const direct = process.env.REACT_APP_API_BASE;
  const backend = process.env.REACT_APP_BACKEND_URL;

  // Prefer API_BASE if set; otherwise use BACKEND_URL; otherwise same-origin.
  return (direct && direct.trim()) || (backend && backend.trim()) || "";
}

// PUBLIC_INTERFACE
export function getNodeEnv() {
  /** Returns the runtime environment mode (development/production). */
  return process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV || "development";
}
