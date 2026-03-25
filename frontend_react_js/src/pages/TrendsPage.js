import React, { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { getTrends, listDefects } from "../api/defects";

const COLORS = ["#2563EB", "#F59E0B", "#10b981", "#ef4444", "#8b5cf6", "#14b8a6"];

// PUBLIC_INTERFACE
export function TrendsPage() {
  /** Trend & analysis dashboards for systemic defect reduction. */
  const [trends, setTrends] = useState({ byType: [], byLine: [], bySeverity: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [windowDays, setWindowDays] = useState("30");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        // If backend supports window filtering, pass it; demo ignores.
        const data = await getTrends({ windowDays });
        setTrends(data || { byType: [], byLine: [], bySeverity: [] });
      } catch (e) {
        // Fallback: compute some aggregations from defect list if trends endpoint not available.
        try {
          const defects = await listDefects();
          const byType = {};
          const byLine = {};
          const bySeverity = {};
          for (const d of defects) {
            byType[d.defectType] = (byType[d.defectType] || 0) + (d.quantity || 1);
            byLine[d.line] = (byLine[d.line] || 0) + (d.quantity || 1);
            bySeverity[d.severity] = (bySeverity[d.severity] || 0) + (d.quantity || 1);
          }
          setTrends({
            byType: Object.entries(byType).map(([name, value]) => ({ name, value })),
            byLine: Object.entries(byLine).map(([name, value]) => ({ name, value })),
            bySeverity: Object.entries(bySeverity).map(([name, value]) => ({ name, value })),
          });
        } catch (e2) {
          setError(e2?.message || e?.message || "Failed to load trends");
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [windowDays]);

  const topTypes = useMemo(() => (trends.byType || []).slice().sort((a, b) => b.value - a.value).slice(0, 8), [trends.byType]);

  return (
    <div className="content">
      {error ? <div className="badge badgeError" role="alert">{error}</div> : null}

      <div className="card" style={{ marginTop: 12 }}>
        <div className="cardHeader">
          <div>
            <div className="cardTitle">Trend window</div>
            <div className="cardSub">Use trends to target systemic issues and prevent recurrence.</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className="badge">Last</span>
            <select className="select" value={windowDays} onChange={(e) => setWindowDays(e.target.value)} style={{ width: 130 }}>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
            </select>
          </div>
        </div>
        <div className="cardBody">
          {loading ? <div className="fieldHint">Loading...</div> : null}
          <div className="grid2" style={{ marginTop: 4 }}>
            <div className="card">
              <div className="cardHeader">
                <div>
                  <div className="cardTitle">Defects by type (top)</div>
                  <div className="cardSub">Prioritize high-frequency defect categories.</div>
                </div>
              </div>
              <div className="cardBody" style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topTypes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} height={70} angle={-20} textAnchor="end" />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#2563EB" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="cardHeader">
                <div>
                  <div className="cardTitle">Defects by severity</div>
                  <div className="cardSub">Monitor escalation and containment performance.</div>
                </div>
              </div>
              <div className="cardBody" style={{ height: 320, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ height: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={trends.bySeverity || []} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                        {(trends.bySeverity || []).map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
                  {(trends.bySeverity || []).map((s, idx) => (
                    <div key={s.name} className="badge" style={{ justifyContent: "space-between" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[idx % COLORS.length], display: "inline-block" }} />
                        {s.name}
                      </span>
                      <strong>{s.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 14 }}>
            <div className="cardHeader">
              <div>
                <div className="cardTitle">Defects by line</div>
                <div className="cardSub">Compare lines to spot process drift or training needs.</div>
              </div>
            </div>
            <div className="cardBody" style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends.byLine || []} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={90} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#F59E0B" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
