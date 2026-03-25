import React, { useEffect } from "react";
import { IconClose } from "./Icons";

// PUBLIC_INTERFACE
export function Modal({ title, subtitle, isOpen, onClose, children, footer }) {
  /** Accessible modal dialog with Escape-to-close and overlay click-to-close. */
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modalOverlay"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Dialog"}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="modal">
        <div className="modalHeader">
          <div>
            <h2>{title}</h2>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <button className="btn btnGhost" onClick={onClose} aria-label="Close dialog">
            <IconClose />
          </button>
        </div>
        <div className="modalBody">{children}</div>
        {footer ? <div className="modalFooter">{footer}</div> : null}
      </div>
    </div>
  );
}
