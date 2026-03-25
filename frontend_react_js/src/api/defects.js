import { apiRequest } from "./client";
import { v4 as uuidv4 } from "uuid";

const DEMO_STORAGE_KEY = "mdms_demo_state_v1";

function loadDemoState() {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveDemoState(state) {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
}

function initDemoState() {
  const existing = loadDemoState();
  if (existing) return existing;

  const now = new Date().toISOString();
  const seed = {
    defects: [
      {
        id: "DF-10021",
        createdAt: now,
        line: "Line A",
        station: "Stamping",
        partNumber: "PN-AX12",
        defectType: "Scratch",
        severity: "Major",
        status: "Open",
        detectedBy: "Operator",
        description: "Visible scratch on outer housing near edge.",
        quantity: 12,
        photos: [],
        rca: {
          method: "5-Why",
          rootCause: "Improper fixturing alignment during stamping",
          containment: "Hold lot; 100% inspection for next 2 shifts",
        },
        actions: [
          {
            id: "CA-1",
            owner: "Maintenance",
            dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
            action: "Realign fixture and add poka-yoke pin",
            status: "In Progress",
            verification: "",
          },
        ],
      },
      {
        id: "DF-10022",
        createdAt: now,
        line: "Line B",
        station: "Assembly",
        partNumber: "PN-BX88",
        defectType: "Missing fastener",
        severity: "Critical",
        status: "RCA Required",
        detectedBy: "Quality",
        description: "Fastener missing on bracket; found at final inspection.",
        quantity: 2,
        photos: [],
        rca: null,
        actions: [],
      },
    ],
  };
  saveDemoState(seed);
  return seed;
}

function withDemoState(mutator) {
  const state = initDemoState();
  const next = mutator(structuredClone(state));
  saveDemoState(next);
  return next;
}

// PUBLIC_INTERFACE
export function isDemoModeEnabled() {
  /** Returns true when backend is unreachable and UI uses local demo storage. */
  const ff = process.env.REACT_APP_FEATURE_FLAGS || "";
  const explicit = ff.split(",").map(s => s.trim()).filter(Boolean);
  // Allow forcing demo mode with FEATURE_FLAGS=demo
  if (explicit.includes("demo")) return true;
  // If no backend configured, fall back to demo mode.
  return !process.env.REACT_APP_API_BASE && !process.env.REACT_APP_BACKEND_URL;
}

// PUBLIC_INTERFACE
export async function listDefects() {
  /** List defects for the log table. */
  if (isDemoModeEnabled()) {
    const state = initDemoState();
    return state.defects;
  }
  return apiRequest("/api/defects");
}

// PUBLIC_INTERFACE
export async function createDefect(payload) {
  /** Create a defect record. */
  if (isDemoModeEnabled()) {
    const id = `DF-${String(Math.floor(10000 + Math.random() * 89999))}`;
    const createdAt = new Date().toISOString();
    const defect = {
      id,
      createdAt,
      status: "Open",
      rca: null,
      actions: [],
      photos: [],
      ...payload,
    };
    withDemoState(s => {
      s.defects.unshift(defect);
      return s;
    });
    return defect;
  }
  return apiRequest("/api/defects", { method: "POST", body: JSON.stringify(payload) });
}

// PUBLIC_INTERFACE
export async function updateDefect(id, patch) {
  /** Patch defect fields (status, severity, description, etc.). */
  if (isDemoModeEnabled()) {
    let updated = null;
    withDemoState(s => {
      s.defects = s.defects.map(d => {
        if (d.id !== id) return d;
        updated = { ...d, ...patch };
        return updated;
      });
      return s;
    });
    return updated;
  }
  return apiRequest(`/api/defects/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

// PUBLIC_INTERFACE
export async function setRca(id, rca) {
  /** Set/update the defect RCA. */
  if (isDemoModeEnabled()) {
    return updateDefect(id, { rca, status: "Action Required" });
  }
  return apiRequest(`/api/defects/${encodeURIComponent(id)}/rca`, {
    method: "PUT",
    body: JSON.stringify(rca),
  });
}

// PUBLIC_INTERFACE
export async function addCorrectiveAction(defectId, action) {
  /** Add a corrective action item for a defect. */
  if (isDemoModeEnabled()) {
    const newAction = {
      id: `CA-${uuidv4().slice(0, 8)}`,
      status: "Open",
      verification: "",
      ...action,
    };
    let updated = null;
    withDemoState(s => {
      s.defects = s.defects.map(d => {
        if (d.id !== defectId) return d;
        updated = { ...d, actions: [newAction, ...(d.actions || [])] };
        return updated;
      });
      return s;
    });
    return updated;
  }
  return apiRequest(`/api/defects/${encodeURIComponent(defectId)}/actions`, {
    method: "POST",
    body: JSON.stringify(action),
  });
}

// PUBLIC_INTERFACE
export async function updateCorrectiveAction(defectId, actionId, patch) {
  /** Patch a corrective action for a defect. */
  if (isDemoModeEnabled()) {
    let updated = null;
    withDemoState(s => {
      s.defects = s.defects.map(d => {
        if (d.id !== defectId) return d;
        const actions = (d.actions || []).map(a => (a.id === actionId ? { ...a, ...patch } : a));
        updated = { ...d, actions };
        return updated;
      });
      return s;
    });
    return updated;
  }
  return apiRequest(`/api/defects/${encodeURIComponent(defectId)}/actions/${encodeURIComponent(actionId)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

// PUBLIC_INTERFACE
export async function getTrends(params = {}) {
  /** Get trends data for charting (by day, line, defect type, severity). */
  if (isDemoModeEnabled()) {
    const { defects } = initDemoState();
    // Minimal aggregated dataset for charts.
    const byType = {};
    const byLine = {};
    const bySeverity = {};
    for (const d of defects) {
      byType[d.defectType] = (byType[d.defectType] || 0) + (d.quantity || 1);
      byLine[d.line] = (byLine[d.line] || 0) + (d.quantity || 1);
      bySeverity[d.severity] = (bySeverity[d.severity] || 0) + (d.quantity || 1);
    }
    return {
      byType: Object.entries(byType).map(([name, value]) => ({ name, value })),
      byLine: Object.entries(byLine).map(([name, value]) => ({ name, value })),
      bySeverity: Object.entries(bySeverity).map(([name, value]) => ({ name, value })),
      filters: params,
    };
  }

  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    qs.set(k, String(v));
  });
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiRequest(`/api/trends${suffix}`);
}

// PUBLIC_INTERFACE
export async function exportDefects(params = {}) {
  /** Export defects (backend may return a file URL or blob). */
  if (isDemoModeEnabled()) {
    const state = initDemoState();
    return state.defects;
  }
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    qs.set(k, String(v));
  });
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiRequest(`/api/export${suffix}`);
}
