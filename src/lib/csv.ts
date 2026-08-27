export function toCsv(
  rows: Record<string, unknown>[],
  columns: string[],
): string {
  const escape = (value: unknown): string => {
    const str = value === null || value === undefined ? "" : String(value);
    if (/[",\r\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map(escape).join(",");
  const lines = rows.map((row) => columns.map((col) => escape(row[col])).join(","));
  return [header, ...lines].join("\r\n");
}
