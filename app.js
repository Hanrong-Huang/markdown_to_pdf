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
> Page break is shown in dashed line.

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
      headerIds: false,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: false
    });
  }, []);

  // Convert markdown to HTML
  const htmlContent = marked.parse(markdown);

  // Generate PDF
  const generatePdf = async () => {
    if (!pdfRef.current) return;

    try {
      // Get the prose element directly
      const proseElement = pdfRef.current.querySelector('.prose');

      // Store original padding
      const originalPadding = proseElement.style.padding;

      // Temporarily set padding to 0 so we can use html2pdf margins
      proseElement.style.padding = '0';
      proseElement.style.paddingLeft = '20mm';
      proseElement.style.paddingRight = '20mm';

      const options = {
        margin: [20, 0, 20, 0], // Top and bottom margins in mm (left/right handled by padding)
        filename: `${filename || 'document'}.pdf`,
        image: {
          type: 'jpeg',
          quality: 0.98
        },
        html2canvas: {
          scale: 2, // Standard quality
          useCORS: true,
          letterRendering: true,
          backgroundColor: '#faf9f5',
          logging: false,
          windowWidth: 794, // 210mm at 96dpi
          windowHeight: 1123, // 297mm at 96dpi
          x: 0,
          y: 0,
          scrollX: 0,
          scrollY: 0
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true
        },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy'],
          before: '.page-break-before',
          after: '.page-break-after',
          avoid: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'table', 'pre', 'blockquote']
        }
      };

      // Generate PDF and add cream background to margins
      const worker = html2pdf()
        .set(options)
        .from(proseElement)
        .toPdf()
        .get('pdf')
        .then((pdf) => {
          const totalPages = pdf.internal.getNumberOfPages();

          // Add cream background to margins on all pages
          for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);

            // Set cream color (RGB for #faf9f5)
            pdf.setFillColor(250, 249, 245);

            // Fill margin areas with cream
            // Top margin
            pdf.rect(0, 0, 210, 20, 'F');
            // Bottom margin
            pdf.rect(0, 277, 210, 20, 'F');
            // Left margin (from top to bottom)
            pdf.rect(0, 0, 0, 297, 'F'); // 0 width, but we'll use left/right padding
            // Right margin (from top to bottom)
            pdf.rect(210, 0, 0, 297, 'F'); // 0 width, but we'll use left/right padding
          }

          return pdf;
        });

      const pdf = await worker;
      pdf.save(`${filename || 'document'}.pdf`);

      // Restore original padding
      proseElement.style.padding = originalPadding;
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('PDF generation failed. Please try again.');

      // Restore padding on error
      const proseElement = pdfRef.current?.querySelector('.prose');
      if (proseElement) {
        proseElement.style.padding = '20mm';
      }
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
            className: 'w-48 px-3 py-2 rounded-md font-medium',
            style: {
              backgroundColor: '#faf9f5',
              color: '#141413',
              border: '1.5px solid #e8e6dc',
              fontFamily: 'Poppins, Arial, sans-serif',
              outline: 'none'
            },
            placeholder: 'Filename',
            onFocus: (e) => e.target.style.borderColor = '#d97757',
            onBlur: (e) => e.target.style.borderColor = '#e8e6dc'
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
            className: 'px-4 py-2 rounded-md font-medium transition-all',
            style: {
              backgroundColor: '#faf9f5',
              color: '#141413',
              border: '1.5px solid #e8e6dc',
              fontFamily: 'Poppins, Arial, sans-serif'
            },
            onMouseEnter: (e) => e.target.style.borderColor = '#d97757',
            onMouseLeave: (e) => e.target.style.borderColor = '#e8e6dc'
          }, '↑ Upload'),
          React.createElement('button', {
            onClick: downloadMarkdown,
            className: 'px-4 py-2 rounded-md font-medium transition-all',
            style: {
              backgroundColor: '#faf9f5',
              color: '#141413',
              border: '1.5px solid #e8e6dc',
              fontFamily: 'Poppins, Arial, sans-serif'
            },
            onMouseEnter: (e) => e.target.style.borderColor = '#d97757',
            onMouseLeave: (e) => e.target.style.borderColor = '#e8e6dc'
          }, '↓ .md'),
          React.createElement('button', {
            onClick: generatePdf,
            className: 'px-5 py-2 rounded-md font-medium transition-all',
            style: {
              backgroundColor: '#d97757',
              color: '#faf9f5',
              border: 'none',
              fontFamily: 'Poppins, Arial, sans-serif',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            },
            onMouseEnter: (e) => e.target.style.backgroundColor = '#c86847',
            onMouseLeave: (e) => e.target.style.backgroundColor = '#d97757'
          }, '↓ .pdf')
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
            style: {
              backgroundColor: '#faf9f5',
              width: '210mm',
              minHeight: '297mm',
              boxSizing: 'border-box'
            }
          },
            React.createElement('div', {
              className: 'prose',
              style: {
                fontFamily: 'Lora, Georgia, serif',
                padding: '20mm',
                backgroundColor: '#faf9f5',
                minHeight: '257mm',
                boxSizing: 'border-box'
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
