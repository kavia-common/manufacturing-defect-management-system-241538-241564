import React, { useEffect, useMemo, useState } from "react";
import { listDefects, updateDefect } from "../api/defects";
import { formatDateTime, severityBadgeVariant, statusBadgeVariant } from "../utils/format";

// PUBLIC_INTERFACE
export function DashboardPage({ onOpenRca, onOpenActions }) {
  /** Dashboard overview: KPIs + work queues for RCA and action closure. */
  const [defects, setDefects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const kpis = useMemo(() => {
    const total = defects.length;
    const open = defects.filter(d => (d.status || "").toLowerCase().includes("open")).length;
    const rcaReq = defects.filter(d => !d.rca || (d.status || "").toLowerCase().includes("rca")).length;
    const actionReq = defects.filter(d => (d.actions || []).length > 0 && (d.actions || []).some(a => (a.status || "").toLowerCase() !== "done")).length;
    const critical = defects.filter(d => (d.severity || "").toLowerCase() === "critical").length;
    return { total, open, rcaReq, actionReq, critical };
  }, [defects]);

  const rcaQueue = useMemo(() => defects.filter(d => !d.rca).slice(0, 6), [defects]);
  const actionQueue = useMemo(() => defects.filter(d => (d.actions || []).some(a => (a.status || "").toLowerCase() !== "done")).slice(0, 6), [defects]);

  const handleCloseDefect = async (d) => {
    // Enforce business rule: cannot close without RCA and all actions done (if any exist).
    const hasRca = Boolean(d.rca && d.rca.rootCause && d.rca.containment);
    const allActionsDone = (d.actions || []).length === 0 || (d.actions || []).every(a => (a.status || "").toLowerCase() === "done");

    if (!hasRca) {
      onOpenRca?.(d);
      return;
    }
    if (!allActionsDone) {
      onOpenActions?.(d);
      return;
    }
    await updateDefect(d.id, { status: "Closed" });
    await refresh();
  };

  return (
    <div className="content">
      {error ? <div className="badge badgeError" role="alert">{error}</div> : null}

      <div className="grid3" style={{ marginTop: 12 }}>
        <div className="card">
          <div className="cardBody kpi">
            <div className="kpiLabel">Total defects</div>
            <div className="kpiValue">{kpis.total}</div>
            <div className="kpiDelta">All recorded defects in scope</div>
          </div>
        </div>
        <div className="card">
          <div className="cardBody kpi">
            <div className="kpiLabel">RCA required</div>
            <div className="kpiValue">{kpis.rcaReq}</div>
            <div className="kpiDelta">Missing validated root cause & containment</div>
          </div>
        </div>
        <div className="card">
          <div className="cardBody kpi">
            <div className="kpiLabel">Critical severity</div>
            <div className="kpiValue">{kpis.critical}</div>
            <div className="kpiDelta">Escalate and contain immediately</div>
          </div>
        </div>
      </div>

      <div className="grid2" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="cardHeader">
            <div>
              <div className="cardTitle">RCA queue</div>
              <div className="cardSub">Defects that require mandatory RCA entry</div>
            </div>
            <span className="badge badgeAmber">{rcaQueue.length} showing</span>
          </div>
          <div className="cardBody">
            {loading ? (
              <div className="fieldHint">Loading...</div>
            ) : rcaQueue.length === 0 ? (
              <div className="fieldHint">No defects awaiting RCA. Great.</div>
            ) : (
              <div className="tableWrap">
                <table className="table" style={{ minWidth: 620 }}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Line</th>
                      <th>Type</th>
                      <th>Severity</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rcaQueue.map((d) => (
                      <tr key={d.id}>
                        <td><strong>{d.id}</strong></td>
                        <td>{d.line}</td>
                        <td>{d.defectType}</td>
                        <td><span className={`badge ${severityBadgeVariant(d.severity)}`}>{d.severity}</span></td>
                        <td>{formatDateTime(d.createdAt)}</td>
                        <td>
                          <button className="btn btnPrimary" onClick={() => onOpenRca?.(d)}>Add RCA</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="cardHeader">
            <div>
              <div className="cardTitle">Closure queue</div>
              <div className="cardSub">Defects with open actions or pending closure</div>
            </div>
            <span className="badge badgePrimary">{actionQueue.length} showing</span>
          </div>
          <div className="cardBody">
            {loading ? (
              <div className="fieldHint">Loading...</div>
            ) : actionQueue.length === 0 ? (
              <div className="fieldHint">No defects awaiting action closure.</div>
            ) : (
              <div className="tableWrap">
                <table className="table" style={{ minWidth: 650 }}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Status</th>
                      <th>Actions</th>
                      <th>RCA</th>
                      <th>Next</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actionQueue.map((d) => {
                      const allDone = (d.actions || []).every(a => (a.status || "").toLowerCase() === "done");
                      const hasRca = Boolean(d.rca && d.rca.rootCause && d.rca.containment);
                      return (
                        <tr key={d.id}>
                          <td><strong>{d.id}</strong></td>
                          <td><span className={`badge ${statusBadgeVariant(d.status)}`}>{d.status}</span></td>
                          <td>{(d.actions || []).length}</td>
                          <td>{hasRca ? <span className="badge badgeSuccess">Complete</span> : <span className="badge badgeAmber">Missing</span>}</td>
                          <td style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button className="btn" onClick={() => onOpenActions?.(d)}>Manage actions</button>
                            <button className="btn btnPrimary" onClick={() => handleCloseDefect(d)} disabled={!hasRca || !allDone}>
                              Close
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
