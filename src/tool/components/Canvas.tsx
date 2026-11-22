'use client';

import React from 'react';
import { filterEntries, toBinary, toHex, toOctal, type AsciiEntry, type ToolState } from '../types';

interface CanvasProps {
  state: ToolState;
  onChange?: (state: ToolState) => void;
  onSaveHistory?: (text: string) => void;
}

function CopyButton({ value, testid }: { value: string; testid?: string }) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable; ignore
    }
  }, [value]);
  return (
    <button
      type="button"
      onClick={handleCopy}
      data-testid={testid}
      className="text-xs px-2 py-0.5 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Copy value"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

const thClass =
  'px-2 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400';
const tdClass = 'px-2 py-1.5 text-xs font-mono text-gray-700 dark:text-gray-300';

function DetailRow({
  entry,
  onSaveHistory,
}: {
  entry: AsciiEntry;
  onSaveHistory?: (text: string) => void;
}) {
  return (
    <tr
      data-testid={`ascii-row-${entry.code}`}
      className="border-t border-gray-100 dark:border-gray-800"
    >
      <td className={tdClass}>{entry.code}</td>
      <td className={tdClass}>{toHex(entry.code)}</td>
      <td className={tdClass}>{toOctal(entry.code)}</td>
      <td className={tdClass}>{toBinary(entry.code)}</td>
      <td className={`${tdClass} font-bold text-gray-900 dark:text-gray-100`}>{entry.char}</td>
      <td className="px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400">{entry.description}</td>
      <td className="px-2 py-1.5">
        <div className="flex gap-1">
          <CopyButton value={entry.char} testid={`copy-char-${entry.code}`} />
          <CopyButton value={String(entry.code)} testid={`copy-code-${entry.code}`} />
        </div>
      </td>
      <td className="px-2 py-1.5">
        <button
          type="button"
          data-testid={`save-${entry.code}`}
          onClick={() => onSaveHistory?.(`${entry.name} (${entry.code})`)}
          className="text-xs px-2 py-0.5 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Save to history"
        >
          Save
        </button>
      </td>
    </tr>
  );
}

function TableView({
  entries,
  onSaveHistory,
}: {
  entries: AsciiEntry[];
  onSaveHistory?: (text: string) => void;
}) {
  return (
    <div
      className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800"
      data-testid="ascii-table"
    >
      <table className="w-full min-w-[640px] border-collapse">
        <thead className="bg-gray-50 dark:bg-gray-900/60">
          <tr>
            <th className={thClass}>Dec</th>
            <th className={thClass}>Hex</th>
            <th className={thClass}>Octal</th>
            <th className={thClass}>Binary</th>
            <th className={thClass}>Char</th>
            <th className={thClass}>Description</th>
            <th className={thClass}>Copy</th>
            <th className={thClass}>Save</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <DetailRow key={entry.code} entry={entry} onSaveHistory={onSaveHistory} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GridView({ entries }: { entries: AsciiEntry[] }) {
  return (
    <div className="grid grid-cols-8 gap-1 sm:grid-cols-16" data-testid="ascii-grid">
      {entries.map((entry) => (
        <div
          key={entry.code}
          data-testid={`grid-cell-${entry.code}`}
          title={`${entry.name} — dec ${entry.code}, ${toHex(entry.code)}, ${toBinary(entry.code)}`}
          className="flex flex-col items-center rounded border border-gray-200 bg-white p-1 text-center dark:border-gray-800 dark:bg-gray-900"
        >
          <span className="font-mono text-sm font-bold text-gray-900 dark:text-gray-100">
            {entry.char}
          </span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">{entry.code}</span>
        </div>
      ))}
    </div>
  );
}

export const Canvas: React.FC<CanvasProps> = ({ state, onChange, onSaveHistory }) => {
  const entries = React.useMemo(() => filterEntries(state), [state]);

  return (
    <div className="p-4 space-y-6 overflow-y-auto h-full" data-testid="ascii-canvas">
      <div
        className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900"
        data-testid="result-card"
        role="status"
      >
        <span className="mb-1 block text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Showing
        </span>
        <span
          className="block font-mono text-3xl font-bold"
          data-testid="result-main"
          data-count={entries.length}
        >
          {entries.length}
        </span>
        <span
          className="mt-2 block text-xs text-gray-600 dark:text-gray-300"
          data-testid="result-summary"
        >
          {entries.length} of 128 ASCII characters
          {state.search ? ` matching “${state.search}”` : ''}
          {state.category !== 'all' ? ` in ${state.category}` : ''}
        </span>
      </div>

      {entries.length === 0 ? (
        <p
          className="text-center text-sm text-gray-500 dark:text-gray-400"
          data-testid="empty-state"
        >
          No characters match your filter. Reset the search to see all 128.
        </p>
      ) : state.view === 'table' ? (
        <TableView entries={entries} onSaveHistory={onSaveHistory} />
      ) : (
        <GridView entries={entries} />
      )}

      <div>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          History
        </h3>
        {state.history.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400" data-testid="history-empty">
            No saved copies yet.
          </p>
        ) : (
          <ul className="space-y-1" data-testid="history-list">
            {state.history.map((entry, i) => (
              <li
                key={`${entry.createdAt}-${i}`}
                className="flex items-center justify-between gap-2 rounded-md border border-gray-200 px-3 py-1.5 text-xs dark:border-gray-800"
              >
                <span className="text-gray-700 dark:text-gray-300">{entry.text}</span>
                <CopyButton value={entry.text} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-center text-xs text-gray-500 dark:text-gray-400">
        All lookups run locally in your browser; nothing is uploaded.
        {onChange ? '' : ''}
      </p>
    </div>
  );
};
