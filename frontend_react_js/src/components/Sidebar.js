import React from "react";
import { NavLink } from "react-router-dom";
import { IconAnalyze, IconDashboard, IconExport, IconList } from "./Icons";

// PUBLIC_INTERFACE
export function Sidebar() {
  /** Application sidebar navigation. */
  const items = [
    { to: "/", title: "Dashboard", sub: "Overview & KPIs", icon: <IconDashboard className="navIcon" /> },
    { to: "/defects", title: "Defect log", sub: "Capture & manage", icon: <IconList className="navIcon" /> },
    { to: "/trends", title: "Trends", sub: "Systemic analysis", icon: <IconAnalyze className="navIcon" /> },
    { to: "/export", title: "Export", sub: "Audit-ready reports", icon: <IconExport className="navIcon" /> },
  ];

  return (
    <aside className="sidebar">
      <div className="brand" aria-label="Manufacturing Defect Management System">
        <div className="brandMark" />
        <div className="brandTitle">
          <strong>Defect Management</strong>
          <span>Ocean Professional</span>
        </div>
      </div>

      <nav className="nav" aria-label="Primary">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.to === "/"}
            className={({ isActive }) => `navItem ${isActive ? "navItemActive" : ""}`}
          >
            {it.icon}
            <div className="navMeta">
              <strong>{it.title}</strong>
              <span>{it.sub}</span>
            </div>
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: 10, marginTop: 10 }}>
        <div className="badge">
          <span style={{ color: "var(--ocean-muted)" }}>Tip:</span>
          <span>Use “Log defect” from any page.</span>
        </div>
      </div>
    </aside>
  );
}
