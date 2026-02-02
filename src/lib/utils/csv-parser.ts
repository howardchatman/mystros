export interface CsvRow {
  [key: string]: string;
}

/**
 * Parse a CSV string into an array of objects.
 * Handles quoted fields, commas within quotes, and newlines within quotes.
 */
export function parseCSV(text: string): CsvRow[] {
  const lines = splitCSVLines(text.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]!).map((h) => h.trim().toLowerCase());
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]!);
    if (values.length === 0 || (values.length === 1 && values[0]!.trim() === "")) continue;

    const row: CsvRow = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]!] = (values[j] || "").trim();
    }
    rows.push(row);
  }

  return rows;
}

function splitCSVLines(text: string): string[] {
  const lines: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && text[i + 1] === "\n") i++; // skip \r\n
      if (current.trim()) lines.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) lines.push(current);

  return lines;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);

  return fields;
}

/**
 * Validate that all required headers are present in the CSV.
 */
export function validateHeaders(
  headers: string[],
  required: string[]
): { valid: boolean; missing: string[] } {
  const lower = headers.map((h) => h.trim().toLowerCase());
  const missing = required.filter((r) => !lower.includes(r.toLowerCase()));
  return { valid: missing.length === 0, missing };
}
