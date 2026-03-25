import React, { useMemo, useState } from "react";
import { Modal } from "./Modal";

const DEFAULTS = {
  line: "",
  station: "",
  partNumber: "",
  defectType: "",
  severity: "Minor",
  detectedBy: "Operator",
  quantity: 1,
  description: "",
};

// PUBLIC_INTERFACE
export function DefectFormModal({ isOpen, onClose, onSubmit }) {
  /** Modal for creating a new defect log entry. */
  const [values, setValues] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    return (
      values.line.trim() &&
      values.station.trim() &&
      values.partNumber.trim() &&
      values.defectType.trim() &&
      values.description.trim() &&
      Number(values.quantity) > 0
    );
  }, [values]);

  const footer = (
    <>
      <button className="btn" onClick={onClose} disabled={saving}>Cancel</button>
      <button
        className="btn btnPrimary"
        onClick={async () => {
          setError("");
          setSaving(true);
          try {
            await onSubmit?.({
              ...values,
              quantity: Number(values.quantity),
            });
            setValues(DEFAULTS);
            onClose?.();
          } catch (e) {
            setError(e?.message || "Failed to create defect");
          } finally {
            setSaving(false);
          }
        }}
        disabled={!canSubmit || saving}
      >
        {saving ? "Saving..." : "Create defect"}
      </button>
    </>
  );

  return (
    <Modal
      title="Log a defect"
      subtitle="Capture defect at point of occurrence; RCA and actions can be completed later."
      isOpen={isOpen}
      onClose={onClose}
      footer={footer}
    >
      {error ? <div className="badge badgeError" role="alert">{error}</div> : null}
      <div className="formGrid" style={{ marginTop: 12 }}>
        <div className="field">
          <label>Line</label>
          <input className="input" value={values.line} onChange={(e) => setValues(v => ({ ...v, line: e.target.value }))} placeholder="e.g., Line A" />
        </div>
        <div className="field">
          <label>Station</label>
          <input className="input" value={values.station} onChange={(e) => setValues(v => ({ ...v, station: e.target.value }))} placeholder="e.g., Assembly" />
        </div>
        <div className="field">
          <label>Part number</label>
          <input className="input" value={values.partNumber} onChange={(e) => setValues(v => ({ ...v, partNumber: e.target.value }))} placeholder="e.g., PN-AX12" />
        </div>
        <div className="field">
          <label>Defect type</label>
          <input className="input" value={values.defectType} onChange={(e) => setValues(v => ({ ...v, defectType: e.target.value }))} placeholder="e.g., Scratch / Crack / Missing fastener" />
        </div>
        <div className="field">
          <label>Severity</label>
          <select className="select" value={values.severity} onChange={(e) => setValues(v => ({ ...v, severity: e.target.value }))}>
            <option>Minor</option>
            <option>Major</option>
            <option>Critical</option>
          </select>
        </div>
        <div className="field">
          <label>Detected by</label>
          <select className="select" value={values.detectedBy} onChange={(e) => setValues(v => ({ ...v, detectedBy: e.target.value }))}>
            <option>Operator</option>
            <option>Quality</option>
            <option>Supervisor</option>
            <option>Customer</option>
          </select>
        </div>
        <div className="field">
          <label>Quantity affected</label>
          <input className="input" type="number" min="1" value={values.quantity} onChange={(e) => setValues(v => ({ ...v, quantity: e.target.value }))} />
          <div className="fieldHint">Use estimated count if exact quantity is unknown.</div>
        </div>
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label>Description</label>
          <textarea className="textarea" value={values.description} onChange={(e) => setValues(v => ({ ...v, description: e.target.value }))} placeholder="What happened? Where was it found? Any immediate containment?" />
        </div>
      </div>
    </Modal>
  );
}
