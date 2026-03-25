import React, { useMemo, useState } from "react";
import { exportDefects, listDefects } from "../api/defects";
import { downloadCsv } from "../utils/csv";
import { formatDateTime } from "../utils/format";

// PUBLIC_INTERFACE
export function ExportPage() {
  /** Export defects and generate audit-ready extracts. */
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [format, setFormat] = useState("csv");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastInfo, setLastInfo] = useState("");

  const params = useMemo(() => ({ from, to }), [from, to]);

  return (
    <div className="content">
      {error ? <div className="badge badgeError" role="alert">{error}</div> : null}
      {lastInfo ? <div className="badge badgeSuccess" style={{ marginTop: 10 }} role="status">{lastInfo}</div> : null}

      <div className="card" style={{ marginTop: 12 }}>
        <div className="cardHeader">
          <div>
            <div className="cardTitle">Export</div>
            <div className="cardSub">Create audit-ready extracts for internal reviews and customer reporting.</div>
          </div>
          <span className="badge">Filters supported: date range</span>
        </div>

        <div className="cardBody">
          <div className="formGrid">
            <div className="field">
              <label>From</label>
              <input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="field">
              <label>To</label>
              <input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>Format</label>
              <select className="select" value={format} onChange={(e) => setFormat(e.target.value)} style={{ maxWidth: 220 }}>
                <option value="csv">CSV (download)</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
            <button
              className="btn"
              onClick={() => {
                setFrom("");
                setTo("");
                setError("");
                setLastInfo("");
              }}
              disabled={loading}
            >
              Reset
            </button>
            <button
              className="btn btnPrimary"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                setError("");
                setLastInfo("");
                try {
                  // Backend might return structured data or a file link; for now we support structured lists.
                  const data = await exportDefects(params);
                  const defects = Array.isArray(data) ? data : await listDefects();

                  const rows = defects.map(d => ({
                    id: d.id,
                    createdAt: formatDateTime(d.createdAt),
                    line: d.line,
                    station: d.station,
                    partNumber: d.partNumber,
                    defectType: d.defectType,
                    severity: d.severity,
                    status: d.status,
                    quantity: d.quantity,
                    detectedBy: d.detectedBy,
                    description: d.description,
                    rca_method: d.rca?.method || "",
                    rca_containment: d.rca?.containment || "",
                    rca_rootCause: d.rca?.rootCause || "",
                    actions_count: (d.actions || []).length,
                    actions_open: (d.actions || []).filter(a => (a.status || "").toLowerCase() !== "done").length,
                  }));

                  if (format === "csv") {
                    const name = `defects_export_${new Date().toISOString().slice(0, 10)}.csv`;
                    downloadCsv(name, rows);
                    setLastInfo(`Export generated: ${name} (${rows.length} rows)`);
                  }
                } catch (e) {
                  setError(e?.message || "Export failed");
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? "Generating..." : "Generate export"}
            </button>
          </div>

          <div className="card" style={{ marginTop: 14 }}>
            <div className="cardHeader">
              <div>
                <div className="cardTitle">Audit checklist</div>
                <div className="cardSub">Before audit export, confirm these fields are complete.</div>
              </div>
            </div>
            <div className="cardBody">
              <ul style={{ margin: 0, paddingLeft: 18, color: "var(--ocean-muted)", fontSize: 13, lineHeight: 1.7 }}>
                <li>Defect description + containment recorded at occurrence</li>
                <li>Mandatory RCA completed (method, validated root cause, containment)</li>
                <li>Corrective actions assigned with owner and due date</li>
                <li>Verification evidence recorded and actions set to Done</li>
                <li>Defect closed only when RCA + actions are complete</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
