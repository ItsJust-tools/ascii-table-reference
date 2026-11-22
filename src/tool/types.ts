/** ASCII table categories used for grouping and filtering. */
export type AsciiCategory = 'control' | 'digit' | 'uppercase' | 'lowercase' | 'punctuation';

/** How the character list is displayed. */
export type AsciiView = 'table' | 'grid';

export type CategoryFilter = 'all' | AsciiCategory;

/** One row of the ASCII table. */
export interface AsciiEntry {
  /** Decimal code point 0-127. */
  code: number;
  /** Printable glyph, or the mnemonic (e.g. 'NUL') for control characters. */
  char: string;
  /** Short mnemonic name (controls) or the character itself. */
  name: string;
  /** One-line human description. */
  description: string;
  category: AsciiCategory;
}

export interface HistoryEntry {
  /** Short human readable description of the copied value. */
  text: string;
  /** ISO timestamp when the entry was saved. */
  createdAt: string;
}

export interface ToolState {
  /** Search filter: matches name, character, decimal, hex, octal or binary text. */
  search: string;
  /** Display mode. */
  view: AsciiView;
  /** Active category filter. */
  category: CategoryFilter;
  /** Saved copy history, newest first. */
  history: HistoryEntry[];
}

export const DEFAULT_STATE: ToolState = {
  search: '',
  view: 'table',
  category: 'all',
  history: [],
};

export const MAX_HISTORY = 20;

export const VIEWS: { value: AsciiView; label: string; hint: string }[] = [
  { value: 'table', label: 'Table', hint: 'detailed rows with all number bases' },
  { value: 'grid', label: 'Grid', hint: 'compact character grid' },
];

export const CATEGORIES: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'control', label: 'Controls' },
  { value: 'punctuation', label: 'Punctuation' },
  { value: 'digit', label: 'Digits' },
  { value: 'uppercase', label: 'Uppercase' },
  { value: 'lowercase', label: 'Lowercase' },
];

/** Mnemonics and short descriptions for the 33 control characters (0-31 + 127). */
export const CONTROL_CHARS: Record<number, { name: string; description: string }> = {
  0: { name: 'NUL', description: 'Null — string terminator in C' },
  1: { name: 'SOH', description: 'Start of heading' },
  2: { name: 'STX', description: 'Start of text' },
  3: { name: 'ETX', description: 'End of text' },
  4: { name: 'EOT', description: 'End of transmission' },
  5: { name: 'ENQ', description: 'Enquiry — request a response' },
  6: { name: 'ACK', description: 'Acknowledgement' },
  7: { name: 'BEL', description: 'Bell — audible alert' },
  8: { name: 'BS', description: 'Backspace' },
  9: { name: 'TAB', description: 'Horizontal tab' },
  10: { name: 'LF', description: 'Line feed — newline on Unix' },
  11: { name: 'VT', description: 'Vertical tab' },
  12: { name: 'FF', description: 'Form feed — new page' },
  13: { name: 'CR', description: 'Carriage return — Windows newline with LF' },
  14: { name: 'SO', description: 'Shift out' },
  15: { name: 'SI', description: 'Shift in' },
  16: { name: 'DLE', description: 'Data link escape' },
  17: { name: 'DC1', description: 'Device control 1 — often XON' },
  18: { name: 'DC2', description: 'Device control 2' },
  19: { name: 'DC3', description: 'Device control 3 — often XOFF' },
  20: { name: 'DC4', description: 'Device control 4' },
  21: { name: 'NAK', description: 'Negative acknowledgement' },
  22: { name: 'SYN', description: 'Synchronous idle' },
  23: { name: 'ETB', description: 'End of transmission block' },
  24: { name: 'CAN', description: 'Cancel' },
  25: { name: 'EM', description: 'End of medium' },
  26: { name: 'SUB', description: 'Substitute' },
  27: { name: 'ESC', description: 'Escape — starts escape sequences' },
  28: { name: 'FS', description: 'File separator' },
  29: { name: 'GS', description: 'Group separator' },
  30: { name: 'RS', description: 'Record separator' },
  31: { name: 'US', description: 'Unit separator' },
  127: { name: 'DEL', description: 'Delete' },
};

function categorize(code: number): AsciiCategory {
  if ((code >= 0 && code <= 31) || code === 127) return 'control';
  if (code >= 48 && code <= 57) return 'digit';
  if (code >= 65 && code <= 90) return 'uppercase';
  if (code >= 97 && code <= 122) return 'lowercase';
  return 'punctuation';
}

function describe(code: number, char: string): string {
  const control = CONTROL_CHARS[code];
  if (control) return control.description;
  switch (code) {
    case 32:
      return 'Space';
    case 45:
      return 'Hyphen-minus';
    case 46:
      return 'Full stop (period)';
    case 34:
      return 'Double quote';
    case 39:
      return 'Single quote / apostrophe';
    case 64:
      return 'At sign';
    default:
      return `The character “${char}”`;
  }
}

function buildAsciiTable(): AsciiEntry[] {
  return Array.from({ length: 128 }, (_, code) => {
    const control = CONTROL_CHARS[code];
    const char = control ? control.name : String.fromCharCode(code);
    const name = control ? control.name : String.fromCharCode(code);
    return {
      code,
      char,
      name,
      description: describe(code, String.fromCharCode(code)),
      category: categorize(code),
    };
  });
}

/** The complete ASCII table, 0-127, lazily frozen. */
export const ASCII_TABLE: readonly AsciiEntry[] = buildAsciiTable();

/** Decimal → hex string (e.g. 65 → '0x41'). */
export function toHex(code: number): string {
  return `0x${code.toString(16).toUpperCase().padStart(2, '0')}`;
}

/** Decimal → octal string (e.g. 65 → '0o101'). */
export function toOctal(code: number): string {
  return `0o${code.toString(8).padStart(3, '0')}`;
}

/** Decimal → binary string (e.g. 65 → '0b01000001'). */
export function toBinary(code: number): string {
  return `0b${code.toString(2).padStart(8, '0')}`;
}

/** Base conversion helpers used by the search filter. */
export function decimalToRadix(code: number, radix: number): string {
  return code.toString(radix);
}

/** The printable character of an entry (mnemonic for control characters). */
export function displayName(entry: AsciiEntry): string {
  return entry.name;
}

/** Find one entry by decimal code, or null when out of range. */
export function entryForCode(code: number): AsciiEntry | null {
  if (!Number.isInteger(code) || code < 0 || code > 127) return null;
  return ASCII_TABLE[code] ?? null;
}

/**
 * Filter entries by a free-text query. Matches, case-insensitively, against
 * name/character, decimal, hex, octal and binary representations, category,
 * and control-character descriptions.
 */
export function filterEntries(state: Pick<ToolState, 'search' | 'category'>): AsciiEntry[] {
  const query = state.search.trim().toLowerCase();
  return ASCII_TABLE.filter((entry) => {
    if (state.category !== 'all' && entry.category !== state.category) return false;
    if (!query) return true;
    const haystack = [
      entry.name,
      entry.name.toLowerCase(),
      entry.description,
      entry.category,
      String(entry.code),
      toHex(entry.code),
      toHex(entry.code).slice(2),
      toOctal(entry.code),
      toBinary(entry.code),
      toBinary(entry.code).slice(2),
      entry.code.toString(16),
    ];
    return haystack.some((v) => v.toLowerCase().includes(query));
  });
}

/** Human summary used by the status bar and copy actions. */
export function summaryText(state: ToolState): string {
  const count = filterEntries(state).length;
  const label = state.view === 'grid' ? 'Grid' : 'Table';
  return `${label}: ${count} of 128 characters shown`;
}

export function isState(value: unknown): value is ToolState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Partial<ToolState>;
  return (
    typeof v.search === 'string' && typeof v.view === 'string' && typeof v.category === 'string'
  );
}
