import React, { useMemo, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";

import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { DefectFormModal } from "./components/DefectFormModal";
import { RcaModal } from "./components/RcaModal";
import { CorrectiveActionsModal } from "./components/CorrectiveActionsModal";

import { DashboardPage } from "./pages/DashboardPage";
import { DefectLogPage } from "./pages/DefectLogPage";
import { TrendsPage } from "./pages/TrendsPage";
import { ExportPage } from "./pages/ExportPage";

import {
  addCorrectiveAction,
  createDefect,
  setRca,
  updateCorrectiveAction,
} from "./api/defects";

/**
 * Main React application.
 * Provides sidebar dashboard navigation for defect logging, RCA, corrective actions, trends, and export.
 */

function usePageMeta() {
  const loc = useLocation();
  return useMemo(() => {
    if (loc.pathname === "/") {
      return { title: "Dashboard", subtitle: "Work queues and KPI overview for defect lifecycle management." };
    }
    if (loc.pathname.startsWith("/defects")) {
      return { title: "Defect log", subtitle: "Capture defects, complete RCA, and track corrective actions to closure." };
    }
    if (loc.pathname.startsWith("/trends")) {
      return { title: "Trends", subtitle: "Analyze systemic issues by type, line, and severity to reduce recurrence." };
    }
    if (loc.pathname.startsWith("/export")) {
      return { title: "Export", subtitle: "Generate audit-ready extracts for reviews and reporting." };
    }
    return { title: "Defect Management", subtitle: "Manufacturing quality workflow." };
  }, [loc.pathname]);
}

// PUBLIC_INTERFACE
function AppShell() {
  /** App shell containing navigation, topbar and page routes. */
  const meta = usePageMeta();

  const [logOpen, setLogOpen] = useState(false);
  const [rcaOpen, setRcaOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [activeDefect, setActiveDefect] = useState(null);

  const openRca = (defect) => {
    setActiveDefect(defect);
    setRcaOpen(true);
  };

  const openActions = (defect) => {
    setActiveDefect(defect);
    setActionsOpen(true);
  };

  return (
    <div className="appShell">
      <Sidebar />

      <main className="main">
        <Topbar title={meta.title} subtitle={meta.subtitle} onLogDefect={() => setLogOpen(true)} />

        <Routes>
          <Route path="/" element={<DashboardPage onOpenRca={openRca} onOpenActions={openActions} />} />
          <Route path="/defects" element={<DefectLogPage onOpenRca={openRca} onOpenActions={openActions} />} />
          <Route path="/trends" element={<TrendsPage />} />
          <Route path="/export" element={<ExportPage />} />
        </Routes>

        <DefectFormModal
          isOpen={logOpen}
          onClose={() => setLogOpen(false)}
          onSubmit={async (payload) => {
            // Mark defects as needing RCA by default for governance
            await createDefect({ ...payload, status: "RCA Required" });
          }}
        />

        <RcaModal
          defect={activeDefect}
          isOpen={rcaOpen}
          onClose={() => setRcaOpen(false)}
          onSave={async (rca) => {
            if (!activeDefect) return;
            await setRca(activeDefect.id, rca);
          }}
        />

        <CorrectiveActionsModal
          defect={activeDefect}
          isOpen={actionsOpen}
          onClose={() => setActionsOpen(false)}
          onAddAction={async (action) => {
            if (!activeDefect) return;
            await addCorrectiveAction(activeDefect.id, action);
          }}
          onUpdateAction={async (actionId, patch) => {
            if (!activeDefect) return;
            await updateCorrectiveAction(activeDefect.id, actionId, patch);
          }}
        />
      </main>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** Root component, provides routing. */
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
