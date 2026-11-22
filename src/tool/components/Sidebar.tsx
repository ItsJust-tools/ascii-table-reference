'use client';

import React from 'react';
import { CATEGORIES, VIEWS, type ToolState } from '../types';

interface SidebarProps {
  state: ToolState;
  onChange: (next: ToolState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ state, onChange }) => {
  return (
    <div className="p-4 space-y-6 text-sm overflow-y-auto h-full" data-testid="ascii-sidebar">
      <div>
        <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">View</h3>
        <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
          {VIEWS.map((view) => (
            <li key={view.value} className="flex justify-between gap-2">
              <span>{view.label}</span>
              <span className="text-gray-500 dark:text-gray-400">{view.hint}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Categories</h3>
        <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
          {CATEGORIES.filter((c) => c.value !== 'all').map((cat) => (
            <li key={cat.value}>
              <button
                type="button"
                data-testid={`sidebar-category-${cat.value}`}
                onClick={() => onChange({ ...state, category: cat.value })}
                className={`rounded px-2 py-0.5 ${
                  state.category === cat.value
                    ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-100'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {cat.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Saved copies</h3>
        <p className="text-xs text-gray-600 dark:text-gray-300" data-testid="sidebar-history-count">
          {state.history.length} entr{state.history.length === 1 ? 'y' : 'ies'} in history
          {state.history.length > 0 ? ' (newest first)' : ''}
        </p>
      </div>

      <div>
        <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Keyboard shortcuts</h3>
        <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
          <li>
            <kbd>/</kbd> — focus search
          </li>
          <li>
            <kbd>V</kbd> — toggle table/grid view
          </li>
          <li>
            <kbd>C</kbd> — copy summary
          </li>
        </ul>
      </div>

      <div>
        <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Share</h3>
        <p className="text-xs text-gray-600 dark:text-gray-300">
          Use the toolbar share button to create a URL containing the current filter state; open it
          to restore this view.
        </p>
      </div>
    </div>
  );
};
