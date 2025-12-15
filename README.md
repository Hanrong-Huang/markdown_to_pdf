# MarkFlow — Markdown to PDF

A sleek, browser-based markdown editor with real-time PDF preview and high-resolution export.

**[Live Demo](https://hanrong-huang.github.io/markdown_to_pdf/)**

## Features

- **Live Preview** — See rendered markdown instantly as you type
- **Page Break Indicators** — Visual guides showing where pages will split in PDF
- **High-DPI Export** — 384 DPI PDF output for crisp, print-ready documents
- **Formatting Toolbar** — Quick buttons for headings, bold, italic, lists, code, tables, and more
- **Keyboard Shortcuts** — Ctrl+B (bold), Ctrl+I (italic), Ctrl+K (link), Ctrl+S (export)
- **File Upload** — Import existing `.md` files
- **Dark Theme** — Easy on the eyes with amber accents

## Usage

1. Visit the [live demo](https://hanrong-huang.github.io/markdown_to_pdf/)
2. Write or paste markdown in the left panel
3. Preview renders in real-time on the right
4. Click **Download PDF** to export

## Run Locally

```bash
git clone https://github.com/Hanrong-Huang/markdown_to_pdf.git
cd markdown_to_pdf
# Open index.html in your browser
```

No build step required — it's a single HTML file with embedded CSS and JavaScript.

## Tech Stack

- [Marked.js](https://marked.js.org/) — Markdown parsing
- [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/) — PDF generation
- Vanilla JavaScript, CSS3

## License

MIT
