// Default markdown content
const defaultMarkdown = `# Markdown to PDF Editor

Welcome to the **Markdown to PDF Editor**! This tool allows you to write markdown and instantly preview it as a PDF.

## Features

- Live markdown preview
- PDF export with custom styling
- Support for tables, code blocks, and more

## Task List

- [ ] Incomplete task
- [x] Completed task

## Tables

| Name | Role | Location |
|------|------|----------|
| Alice | Developer | San Francisco |
| Bob | Designer | New York |
| Charlie | Manager | London |

## Code

Inline code: \`const greeting = "Hello"\`

Code block:
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Blockquotes

> This is a blockquote.
> It can span multiple lines.

## Links

[Visit Anthropic](https://www.anthropic.com)

---

*Happy writing!*
`;

// Main App Component
function MarkdownPdfEditor() {
  const [markdown, setMarkdown] = React.useState(defaultMarkdown);
  const [filename, setFilename] = React.useState('document');
  const pdfRef = React.useRef(null);
  const fileInputRef = React.useRef(null);

  // Configure marked options
  React.useEffect(() => {
    marked.setOptions({
      breaks: true,
      gfm: true,
      tables: true,
      headerIds: false
    });
  }, []);

  // Convert markdown to HTML
  const htmlContent = marked.parse(markdown);

  // Generate PDF
  const generatePdf = async () => {
    if (!pdfRef.current) return;

    try {
      const element = pdfRef.current;
      const options = {
        margin: 0,
        filename: `${filename || 'document'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          backgroundColor: '#faf9f5'
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy'],
          before: '.page-break-before',
          after: '.page-break-after'
        }
      };

      await html2pdf().set(options).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('PDF generation failed. Please try again.');
    }
  };

  // Upload markdown file
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setMarkdown(e.target.result);
      setFilename(file.name.replace(/\.[^/.]+$/, ''));
    };
    reader.readAsText(file);
  };

  // Download markdown file
  const downloadMarkdown = () => {
    try {
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename || 'document'}.md`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Error downloading markdown:', error);
      alert('Download failed. Please try again.');
    }
  };

  return React.createElement('div', {
    className: 'min-h-screen flex flex-col',
    style: { backgroundColor: '#faf9f5' }
  },
    // Header
    React.createElement('header', {
      className: 'border-b px-6 py-4',
      style: { backgroundColor: '#faf9f5', borderBottomColor: '#e8e6dc' }
    },
      React.createElement('div', { className: 'flex items-center justify-between max-w-[1800px] mx-auto' },
        React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement('svg', {
            className: 'w-6 h-6',
            style: { color: '#d97757' },
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
          },
            React.createElement('path', {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeWidth: 2,
              d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
            })
          ),
          React.createElement('h1', {
            className: 'text-2xl font-bold',
            style: { color: '#141413', fontFamily: 'Poppins, Arial, sans-serif' }
          }, 'Markdown to PDF')
        ),
        React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement('input', {
            type: 'text',
            value: filename,
            onChange: (e) => setFilename(e.target.value),
            className: 'w-48 border px-3 py-2 rounded',
            style: { backgroundColor: '#faf9f5', color: '#141413', borderColor: '#b0aea5' },
            placeholder: 'Filename'
          }),
          React.createElement('input', {
            ref: fileInputRef,
            type: 'file',
            accept: '.md,.markdown,.txt',
            onChange: handleFileUpload,
            className: 'hidden'
          }),
          React.createElement('button', {
            onClick: () => fileInputRef.current?.click(),
            className: 'gap-2 px-4 py-2 border rounded hover:bg-gray-50',
            style: { backgroundColor: '#faf9f5', color: '#788c5d', borderColor: '#788c5d' }
          }, '📤 Upload'),
          React.createElement('button', {
            onClick: downloadMarkdown,
            className: 'gap-2 px-4 py-2 border rounded hover:bg-gray-50',
            style: { backgroundColor: '#faf9f5', color: '#6a9bcc', borderColor: '#6a9bcc' }
          }, '💾 .md'),
          React.createElement('button', {
            onClick: generatePdf,
            className: 'gap-2 px-4 py-2 rounded text-white',
            style: { backgroundColor: '#d97757', color: '#faf9f5' }
          }, '📄 .pdf')
        )
      )
    ),
    // Main Content
    React.createElement('div', { className: 'flex-1 flex overflow-hidden' },
      // Markdown Input
      React.createElement('div', {
        className: 'w-1/2 border-r flex flex-col',
        style: { backgroundColor: '#faf9f5', borderRightColor: '#e8e6dc' }
      },
        React.createElement('div', {
          className: 'px-6 py-3 border-b',
          style: { backgroundColor: '#faf9f5', borderBottomColor: '#e8e6dc' }
        },
          React.createElement('h2', {
            className: 'text-lg font-semibold',
            style: { color: '#141413', fontFamily: 'Poppins, Arial, sans-serif' }
          }, 'Markdown Input')
        ),
        React.createElement('textarea', {
          value: markdown,
          onChange: (e) => setMarkdown(e.target.value),
          className: 'flex-1 p-6 resize-none focus:outline-none font-mono text-sm',
          style: { backgroundColor: '#faf9f5', color: '#141413', caretColor: '#d97757' },
          placeholder: 'Type your markdown here...'
        })
      ),
      // PDF Preview
      React.createElement('div', {
        className: 'w-1/2 flex flex-col',
        style: { backgroundColor: '#e8e6dc' }
      },
        React.createElement('div', {
          className: 'px-6 py-3 border-b',
          style: { backgroundColor: '#faf9f5', borderBottomColor: '#b0aea5' }
        },
          React.createElement('h2', {
            className: 'text-lg font-semibold',
            style: { color: '#141413', fontFamily: 'Poppins, Arial, sans-serif' }
          }, 'PDF Preview')
        ),
        React.createElement('div', { className: 'flex-1 overflow-auto p-6' },
          React.createElement('div', {
            ref: pdfRef,
            className: 'mx-auto shadow-lg',
            style: { backgroundColor: '#faf9f5', width: '210mm', minHeight: '297mm' }
          },
            React.createElement('div', {
              className: 'prose',
              style: {
                fontFamily: 'Lora, Georgia, serif',
                padding: '20mm',
                backgroundColor: '#faf9f5',
                minHeight: '257mm'
              },
              dangerouslySetInnerHTML: { __html: htmlContent }
            })
          )
        )
      )
    )
  );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  React.createElement(React.StrictMode, null,
    React.createElement(MarkdownPdfEditor)
  )
);
