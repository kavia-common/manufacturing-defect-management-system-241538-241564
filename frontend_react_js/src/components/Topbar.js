import React from "react";
import { IconPlus } from "./Icons";
import { isDemoModeEnabled } from "../api/defects";

// PUBLIC_INTERFACE
export function Topbar({ title, subtitle, onLogDefect }) {
  /** Top bar with current page heading and global quick actions. */
  return (
    <header className="topbar">
      <div className="topbarInner">
        <div className="pageTitle">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="topbarActions">
          {isDemoModeEnabled() ? <span className="badge badgeAmber">Demo mode</span> : <span className="badge badgePrimary">Live API</span>}
          <button className="btn btnPrimary" onClick={onLogDefect}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <IconPlus />
              Log defect
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
