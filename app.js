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

[Visit Project Directory](https://github.com/Hanrong-Huang/markdown_to_pdf) **Happy writing!**
#
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
      const wrapperElement = pdfRef.current;
      
      // Check for required libraries
      if (!window.html2canvas) {
        throw new Error('html2canvas library not loaded');
      }
      if (!window.jspdf || !window.jspdf.jsPDF) {
        throw new Error('jsPDF library not loaded');
      }

      const html2canvasOptions = {
        scale: 3,
        useCORS: true,
        letterRendering: true,
        backgroundColor: '#faf9f5',
        logging: false,
        width: wrapperElement.scrollWidth,
        height: wrapperElement.scrollHeight,
        windowWidth: wrapperElement.scrollWidth,
        windowHeight: wrapperElement.scrollHeight,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        onclone: (clonedDoc) => {
          // Ensure code elements are properly rendered
          const codes = clonedDoc.querySelectorAll('code');
          codes.forEach(code => {
            if (!code.closest('pre')) {
              // Inline code: Force all styles explicitly for html2canvas
              code.style.setProperty('display', 'inline-block', 'important');
              code.style.setProperty('background-color', '#e8e6dc', 'important');
              code.style.setProperty('color', '#141413', 'important');
              code.style.setProperty('padding', '4.8px 9.6px', 'important');
              code.style.setProperty('border-radius', '4.8px', 'important');
              code.style.setProperty('font-size', '14px', 'important');
              code.style.setProperty('font-family', "'Courier New', monospace", 'important');
              code.style.setProperty('vertical-align', 'baseline', 'important');
              code.style.setProperty('line-height', '1.5', 'important');
              code.style.setProperty('white-space', 'nowrap', 'important');
              code.style.setProperty('margin', '0 1.6px', 'important');
              code.style.setProperty('box-sizing', 'border-box', 'important');
              code.style.setProperty('position', 'relative', 'important');
              code.style.setProperty('top', '0.15em', 'important');
            }
          });
          
          // Ensure pre code blocks have correct styling
          const pres = clonedDoc.querySelectorAll('pre');
          pres.forEach(pre => {
            pre.style.setProperty('background-color', '#141413', 'important');
            pre.style.setProperty('color', '#faf9f5', 'important');
            const preCode = pre.querySelector('code');
            if (preCode) {
              preCode.style.setProperty('color', '#faf9f5', 'important');
              preCode.style.setProperty('background-color', 'transparent', 'important');
            }
          });
        }
      };

      // Small delay to ensure styles are computed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await window.html2canvas(wrapperElement, html2canvasOptions);

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginVertical = 15; // 1.5cm margins
      const marginHorizontal = 15;
      const contentWidth = pageWidth - marginHorizontal * 2;
      const contentHeight = pageHeight - marginVertical * 2;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      // Convert canvas pixels to mm based on content width
      const pxToMm = contentWidth / (canvasWidth / 3); // scale 3
      const segmentHeightPx = (contentHeight / pxToMm) * 3; // Convert back to canvas pixels

      let renderedHeight = 0;
      let pageIndex = 0;

      while (renderedHeight < canvasHeight) {
        const remainingHeight = canvasHeight - renderedHeight;
        const currentSegmentHeight = Math.min(segmentHeightPx, remainingHeight);

        // Create a canvas for this page segment
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvasWidth;
        pageCanvas.height = currentSegmentHeight;

        const pageContext = pageCanvas.getContext('2d');
        
        // Fill with cream background
        pageContext.fillStyle = '#faf9f5';
        pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        
        // Draw the content segment
        pageContext.drawImage(
          canvas,
          0,
          renderedHeight,
          canvasWidth,
          currentSegmentHeight,
          0,
          0,
          canvasWidth,
          currentSegmentHeight
        );

        const imageData = pageCanvas.toDataURL('image/jpeg', 0.98);
        const imageHeightMm = (currentSegmentHeight / 3) * pxToMm;

        if (pageIndex > 0) {
          pdf.addPage();
        }

        // Fill entire page with cream background
        pdf.setFillColor(250, 249, 245);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');

        // Calculate top margin: first page has padding (57px ≈ 15mm) baked into content,
        // so we reduce margin to compensate. Subsequent pages use full margin.
        // 57px at 96dpi ≈ 15mm
        const topMargin = pageIndex === 0 
          ? marginVertical - 15 // Reduce by 15mm since padding is baked in
          : marginVertical; // Full margin for subsequent pages

        // Add the content image with margins
        pdf.addImage(
          imageData,
          'JPEG',
          marginHorizontal,
          topMargin,
          contentWidth,
          imageHeightMm,
          undefined,
          'FAST'
        );

        renderedHeight += currentSegmentHeight;
        pageIndex++;
      }

      pdf.save(`${filename || 'document'}.pdf`);
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

  // Insert markdown template at cursor position
  const insertMarkdown = (template) => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);

    // Replace placeholder with selected text if any
    let newTemplate = template.replace(/{text}/g, selectedText || 'text');

    const newMarkdown = markdown.substring(0, start) + newTemplate + markdown.substring(end);
    setMarkdown(newMarkdown);

    // Restore cursor position and focus
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + newTemplate.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
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
        // Markdown Toolbar - Morandi Style
        React.createElement('div', {
          className: 'px-6 py-3 border-b',
          style: { backgroundColor: 'var(--bg-cream)', borderBottomColor: 'var(--border-gray)' }
        },
          React.createElement('div', { className: 'flex items-center gap-1' },
            React.createElement('span', {
              className: 'text-xs font-semibold mr-3',
              style: { color: 'var(--text-dark)', fontFamily: 'Poppins, Arial, sans-serif' }
            }, 'QUICK INSERT'),

            // Text Formatting - Blue
            React.createElement('button', {
              onClick: () => insertMarkdown('**{text}**'),
              className: 'toolbar-btn btn-primary',
              title: 'Bold'
            }, 'B'),
            React.createElement('button', {
              onClick: () => insertMarkdown('*{text}*'),
              className: 'toolbar-btn btn-primary',
              title: 'Italic'
            }, 'I'),
            React.createElement('button', {
              onClick: () => insertMarkdown('`{text}`'),
              className: 'toolbar-btn btn-primary',
              title: 'Inline Code'
            }, '`'),

            // Separator
            React.createElement('span', {
              className: 'mx-1',
              style: { color: 'var(--border-gray)', fontSize: '12px' }
            }, '|'),

            // Headers - Olive
            React.createElement('button', {
              onClick: () => insertMarkdown('# {text}'),
              className: 'toolbar-btn btn-secondary',
              title: 'Heading 1'
            }, 'H1'),
            React.createElement('button', {
              onClick: () => insertMarkdown('## {text}'),
              className: 'toolbar-btn btn-secondary',
              title: 'Heading 2'
            }, 'H2'),
            React.createElement('button', {
              onClick: () => insertMarkdown('### {text}'),
              className: 'toolbar-btn btn-secondary',
              title: 'Heading 3'
            }, 'H3'),

            // Separator
            React.createElement('span', {
              className: 'mx-1',
              style: { color: 'var(--border-gray)', fontSize: '12px' }
            }, '|'),

            // Lists - Coral
            React.createElement('button', {
              onClick: () => insertMarkdown('- {text}\n- \n- '),
              className: 'toolbar-btn btn-accent',
              title: 'Bullet List'
            }, '•'),
            React.createElement('button', {
              onClick: () => insertMarkdown('1. {text}\n2. \n3. '),
              className: 'toolbar-btn btn-accent',
              title: 'Numbered List'
            }, '1.'),
            React.createElement('button', {
              onClick: () => insertMarkdown('- [ ] {text}\n- [x] Completed task\n- [ ] '),
              className: 'toolbar-btn btn-accent',
              title: 'Task List'
            }, '☑'),

            // Separator
            React.createElement('span', {
              className: 'mx-1',
              style: { color: 'var(--border-gray)', fontSize: '12px' }
            }, '|'),

            // Blocks - Blue
            React.createElement('button', {
              onClick: () => insertMarkdown('```\n{text}\n```'),
              className: 'toolbar-btn btn-primary',
              title: 'Code Block'
            }, '</>'),
            React.createElement('button', {
              onClick: () => insertMarkdown('> {text}\n> '),
              className: 'toolbar-btn btn-primary',
              title: 'Quote'
            }, '>'),

            // Separator
            React.createElement('span', {
              className: 'mx-1',
              style: { color: 'var(--border-gray)', fontSize: '12px' }
            }, '|'),

            // Structure - Olive
            React.createElement('button', {
              onClick: () => insertMarkdown('---'),
              className: 'toolbar-btn btn-secondary',
              title: 'Horizontal Rule'
            }, '—'),
            React.createElement('button', {
              onClick: () => insertMarkdown('<div class="page-break-after"></div>'),
              className: 'toolbar-btn btn-secondary',
              title: 'Page Break'
            }, '📄'),

            // Separator
            React.createElement('span', {
              className: 'mx-1',
              style: { color: 'var(--border-gray)', fontSize: '12px' }
            }, '|'),

            // Insert - Coral
            React.createElement('button', {
              onClick: () => insertMarkdown('| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Data 1   | Data 2   | Data 3   |\n| Data 4   | Data 5   | Data 6   |'),
              className: 'toolbar-btn btn-accent',
              title: 'Table'
            }, '⊞'),
            React.createElement('button', {
              onClick: () => insertMarkdown('[{text}](https://example.com)'),
              className: 'toolbar-btn btn-accent',
              title: 'Link'
            }, '🔗'),
            React.createElement('button', {
              onClick: () => insertMarkdown('![{text}](https://example.com/image.jpg)'),
              className: 'toolbar-btn btn-accent',
              title: 'Image'
            }, '🖼️')
          )
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
            className: 'mx-auto shadow-lg pdf-wrapper',
            style: {
              backgroundColor: '#faf9f5',
              width: '794px', // Fixed pixel width for A4 at 96dpi
              minHeight: '1123px', // A4 height at 96dpi
              boxSizing: 'border-box',
              position: 'relative'
            }
          },
            React.createElement('div', {
              className: 'prose',
              style: {
                fontFamily: 'Lora, Georgia, serif',
                padding: '57px', // ~1.5cm margins at 96dpi
                backgroundColor: '#faf9f5',
                minHeight: 'calc(100% - 0px)',
                boxSizing: 'border-box',
                position: 'relative',
                zIndex: 1
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
