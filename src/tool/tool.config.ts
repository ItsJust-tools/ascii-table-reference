const toolConfig = {
  id: 'ascii-table-reference',
  name: 'Ascii Table Reference',
  version: '1.0.0',
  description:
    'Interactive ASCII table reference with search, decimal/hex/octal/binary columns, control-character names and click-to-copy.',
  exportFormats: ['png', 'jpeg', 'webp', 'pdf'],
  features: {
    export: true,
    autoSave: true,
    undoRedo: false,
    sidebar: true,
    statusBar: true,
    darkMode: true,
  },
  theme: { brand: 'Ascii Table Reference', icon: '🔤' },
  shortcuts: [
    {
      title: 'Ascii Table',
      shortcuts: [
        { keys: '/', label: 'Focus search', description: 'Jump to the search box' },
        { keys: 'V', label: 'Toggle view', description: 'Switch between table and grid' },
        { keys: 'C', label: 'Copy summary', description: 'Copy the current view summary' },
      ],
    },
  ],
} satisfies import('@itsjust/core').ToolConfig;

export default toolConfig;
export { toolConfig };
