import React, { useEffect, useMemo, useState } from "react";
import { listDefects, updateDefect } from "../api/defects";
import { formatDateTime, severityBadgeVariant, statusBadgeVariant } from "../utils/format";

// PUBLIC_INTERFACE
export function DefectLogPage({ onOpenRca, onOpenActions }) {
  /** Defect log page with filters and workflow actions. */
  const [defects, setDefects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [line, setLine] = useState("");
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const data = await listDefects();
      setDefects(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Failed to load defects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const lines = useMemo(() => Array.from(new Set(defects.map(d => d.line).filter(Boolean))).sort(), [defects]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return defects.filter(d => {
      if (line && d.line !== line) return false;
      if (status && d.status !== status) return false;
      if (severity && d.severity !== severity) return false;
      if (!query) return true;
      const hay = [
        d.id, d.line, d.station, d.partNumber, d.defectType, d.severity, d.status, d.detectedBy, d.description,
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(query);
    });
  }, [defects, line, q, severity, status]);

  const statusOptions = useMemo(() => Array.from(new Set(defects.map(d => d.status).filter(Boolean))).sort(), [defects]);

  const handleClose = async (d) => {
    const hasRca = Boolean(d.rca && d.rca.rootCause && d.rca.containment);
    const allActionsDone = (d.actions || []).length === 0 || (d.actions || []).every(a => (a.status || "").toLowerCase() === "done");

    if (!hasRca) return onOpenRca?.(d);
    if (!allActionsDone) return onOpenActions?.(d);

    await updateDefect(d.id, { status: "Closed" });
    await refresh();
  };

  return (
    <div className="content">
      {error ? <div className="badge badgeError" role="alert">{error}</div> : null}

      <div className="card" style={{ marginTop: 12 }}>
        <div className="cardHeader">
          <div>
            <div className="cardTitle">Defect log</div>
            <div className="cardSub">Capture defects, complete RCA, and track corrective actions to closure.</div>
          </div>
          <div className="badge badgePrimary">{filtered.length} / {defects.length}</div>
        </div>

        <div className="cardBody">
          <div className="toolbar">
            <div className="toolbarLeft">
              <input className="input" style={{ width: 260 }} placeholder="Search ID, part, type, description..." value={q} onChange={(e) => setQ(e.target.value)} />
              <select className="select" style={{ width: 160 }} value={line} onChange={(e) => setLine(e.target.value)}>
                <option value="">All lines</option>
                {lines.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <select className="select" style={{ width: 180 }} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All statuses</option>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="select" style={{ width: 160 }} value={severity} onChange={(e) => setSeverity(e.target.value)}>
                <option value="">All severity</option>
                <option>Minor</option>
                <option>Major</option>
                <option>Critical</option>
              </select>
              <button className="btn" onClick={() => { setQ(""); setLine(""); setStatus(""); setSeverity(""); }}>Reset</button>
            </div>

            <div className="pill">
              <span>Workflow rule:</span>
              <strong>RCA + actions must be complete before closure</strong>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            {loading ? (
              <div className="fieldHint">Loading...</div>
            ) : (
              <div className="tableWrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Created</th>
                      <th>Line / Station</th>
                      <th>Part</th>
                      <th>Type</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Qty</th>
                      <th>RCA</th>
                      <th>Actions</th>
                      <th>Next step</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((d) => {
                      const hasRca = Boolean(d.rca && d.rca.rootCause && d.rca.containment);
                      const openActions = (d.actions || []).filter(a => (a.status || "").toLowerCase() !== "done").length;
                      return (
                        <tr key={d.id}>
                          <td><strong>{d.id}</strong></td>
                          <td>{formatDateTime(d.createdAt)}</td>
                          <td>{d.line} / {d.station}</td>
                          <td>{d.partNumber}</td>
                          <td>{d.defectType}</td>
                          <td><span className={`badge ${severityBadgeVariant(d.severity)}`}>{d.severity}</span></td>
                          <td><span className={`badge ${statusBadgeVariant(d.status)}`}>{d.status}</span></td>
                          <td>{d.quantity ?? ""}</td>
                          <td>{hasRca ? <span className="badge badgeSuccess">Complete</span> : <span className="badge badgeAmber">Missing</span>}</td>
                          <td>{(d.actions || []).length} ({openActions} open)</td>
                          <td style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button className="btn" onClick={() => onOpenRca?.(d)}>{hasRca ? "Edit RCA" : "Add RCA"}</button>
                            <button className="btn" onClick={() => onOpenActions?.(d)}>Actions</button>
                            <button className="btn btnPrimary" onClick={() => handleClose(d)}>Close</button>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 ? (
                      <tr><td colSpan={11} style={{ color: "var(--ocean-muted)" }}>No defects match the current filters.</td></tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="fieldHint" style={{ marginTop: 10 }}>
            Tip: Defects can be set to “RCA Required” to enforce analysis before actions are assigned.
          </div>
        </div>
      </div>
    </div>
  );
}
