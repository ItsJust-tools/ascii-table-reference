# Ascii Table Reference

Interactive ASCII table (0–127) with decimal, hex, octal and binary columns, control-character mnemonics, and one-click copy. A practical developer reference for encoding and protocol work.

**Live:** [ascii-table-reference.itsjust.tools](https://ascii-table-reference.itsjust.tools)

## Features

- Full 0–127 table with decimal, hex (`0x41`), octal (`0o101`) and binary (`0b01000001`) columns
- Control-character mnemonics (NUL, LF, CR, ESC, DEL…) with short descriptions
- Search across names, characters, descriptions and every number-base representation
- Category filter: controls, punctuation, digits, uppercase, lowercase
- Table view for detail or compact grid view
- Click-to-copy the character or its decimal code; save copies to history
- Shareable state via URL, `.itsjust.json` import/export and image/PDF export
- 100% client-side — no data ever leaves your browser

## Keyboard shortcuts

| Key | Action            |
| --- | ----------------- |
| `/` | Focus search      |
| `V` | Toggle table/grid |
| `C` | Copy summary      |

## Development

```bash
npm install
npm run build -w @itsjust/core   # build shared core first
npm run dev
npm test
```

## Deployment

```bash
docker build -t itsjust-ascii-table-reference .
docker run -p 3000:3000 itsjust-ascii-table-reference
```

## License

MIT
