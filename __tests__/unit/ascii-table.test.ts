import { describe, it, expect } from 'vitest';
import {
  ASCII_TABLE,
  CATEGORIES,
  CONTROL_CHARS,
  DEFAULT_STATE,
  MAX_HISTORY,
  VIEWS,
  decimalToRadix,
  entryForCode,
  filterEntries,
  isState,
  summaryText,
  toBinary,
  toHex,
  toOctal,
  type ToolState,
} from '@/tool/types';
import {
  asciiTableTool,
  deserializeState,
  serializeState,
  withHistory,
  roundTrips,
} from '@/tool/tool-definition';

const state = (patch: Partial<ToolState> = {}): ToolState => ({ ...DEFAULT_STATE, ...patch });

describe('ascii table data', () => {
  it('contains all 128 codes with correct decimals', () => {
    expect(ASCII_TABLE).toHaveLength(128);
    ASCII_TABLE.forEach((entry, i) => expect(entry.code).toBe(i));
  });

  it('maps characters correctly for printable range', () => {
    expect(entryForCode(65)?.char).toBe('A');
    expect(entryForCode(97)?.char).toBe('a');
    expect(entryForCode(48)?.char).toBe('0');
    expect(entryForCode(32)?.char).toBe(' ');
    expect(entryForCode(33)?.char).toBe('!');
    expect(entryForCode(126)?.char).toBe('~');
  });

  it('uses mnemonics for control characters', () => {
    expect(entryForCode(0)?.name).toBe('NUL');
    expect(entryForCode(9)?.name).toBe('TAB');
    expect(entryForCode(10)?.name).toBe('LF');
    expect(entryForCode(13)?.name).toBe('CR');
    expect(entryForCode(27)?.name).toBe('ESC');
    expect(entryForCode(127)?.name).toBe('DEL');
  });

  it('categorizes codes correctly', () => {
    const categoryOf = (code: number) => entryForCode(code)?.category;
    expect(categoryOf(0)).toBe('control');
    expect(categoryOf(31)).toBe('control');
    expect(categoryOf(32)).toBe('punctuation');
    expect(categoryOf(48)).toBe('digit');
    expect(categoryOf(57)).toBe('digit');
    expect(categoryOf(65)).toBe('uppercase');
    expect(categoryOf(90)).toBe('uppercase');
    expect(categoryOf(97)).toBe('lowercase');
    expect(categoryOf(122)).toBe('lowercase');
    expect(categoryOf(123)).toBe('punctuation');
    expect(categoryOf(127)).toBe('control');
  });

  it('provides descriptions with descriptions for every entry', () => {
    ASCII_TABLE.forEach((entry) => {
      expect(typeof entry.description).toBe('string');
      expect(entry.description.length).toBeGreaterThan(0);
    });
  });

  it('covers all 33 control characters in CONTROL_CHARS', () => {
    const controlCodes = [...Array.from({ length: 32 }, (_, i) => i), 127];
    controlCodes.forEach((code) => expect(CONTROL_CHARS[code]).toBeDefined());
    expect(Object.keys(CONTROL_CHARS)).toHaveLength(33);
  });
});

describe('base conversions', () => {
  it('formats hex with 0x prefix and padding', () => {
    expect(toHex(0)).toBe('0x00');
    expect(toHex(65)).toBe('0x41');
    expect(toHex(127)).toBe('0x7F');
    expect(toHex(10)).toBe('0x0A');
  });

  it('formats octal with 0o prefix and padding', () => {
    expect(toOctal(0)).toBe('0o000');
    expect(toOctal(65)).toBe('0o101');
    expect(toOctal(127)).toBe('0o177');
    expect(toOctal(8)).toBe('0o010');
  });

  it('formats binary with 0b prefix padded to 8 bits', () => {
    expect(toBinary(0)).toBe('0b00000000');
    expect(toBinary(65)).toBe('0b01000001');
    expect(toBinary(127)).toBe('0b01111111');
    expect(toBinary(5)).toBe('0b00000101');
  });

  it('exposes raw radix strings', () => {
    expect(decimalToRadix(65, 16)).toBe('41');
    expect(decimalToRadix(65, 2)).toBe('1000001');
    expect(decimalToRadix(65, 8)).toBe('101');
  });
});

describe('entryForCode', () => {
  it('returns null out of range or for non-integers', () => {
    expect(entryForCode(-1)).toBeNull();
    expect(entryForCode(128)).toBeNull();
    expect(entryForCode(1.5)).toBeNull();
    expect(entryForCode(NaN)).toBeNull();
  });

  it('returns entries for boundary codes', () => {
    expect(entryForCode(0)?.code).toBe(0);
    expect(entryForCode(127)?.code).toBe(127);
  });
});

describe('filterEntries', () => {
  it('returns all 128 with default state', () => {
    expect(filterEntries(DEFAULT_STATE)).toHaveLength(128);
  });

  it('filters by search on name', () => {
    expect(filterEntries(state({ search: 'NUL' })).map((e) => e.code)).toEqual([0]);
    expect(filterEntries(state({ search: 'STX' })).map((e) => e.code)).toEqual([2]);
    expect(filterEntries(state({ search: 'ESC' })).map((e) => e.code)).toEqual([16, 27]);
  });

  it('matches search on printable characters', () => {
    const codes = filterEntries(state({ search: 'A' })).map((e) => e.code);
    expect(codes).toContain(65);
  });

  it('matches decimal, hex and binary forms', () => {
    expect(filterEntries(state({ search: '65' })).map((e) => e.code)).toContain(65);
    expect(filterEntries(state({ search: '0x41' })).map((e) => e.code)).toEqual([65]);
    expect(filterEntries(state({ search: '41' })).map((e) => e.code)).toContain(65);
    expect(filterEntries(state({ search: '01000001' })).map((e) => e.code)).toEqual([65]);
  });

  it('matches descriptions and is case-insensitive', () => {
    expect(filterEntries(state({ search: 'bell' })).map((e) => e.code)).toEqual([7]);
    expect(filterEntries(state({ search: 'nul' })).map((e) => e.code)).toEqual([0]);
  });

  it('returns empty for a nonsense query', () => {
    expect(filterEntries(state({ search: 'zzzz' }))).toEqual([]);
  });

  it('filters by category', () => {
    expect(filterEntries(state({ category: 'digit' })).map((e) => e.code)).toEqual([
      48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
    ]);
    expect(filterEntries(state({ category: 'uppercase' }))).toHaveLength(26);
    expect(filterEntries(state({ category: 'lowercase' }))).toHaveLength(26);
    expect(filterEntries(state({ category: 'control' }))).toHaveLength(33);
    expect(filterEntries(state({ category: 'punctuation' }))).toHaveLength(33);
  });

  it('combines category and search', () => {
    const result = filterEntries(state({ category: 'control', search: 'synchronous idle' }));
    expect(result.map((e) => e.code)).toEqual([22]);
  });
});

describe('state serialization', () => {
  it('serializes all state fields', () => {
    const serialized = serializeState(state({ search: 'A', view: 'grid', category: 'digit' }));
    const parsed = JSON.parse(serialized) as Record<string, unknown>;
    expect(parsed.search).toBe('A');
    expect(parsed.view).toBe('grid');
    expect(parsed.category).toBe('digit');
    expect(Array.isArray(parsed.history)).toBe(true);
  });

  it('round-trips valid state exactly', () => {
    const s = state({ search: 'LF', view: 'grid', category: 'control' });
    expect(roundTrips(s)).toBe(true);
  });

  it('rejects non-object payloads', () => {
    expect(deserializeState(null).success).toBe(false);
    expect(deserializeState([1, 2]).success).toBe(false);
    expect(deserializeState('nope').success).toBe(false);
  });

  it('repairs invalid fields with defaults', () => {
    const result = deserializeState({ view: 'bogus', category: 42, search: 5, history: 'x' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.view).toBe('table');
      expect(result.data.category).toBe('all');
      expect(result.data.search).toBe('');
      expect(result.data.history).toEqual([]);
    }
  });

  it('caps restored history at MAX_HISTORY', () => {
    const entries = Array.from({ length: MAX_HISTORY + 5 }, (_, i) => ({
      text: `entry-${i}`,
      createdAt: new Date(2026, 0, 1, 0, 0, i).toISOString(),
    }));
    const result = deserializeState({ history: entries });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.history).toHaveLength(MAX_HISTORY);
  });

  it('drops malformed history entries', () => {
    const result = deserializeState({
      history: [{ text: 'ok', createdAt: '2026-01-01T00:00:00Z' }, 'nope', { text: 5 }, null],
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.history).toHaveLength(1);
  });
});

describe('withHistory', () => {
  it('prepends entries, newest first, capped at MAX_HISTORY', () => {
    let s = state();
    for (let i = 0; i < MAX_HISTORY + 3; i++) {
      s = withHistory(s, `v${i}`, new Date(2026, 0, 1, 0, 0, i));
    }
    expect(s.history).toHaveLength(MAX_HISTORY);
    expect(s.history[0]?.text).toBe('v22');
  });

  it('round-trips after adding history', () => {
    const s = withHistory(state(), 'DEL (127)', new Date('2026-11-22T12:00:00Z'));
    expect(roundTrips(s)).toBe(true);
  });
});

describe('summaryText and isState', () => {
  it('summarizes visible count', () => {
    expect(summaryText(DEFAULT_STATE)).toBe('Table: 128 of 128 characters shown');
    expect(summaryText(state({ view: 'grid' }))).toBe('Grid: 128 of 128 characters shown');
    expect(summaryText(state({ category: 'digit' }))).toBe('Table: 10 of 128 characters shown');
  });

  it('validates state objects', () => {
    expect(isState(DEFAULT_STATE)).toBe(true);
    expect(isState({})).toBe(false);
    expect(isState(null)).toBe(false);
    expect(isState('x')).toBe(false);
  });
});

describe('tool definition', () => {
  it('exposes id, name and initial state from config', () => {
    expect(asciiTableTool.id).toBe('ascii-table-reference');
    expect(asciiTableTool.name).toBe('Ascii Table Reference');
    expect(asciiTableTool.initialState).toEqual(DEFAULT_STATE);
  });

  it('has four exporters', () => {
    expect(asciiTableTool.exporters).toHaveLength(4);
  });
});

describe('constants', () => {
  it('defines all views and categories', () => {
    expect(VIEWS.map((v) => v.value)).toEqual(['table', 'grid']);
    expect(CATEGORIES.map((c) => c.value)).toEqual([
      'all',
      'control',
      'punctuation',
      'digit',
      'uppercase',
      'lowercase',
    ]);
  });
});
