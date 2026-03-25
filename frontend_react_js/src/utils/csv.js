/**
 * Simple CSV exporter. Escapes commas, quotes, and newlines.
 */

function escapeCsv(value) {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// PUBLIC_INTERFACE
export function downloadCsv(filename, rows) {
  /** Download a CSV file given an array of row objects. */
  const cols = rows.length ? Object.keys(rows[0]) : [];
  const lines = [
    cols.map(escapeCsv).join(","),
    ...rows.map(r => cols.map(c => escapeCsv(r[c])).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
