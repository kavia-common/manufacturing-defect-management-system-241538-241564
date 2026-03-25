import React, { useMemo, useState } from "react";
import { Modal } from "./Modal";

const METHOD_OPTIONS = ["5-Why", "Ishikawa", "8D", "FTA"];

// PUBLIC_INTERFACE
export function RcaModal({ defect, isOpen, onClose, onSave }) {
  /** Modal for root cause analysis entry and update. */
  const [method, setMethod] = useState(defect?.rca?.method || "5-Why");
  const [rootCause, setRootCause] = useState(defect?.rca?.rootCause || "");
  const [containment, setContainment] = useState(defect?.rca?.containment || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canSave = useMemo(() => {
    return method.trim() && rootCause.trim() && containment.trim();
  }, [method, rootCause, containment]);

  const footer = (
    <>
      <button className="btn" onClick={onClose} disabled={saving}>Cancel</button>
      <button
        className="btn btnPrimary"
        disabled={!canSave || saving}
        onClick={async () => {
          setSaving(true);
          setError("");
          try {
            await onSave?.({
              method,
              rootCause,
              containment,
            });
            onClose?.();
          } catch (e) {
            setError(e?.message || "Failed to save RCA");
          } finally {
            setSaving(false);
          }
        }}
      >
        {saving ? "Saving..." : "Save RCA"}
      </button>
    </>
  );

  return (
    <Modal
      title={`Root Cause Analysis — ${defect?.id || ""}`}
      subtitle="RCA is mandatory before closing a defect. Provide containment and verified root cause."
      isOpen={isOpen}
      onClose={onClose}
      footer={footer}
    >
      {error ? <div className="badge badgeError" role="alert">{error}</div> : null}
      <div className="formGrid" style={{ marginTop: 12 }}>
        <div className="field">
          <label>Method</label>
          <select className="select" value={method} onChange={(e) => setMethod(e.target.value)}>
            {METHOD_OPTIONS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label>Containment (immediate)</label>
          <textarea className="textarea" value={containment} onChange={(e) => setContainment(e.target.value)} placeholder="Actions to protect customer / isolate suspect product..." />
        </div>
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label>Root cause (validated)</label>
          <textarea className="textarea" value={rootCause} onChange={(e) => setRootCause(e.target.value)} placeholder="Document the validated root cause..." />
          <div className="fieldHint">Include evidence of validation (trial run, measurement, audit trail) where applicable.</div>
        </div>
      </div>
    </Modal>
  );
}
