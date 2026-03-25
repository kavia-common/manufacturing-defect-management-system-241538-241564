import React, { useMemo, useState } from "react";
import { Modal } from "./Modal";

// PUBLIC_INTERFACE
export function CorrectiveActionsModal({
  defect,
  isOpen,
  onClose,
  onAddAction,
  onUpdateAction,
}) {
  /** Modal for managing corrective actions for a defect. */
  const [owner, setOwner] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [action, setAction] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canAdd = useMemo(() => owner.trim() && dueDate.trim() && action.trim(), [owner, dueDate, action]);

  const footer = (
    <>
      <button className="btn" onClick={onClose}>Close</button>
    </>
  );

  return (
    <Modal
      title={`Corrective actions — ${defect?.id || ""}`}
      subtitle="Assign actions, track status, and document verification evidence before closure."
      isOpen={isOpen}
      onClose={onClose}
      footer={footer}
    >
      {error ? <div className="badge badgeError" role="alert">{error}</div> : null}

      <div className="card" style={{ marginTop: 8 }}>
        <div className="cardHeader">
          <div>
            <div className="cardTitle">Add action</div>
            <div className="cardSub">Owner + due date + clear action statement.</div>
          </div>
        </div>
        <div className="cardBody">
          <div className="formGrid">
            <div className="field">
              <label>Owner</label>
              <input className="input" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="e.g., Maintenance" />
            </div>
            <div className="field">
              <label>Due date</label>
              <input className="input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>Action</label>
              <textarea className="textarea" value={action} onChange={(e) => setAction(e.target.value)} placeholder="Describe corrective action to prevent recurrence..." />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
            <button
              className="btn btnPrimary"
              disabled={!canAdd || saving}
              onClick={async () => {
                setSaving(true);
                setError("");
                try {
                  await onAddAction?.({ owner, dueDate, action });
                  setOwner("");
                  setDueDate("");
                  setAction("");
                } catch (e) {
                  setError(e?.message || "Failed to add action");
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? "Adding..." : "Add action"}
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="cardHeader">
          <div>
            <div className="cardTitle">Action list</div>
            <div className="cardSub">Update status and verification notes.</div>
          </div>
          <div className="badge badgePrimary">{(defect?.actions || []).length} items</div>
        </div>
        <div className="cardBody">
          {(defect?.actions || []).length === 0 ? (
            <div className="fieldHint">No actions yet. Add at least one action before closing the defect.</div>
          ) : (
            <div className="tableWrap">
              <table className="table" style={{ minWidth: 780 }}>
                <thead>
                  <tr>
                    <th>Owner</th>
                    <th>Due</th>
                    <th>Status</th>
                    <th>Action</th>
                    <th>Verification</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {(defect.actions || []).map((a) => (
                    <ActionRow
                      key={a.id}
                      actionItem={a}
                      onUpdate={async (patch) => {
                        try {
                          await onUpdateAction?.(a.id, patch);
                        } catch (e) {
                          setError(e?.message || "Failed to update action");
                        }
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function ActionRow({ actionItem, onUpdate }) {
  const [status, setStatus] = useState(actionItem.status || "Open");
  const [verification, setVerification] = useState(actionItem.verification || "");
  const [saving, setSaving] = useState(false);

  return (
    <tr>
      <td>{actionItem.owner}</td>
      <td>{actionItem.dueDate}</td>
      <td style={{ width: 160 }}>
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          {["Open", "In Progress", "Blocked", "Done"].map(s => <option key={s}>{s}</option>)}
        </select>
      </td>
      <td>{actionItem.action}</td>
      <td style={{ width: 260 }}>
        <input
          className="input"
          value={verification}
          onChange={(e) => setVerification(e.target.value)}
          placeholder="Evidence / verification notes..."
        />
      </td>
      <td style={{ width: 120 }}>
        <button
          className="btn"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onUpdate?.({ status, verification });
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? "..." : "Save"}
        </button>
      </td>
    </tr>
  );
}
