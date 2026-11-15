
import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';

export default function TextDiffChecker({ currentUser }) {
  const userId = encodeURIComponent(
    (currentUser?.email || 'guest').toLowerCase()
  );

  const historyKey = `textifyDiffHistory_${userId}`;
  const originalKey = `textifyDiffOriginal_${userId}`;

  const [originalText, setOriginalText] = useState(() => {
    return localStorage.getItem(originalKey) || '';
  });

  const [modifiedText, setModifiedText] = useState('');
  const [result, setResult] = useState(null);

  const [comparisonHistory, setComparisonHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(historyKey)) || [];
    } catch {
      return [];
    }
  });

  // Save only Original Text
  useEffect(() => {
    localStorage.setItem(originalKey, originalText);
  }, [originalText, originalKey]);

  // Save comparison history
  useEffect(() => {
    localStorage.setItem(
      historyKey,
      JSON.stringify(comparisonHistory)
    );
  }, [comparisonHistory, historyKey]);

  const compareText = () => {
    if (!originalText.trim() || !modifiedText.trim()) {
      return;
    }

    const original = originalText.split(/(\s+)/);
    const modified = modifiedText.split(/(\s+)/);

    const rows = Array.from(
      { length: original.length + 1 },
      () => Array(modified.length + 1).fill(0)
    );

    for (let i = original.length - 1; i >= 0; i--) {
      for (let j = modified.length - 1; j >= 0; j--) {
        if (original[i] === modified[j]) {
          rows[i][j] = 1 + rows[i + 1][j + 1];
        } else {
          rows[i][j] = Math.max(
            rows[i + 1][j],
            rows[i][j + 1]
          );
        }
      }
    }

    const originalResult = [];
    const modifiedResult = [];

    let i = 0;
    let j = 0;

    while (i < original.length && j < modified.length) {
      if (original[i] === modified[j]) {
        originalResult.push({ text: original[i], type: 'same' });
        modifiedResult.push({ text: modified[j], type: 'same' });
        i++;
        j++;
      } else if (rows[i + 1][j] >= rows[i][j + 1]) {
        originalResult.push({ text: original[i], type: 'removed' });
        i++;
      } else {
        modifiedResult.push({ text: modified[j], type: 'added' });
        j++;
      }
    }

    while (i < original.length) {
      originalResult.push({ text: original[i], type: 'removed' });
      i++;
    }

    while (j < modified.length) {
      modifiedResult.push({ text: modified[j], type: 'added' });
      j++;
    }

    setResult({
      original: originalResult,
      modified: modifiedResult
    });
  };

  const handleSaveComparison = () => {
    if (!result) return;

    const newComparison = {
      id: Date.now(),
      originalText,
      modifiedText,
      result,
      date: new Date().toISOString()
    };

    setComparisonHistory((previous) =>
      [newComparison, ...previous].slice(0, 20)
    );
  };

  const handleExportPDF = () => {
    if (!result) return;

    const doc = new jsPDF();

    const margin = 15;
    const maxWidth = 180;
    const lineHeight = 6;
    let x = margin;
    let y = 20;

    const checkPage = () => {
      if (y > 280) {
        doc.addPage();
        y = 20;
        x = margin;
      }
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(112, 85, 223);
    doc.text('Textify - Text Comparison', margin, y);

    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Comparison Date: ${new Date().toLocaleString()}`,
      margin,
      y
    );

    const addSection = (heading, items) => {
      y += 14;
      checkPage();

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(40, 40, 40);
      doc.text(heading, margin, y);
    
      y += 9;
      x = margin;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      items.forEach((item) => {
        if (item.type === 'added') {
          doc.setTextColor(20, 145, 75);
        } else if (item.type === 'removed') {
          doc.setTextColor(210, 55, 65);
        } else {
          doc.setTextColor(50, 50, 50);
        }

        const tokens = item.text.match(/\n|[^\S\n]+|[^\s]+/g) || [];

        tokens.forEach((token) => {
          if (token === '\n') {
            x = margin;
            y += lineHeight;
            checkPage();
            return;
          }

          const parts = doc.splitTextToSize(token, maxWidth);

          parts.forEach((part) => {
            const width = doc.getTextWidth(part);

            if (x + width > margin + maxWidth) {
              x = margin;
              y += lineHeight;
              checkPage();
            }

            doc.text(part, x, y);
            x += width;
          });
        });
      });

      if (x !== margin) {
        y += lineHeight;
      }
    };

    addSection('Original Version', result.original);
    addSection('Modified Version', result.modified);

    y += 8;
    checkPage();

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Generated using Textify', margin, y);

    doc.save('Textify-Comparison.pdf');
  };

  const handleOpenComparison = (item) => {
    setOriginalText(item.originalText);
    setModifiedText(item.modifiedText);
    setResult(item.result);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleDeleteComparison = (id) => {
    setComparisonHistory((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  const handleClearHistory = () => {
    if (comparisonHistory.length === 0) return;

    if (
      window.confirm(
        'Are you sure you want to clear all comparison history?'
      )
    ) {
      setComparisonHistory([]);
    }
  };

  const handleClear = () => {
    setOriginalText('');
    setModifiedText('');
    setResult(null);
  };

  return (
    <div className="text-diff-page">
      <div className="text-diff-container">
        <span className="section-tag">TEXT TOOLS</span>

        <h1>Text Diff Checker</h1>

        <p>Compare two versions of your text and find the changes.</p>

        <div className="diff-input-grid">
          <div className="diff-input-card">
            <h3>Original Text</h3>

            <textarea
              placeholder="Paste your original text here..."
              value={originalText}
              onChange={(event) => {
                setOriginalText(event.target.value);
                setResult(null);
              }}
            />
          </div>

          <div className="diff-input-card">
            <h3>Modified Text</h3>

            <textarea
              placeholder="Paste your modified text here..."
              value={modifiedText}
              onChange={(event) => {
                setModifiedText(event.target.value);
                setResult(null);
              }}
            />
          </div>
        </div>

        <div className="diff-actions">
          <button
            onClick={compareText}
            disabled={!originalText.trim() || !modifiedText.trim()}
          >
            Compare Text
          </button>

          <button className="diff-clear-btn" onClick={handleClear}>
            Clear All
          </button>
        </div>

        {result && (
          <div className="diff-result">
            <h2>Comparison Results</h2>

            <div className="diff-legend">
              <span className="diff-added">Added Text</span>
              <span className="diff-removed">Removed Text</span>
              <span className="diff-same">Unchanged Text</span>
            </div>

            <div className="diff-result-grid">
              <div className="diff-result-card">
                <h3>Original Version</h3>

                <div className="diff-output">
                  {result.original.map((item, index) => (
                    <span className={`diff-${item.type}`} key={index}>
                      {item.text}
                    </span>
                  ))}
                </div>
              </div>

              <div className="diff-result-card">
                <h3>Modified Version</h3>

                <div className="diff-output">
                  {result.modified.map((item, index) => (
                    <span className={`diff-${item.type}`} key={index}>
                      {item.text}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="diff-result-actions">
              <button
                className="diff-save-btn"
                onClick={handleSaveComparison}
              >
                Save Comparison
              </button>

              <button
                className="diff-export-btn"
                onClick={handleExportPDF}
              >
                Export PDF
              </button>
            </div>
          </div>
        )}

        {comparisonHistory.length > 0 && (
          <div className="diff-history-section">
            <div className="diff-history-header">
              <h2>Saved Comparisons</h2>

              <button
                className="diff-history-clear"
                onClick={handleClearHistory}
              >
                Clear All History
              </button>
            </div>

            <div className="diff-history-list">
              {comparisonHistory.map((item) => (
                <div className="diff-history-item" key={item.id}>
                  <div className="diff-history-info">
                    <h3>
                      {item.originalText.slice(0, 45) || 'Original Text'}
                      {item.originalText.length > 45 ? '...' : ''}
                    </h3>

                    <p>
                      Compared with:{' '}
                      {item.modifiedText.slice(0, 45)}
                      {item.modifiedText.length > 45 ? '...' : ''}
                    </p>

                    <small>
                      {new Date(item.date).toLocaleString()}
                    </small>
                  </div>

                  <div className="diff-history-actions">
                    <button
                      className="diff-history-open"
                      onClick={() => handleOpenComparison(item)}
                    >
                      Reopen
                    </button>

                    <button
                      className="diff-history-delete"
                      onClick={() => handleDeleteComparison(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
