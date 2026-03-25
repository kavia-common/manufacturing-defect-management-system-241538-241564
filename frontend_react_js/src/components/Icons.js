import React from "react";

function IconBase({ children, title, ...rest }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : "presentation"}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

// PUBLIC_INTERFACE
export function IconDashboard(props) {
  /** Dashboard icon. */
  return (
    <IconBase {...props}>
      <path d="M4 13h7V4H4v9Zm0 7h7v-5H4v5Zm9 0h7V11h-7v9Zm0-18v7h7V2h-7Z" fill="currentColor" />
    </IconBase>
  );
}

// PUBLIC_INTERFACE
export function IconList(props) {
  /** List icon. */
  return (
    <IconBase {...props}>
      <path d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z" fill="currentColor" />
    </IconBase>
  );
}

// PUBLIC_INTERFACE
export function IconAnalyze(props) {
  /** Analyze/trends icon. */
  return (
    <IconBase {...props}>
      <path
        d="M5 3h2v18H5V3Zm12 8h2v10h-2V11ZM9 13h2v8H9v-8Zm4-6h2v14h-2V7Z"
        fill="currentColor"
      />
    </IconBase>
  );
}

// PUBLIC_INTERFACE
export function IconExport(props) {
  /** Export/download icon. */
  return (
    <IconBase {...props}>
      <path
        d="M12 3a1 1 0 0 1 1 1v8.59l2.3-2.3 1.4 1.42-4.7 4.7-4.7-4.7 1.4-1.42 2.3 2.3V4a1 1 0 0 1 1-1Zm-7 16h14v2H5v-2Z"
        fill="currentColor"
      />
    </IconBase>
  );
}

// PUBLIC_INTERFACE
export function IconPlus(props) {
  /** Plus icon. */
  return (
    <IconBase {...props}>
      <path d="M11 5h2v14h-2V5Zm-6 6h14v2H5v-2Z" fill="currentColor" />
    </IconBase>
  );
}

// PUBLIC_INTERFACE
export function IconClose(props) {
  /** Close icon. */
  return (
    <IconBase {...props}>
      <path
        d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.29 19.71 2.88 18.29 9.17 12 2.88 5.71 4.29 4.29l6.3 6.3 6.29-6.3 1.42 1.42Z"
        fill="currentColor"
      />
    </IconBase>
  );
}
