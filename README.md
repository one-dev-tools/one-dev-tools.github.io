# One Dev Tools

A collection of essential developer utilities that run entirely in your browser. No server, no tracking, no build step — open `index.html` and go.

> **A screenshot of the interface would be a useful addition here.** If you can drop one in as `screenshot.png`, add `![One Dev Tools](screenshot.png)` below this line.

---

## Tools

Tools are grouped into four categories in the sidebar.

### Encode / Decode

| Tool | What it does |
|------|-------------|
| **Base64** | Encode text to Base64 or decode Base64 back to text. Handles UTF-8. |
| **URL** | Encode text to URL-safe format or decode URL-encoded strings. |
| **JWT** | Decode JWT tokens — header, payload, and signature. Known claims (iss, sub, exp, iat…) show tooltips; timestamp fields render as human-readable dates. |

### Data Formats

| Tool | What it does |
|------|-------------|
| **JSON** | Format (prettify) or minify JSON with adjustable indent size. Includes an interactive tree visualiser with collapsible nodes and inline value editing. |
| **YAML** | Format and validate YAML with adjustable indent size. |
| **YAML ↔ JSON** | Convert YAML to JSON or JSON to YAML, with adjustable indent. |
| **XML** | Format (prettify) or minify XML with correct per-line indentation for text nodes. Validates structure on format. |
| **JSON ↔ CSV** | Convert a JSON array of objects to CSV, or a CSV file (with header row) to a JSON array. Auto-detects numeric values on CSV → JSON. |
| **SQL** | Format or minify SQL with keyword uppercasing and clause-per-line layout. Validates: unterminated strings, unbalanced parentheses, unclosed comments, invalid statement openers, SELECT without FROM, and missing commas in SELECT and ORDER BY lists. |

### Generate

| Tool | What it does |
|------|-------------|
| **UUID** | Generate UUIDs in v1 (time-based), v4 (random), v3 (name-based MD5), or v5 (name-based SHA-1). Outputs standard hyphenated and compact 32-char formats. Generate one or ten at a time. |
| **Hash** | Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from any input text. |
| **Timestamp** | Live current time in Unix seconds, Unix milliseconds, ISO 8601, and browser locale. Convert any Unix timestamp to multiple formats with relative time. Convert a date/time picker value to Unix timestamps. |

### Utility

| Tool | What it does |
|------|-------------|
| **Color** | Convert between HEX, RGB, and HSL. Visual color picker with live preview. Enter any format and get all three. |
| **Text Compare** | Line-by-line diff of two texts using LCS. Shows added/removed lines with gutter line numbers and ±N summary. Unchanged runs are collapsed with a separator. Identical texts render the full content in a unified view. |
| **String Case** | Converts text in any input format (spaces, hyphens, underscores, camelCase) to all eight case styles simultaneously: camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, lowercase, UPPERCASE, Title Case. |

---

## Running locally

```bash
git clone https://github.com/one-dev-tools/one-dev-tools.github.io.git
cd one-dev-tools.github.io
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

No build process, no dependencies to install.

## Deploying to GitHub Pages

1. Push to the `main` branch of a repository named `<username>.github.io`.
2. In repository **Settings → Pages**, set source to **main / (root)**.
3. The site will be live at `https://<username>.github.io` within a few minutes.

## Project structure

```
├── index.html   — markup and tool panels
├── styles.css   — layout, sidebar, typography, component styles
├── app.js       — all tool logic (no frameworks)
└── README.md
```

## Privacy

- All processing happens in your browser — no data is sent anywhere.
- No analytics, no cookies, no external requests except Google Fonts and two CDN libraries (js-yaml, CryptoJS).

## Dependencies

| Library | Used for |
|---------|----------|
| [js-yaml](https://github.com/nodeca/js-yaml) | YAML parsing and serialisation |
| [CryptoJS](https://github.com/brix/crypto-js) | MD5, SHA-1, SHA-256, SHA-512 hashing |

Everything else is vanilla HTML, CSS, and JavaScript.

## Browser support

Requires a modern browser with `crypto.subtle` and `crypto.randomUUID` support.

- Chrome / Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT
