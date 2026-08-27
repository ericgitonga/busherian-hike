// Excel and Google Sheets both treat a leading =, +, -, @, tab, or CR as the start of a formula
// when importing CSV — an attacker-controlled field (e.g. a registrant's name) starting with
// one of these executes as a formula for whoever opens the export (issue #29). Prefixing with a
// literal single quote makes both applications render the value as plain text instead.
const FORMULA_TRIGGER = /^[=+\-@\t\r]/;

function neutralizeFormula(str: string): string {
  return FORMULA_TRIGGER.test(str) ? `'${str}` : str;
}

export function toCsv(
  rows: Record<string, unknown>[],
  columns: string[],
): string {
  const escape = (value: unknown): string => {
    const raw = value === null || value === undefined ? "" : String(value);
    const str = neutralizeFormula(raw);
    if (/[",\r\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map(escape).join(",");
  const lines = rows.map((row) => columns.map((col) => escape(row[col])).join(","));
  return [header, ...lines].join("\r\n");
}
