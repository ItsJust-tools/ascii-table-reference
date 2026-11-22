'use client';

import React from 'react';
import { CATEGORIES, VIEWS, type CategoryFilter, type ToolState } from '../types';

interface ToolbarProps {
  state: ToolState;
  onChange: (next: ToolState) => void;
  onClear: () => void;
  onCopy?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ state, onChange, onClear, onCopy }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      <div
        className="flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Ascii table controls"
      >
        <input
          type="search"
          value={state.search}
          onChange={(e) => onChange({ ...state, search: e.target.value })}
          placeholder="Search name, code, hex…"
          aria-label="Search ASCII characters"
          data-testid="search-input"
          className="w-56 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
        <div className="flex gap-1" role="group" aria-label="View mode">
          {VIEWS.map((view) => (
            <button
              key={view.value}
              type="button"
              aria-pressed={state.view === view.value}
              data-testid={`view-${view.value}`}
              onClick={() => onChange({ ...state, view: view.value })}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
                state.view === view.value
                  ? 'border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-900/40 dark:text-violet-100'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
        <select
          value={state.category}
          onChange={(e) => onChange({ ...state, category: e.target.value as CategoryFilter })}
          aria-label="Filter by category"
          data-testid="category-select"
          className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        {onCopy ? (
          <button
            type="button"
            onClick={onCopy}
            data-testid="btn-copy-result"
            className="rounded-md bg-violet-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-violet-600"
          >
            Copy summary
          </button>
        ) : null}
        <button
          type="button"
          onClick={onClear}
          data-testid="btn-clear"
          className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Reset
        </button>
        {state.history.length > 0 ? (
          <button
            type="button"
            onClick={() => onChange({ ...state, history: [] })}
            data-testid="btn-clear-history"
            className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Clear history
          </button>
        ) : null}
      </div>
    </div>
  );
};
