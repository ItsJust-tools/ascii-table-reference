import type { Tool, DeserializeResult } from '@itsjust/core';
import toolConfig from './tool.config';
import {
  DEFAULT_STATE,
  MAX_HISTORY,
  summaryText,
  type AsciiView,
  type CategoryFilter,
  type HistoryEntry,
  type ToolState,
} from './types';

const VALID_VIEWS: AsciiView[] = ['table', 'grid'];
const VALID_CATEGORIES: CategoryFilter[] = [
  'all',
  'control',
  'punctuation',
  'digit',
  'uppercase',
  'lowercase',
];

/** Serialize tool state into a compact JSON string for share/import. */
export function serializeState(state: ToolState): string {
  return JSON.stringify({
    search: state.search,
    view: state.view,
    category: state.category,
    history: state.history,
  });
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function validHistory(value: unknown): HistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (entry): entry is HistoryEntry =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as HistoryEntry).text === 'string' &&
        typeof (entry as HistoryEntry).createdAt === 'string'
    )
    .slice(0, MAX_HISTORY);
}

/** Validate and recover tool state from an arbitrary payload. */
export function deserializeState(data: unknown): DeserializeResult<ToolState> {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return {
      success: false,
      error: 'Invalid data format: expected ascii table state object',
    };
  }
  const v = data as Record<string, unknown>;
  const view: AsciiView = VALID_VIEWS.includes(v.view as AsciiView)
    ? (v.view as AsciiView)
    : DEFAULT_STATE.view;
  const category: CategoryFilter = VALID_CATEGORIES.includes(v.category as CategoryFilter)
    ? (v.category as CategoryFilter)
    : DEFAULT_STATE.category;
  const state: ToolState = {
    search: stringOr(v.search, DEFAULT_STATE.search),
    view,
    category,
    history: validHistory(v.history),
  };
  return { success: true, data: state };
}

/** Append a history entry to state, capped at MAX_HISTORY, newest first. */
export function withHistory(state: ToolState, text: string, now = new Date()): ToolState {
  const entry: HistoryEntry = { text, createdAt: now.toISOString() };
  return { ...state, history: [entry, ...state.history].slice(0, MAX_HISTORY) };
}

/** True when a serialized string round-trips back to the same state. */
export function roundTrips(state: ToolState): boolean {
  try {
    const restored = deserializeState(JSON.parse(serializeState(state)));
    return restored.success && JSON.stringify(restored.data) === JSON.stringify(state);
  } catch {
    return false;
  }
}

export const asciiTableTool: Tool<ToolState> = {
  id: toolConfig.id,
  name: toolConfig.name,
  version: toolConfig.version,
  config: toolConfig,
  initialState: { ...DEFAULT_STATE },
  serialize: serializeState,
  deserialize: deserializeState,
  exporters: [
    { format: 'png', loader: () => import('./exporters/png') },
    { format: 'jpeg', loader: () => import('./exporters/jpeg') },
    { format: 'webp', loader: () => import('./exporters/webp') },
    { format: 'pdf', loader: () => import('./exporters/pdf') },
  ],
};

export { summaryText };
