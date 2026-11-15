
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { jsPDF } from 'jspdf';

export default function TextForm({ showAlert, currentUser }) {
  const userId = encodeURIComponent(
    (currentUser?.email || 'guest').toLowerCase()
  );

  const textKey = `textifyText_${userId}`;
  const historyKey = `textifyHistory_${userId}`;
  const caseHistoryKey = `textifyCaseHistory_${userId}`;

  const loadUserData = (key, oldKey) => {
    let savedData = localStorage.getItem(key);

    if (savedData === null && oldKey) {
      const oldData = localStorage.getItem(oldKey);

      if (oldData !== null) {
        localStorage.setItem(key, oldData);
        localStorage.removeItem(oldKey);
        savedData = oldData;
      }
    }

    return savedData;
  };

  const [text, setText] = useState(() => {
    return loadUserData(textKey, 'textifyText') || '';
  });

  const [history, setHistory] = useState(() => {
    return JSON.parse(
      loadUserData(historyKey, 'textifyHistory') || '[]'
    );
  });

  const [caseHistory, setCaseHistory] = useState(() => {
    return JSON.parse(
      loadUserData(caseHistoryKey) || '[]'
    );
  });

  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [deletedItem, setDeletedItem] = useState(null);
  const [historySearch, setHistorySearch] = useState('');
  const [historySort, setHistorySort] = useState('newest');
  const [previewItem, setPreviewItem] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);

  const textAreaRef = useRef(null);
  const importFileRef = useRef(null);
  const isFirstRender = useRef(true);
  const saveTimer = useRef(null);
  const deleteTimer = useRef(null);

  useEffect(() => {
    localStorage.setItem(textKey, text);

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setSaveStatus('✓ Changes saved');

    clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(() => {
      setSaveStatus('');
    }, 2000);

    return () => clearTimeout(saveTimer.current);
  }, [text, textKey]);

  useEffect(() => {
    localStorage.setItem(historyKey, JSON.stringify(history));
  }, [history, historyKey]);

  useEffect(() => {
    localStorage.setItem(
      caseHistoryKey,
      JSON.stringify(caseHistory)
    );
  }, [caseHistory, caseHistoryKey]);

  useEffect(() => {
    return () => {
      clearTimeout(saveTimer.current);
      clearTimeout(deleteTimer.current);
    };
  }, []);

  const isTextEmpty = !text.trim();

  const filteredHistory = history.filter((item) => {
    const search = historySearch.toLowerCase().trim();

    return (
      (item.title || 'Untitled Text').toLowerCase().includes(search) ||
      (item.content || '').toLowerCase().includes(search)
    );
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (historySort === 'newest') return b.id - a.id;
    if (historySort === 'oldest') return a.id - b.id;

    if (historySort === 'az') {
      return (a.title || 'Untitled Text').localeCompare(
        b.title || 'Untitled Text'
      );
    }

    if (historySort === 'za') {
      return (b.title || 'Untitled Text').localeCompare(
        a.title || 'Untitled Text'
      );
    }

    return 0;
  });

  const allVisibleSelected =
    sortedHistory.length > 0 &&
    sortedHistory.every((item) => selectedIds.includes(item.id));

  const updateText = (newText) => {
    setPast((previous) => [...previous, text]);
    setFuture([]);
    setText(newText);
  };

  // Record a text transformation
  const applyTransformation = (action, updatedText) => {
    if (isTextEmpty) return;

    updateText(updatedText);

    const newEntry = {
      id: Date.now(),
      action,
      content: updatedText,
      date: new Date().toLocaleString()
    };

    setCaseHistory((previous) => [
      newEntry,
      ...previous
    ].slice(0, 20));
  };

  // Restore a previous transformation
  const handleRestoreTransformation = (savedText) => {
    updateText(savedText);
    showAlert('Previous transformation restored!');

    textAreaRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  };

  // Clear transformation history
  const handleClearCaseHistory = () => {
    if (caseHistory.length === 0) return;

    const confirmDelete = window.confirm(
      'Are you sure you want to clear your transformation history?'
    );

    if (!confirmDelete) return;

    setCaseHistory([]);
    showAlert('Transformation history cleared!');
  };

  const handleUndo = useCallback(() => {
    if (past.length === 0) return;

    const previousText = past[past.length - 1];

    setPast((previous) => previous.slice(0, -1));
    setFuture((previous) => [...previous, text]);
    setText(previousText);

    showAlert('Last change undone!');
  }, [past, text, showAlert]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;

    const nextText = future[future.length - 1];

    setFuture((previous) => previous.slice(0, -1));
    setPast((previous) => [...previous, text]);
    setText(nextText);

    showAlert('Change restored!');
  }, [future, text, showAlert]);

  // Ctrl + Z for Undo and Ctrl + Y for Redo
  useEffect(() => {
    const handleUndoRedoShortcuts = (event) => {
      if (!(event.ctrlKey || event.metaKey)) return;

      if (event.key.toLowerCase() === 'z' && !event.shiftKey) {
        event.preventDefault();
        handleUndo();
      }

      if (event.key.toLowerCase() === 'y') {
        event.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleUndoRedoShortcuts);

    return () => {
      window.removeEventListener('keydown', handleUndoRedoShortcuts);
    };
  }, [handleUndo, handleRedo]);

  const handleOnChange = (event) => {
    updateText(event.target.value);
  };

  const handleUpClick = () => {
    applyTransformation('UPPERCASE', text.toUpperCase());
    showAlert('Converted to uppercase!');
  };

  const handleLowClick = () => {
    applyTransformation('lowercase', text.toLowerCase());
    showAlert('Converted to lowercase!');
  };

  const handleTitleCase = () => {
    const updatedText = text.toLowerCase().replace(/\b[a-z]/g, (letter) =>
      letter.toUpperCase()
    );

    applyTransformation('Title Case', updatedText);
    showAlert('Converted to Title Case!');
  };

  const handleSentenceCase = () => {
    const updatedText = text.toLowerCase().replace(
      /(^\s*[a-z])|([.!?]\s+[a-z])/g,
      (match) => match.toUpperCase()
    );

    applyTransformation('Sentence Case', updatedText);
    showAlert('Converted to Sentence Case!');
  };

  const handleAlternatingCase = () => {
    let isUpperCase = true;

    const updatedText = text.split('').map((character) => {
      if (/[a-z]/i.test(character)) {
        const convertedCharacter = isUpperCase
          ? character.toUpperCase()
          : character.toLowerCase();

        isUpperCase = !isUpperCase;
        return convertedCharacter;
      }

      return character;
    }).join('');

    applyTransformation('Alternating Case', updatedText);
    showAlert('Converted to aLtErNaTiNg CaSe!');
  };

  const handleInverseClick = () => {
    applyTransformation(
      'Reverse Text',
      text.split('').reverse().join('')
    );

    showAlert('Text reversed!');
  };

  const handleExtraSpaces = () => {
    applyTransformation(
      'Remove Extra Spaces',
      text.trim().split(/\s+/).join(' ')
    );

    showAlert('Extra spaces removed!');
  };

  const handleClear = () => {
    updateText('');
    showAlert('Text cleared!');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      showAlert('Text copied to clipboard!');
    } catch {
      showAlert('Unable to copy text. Please try again.', 'error');
    }
  };

  const handleSelectAll = () => {
    textAreaRef.current.select();
    showAlert('Text selected!');
  };

  const handleImport = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.txt')) {
      showAlert('Please select a .txt file!', 'error');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      updateText(reader.result);
      showAlert('Text file imported successfully!');
      event.target.value = '';
    };

    reader.onerror = () => {
      showAlert('Unable to read this file!', 'error');
      event.target.value = '';
    };

    reader.readAsText(file);
  };

  const handleKeyboardShortcuts = (event) => {
    if (!event.altKey || !event.shiftKey) return;

    const key = event.key.toLowerCase();

    if (key === 'u' && !isTextEmpty) {
      event.preventDefault();
      handleUpClick();
    }

    if (key === 'l' && !isTextEmpty) {
      event.preventDefault();
      handleLowClick();
    }

    if (key === 'c' && !isTextEmpty) {
      event.preventDefault();
      handleCopy();
    }
  };

  const handleSave = () => {
    if (isTextEmpty) return;

    const newEntry = {
      id: Date.now(),
      title: 'Untitled Text',
      content: text,
      date: new Date().toLocaleString()
    };

    setHistory((previousHistory) => [newEntry, ...previousHistory]);
    showAlert('Text saved successfully!');
  };

  const handleDownload = () => {
    if (isTextEmpty) return;

    const file = new Blob([text], {
      type: 'text/plain;charset=utf-8'
    });

    const url = URL.createObjectURL(file);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'textify.txt';

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showAlert('Text downloaded successfully!');
  };

  const handleDownloadHistory = (savedText, id) => {
    const file = new Blob([savedText], {
      type: 'text/plain;charset=utf-8'
    });

    const url = URL.createObjectURL(file);

    const link = document.createElement('a');
    link.href = url;
    link.download = `textify-history-${id}.txt`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showAlert('Saved text downloaded successfully!');
  };

  const handleDownloadSelected = () => {
    const selectedItems = sortedHistory.filter((item) =>
      selectedIds.includes(item.id)
    );

    if (selectedItems.length === 0) return;

    const combinedText = selectedItems.map((item, index) => {
      return (
        `TEXT ${index + 1}: ${item.title || 'Untitled Text'}\n` +
        `Date: ${item.date}\n\n` +
        `${item.content}\n`
      );
    }).join('\n----------------------------------------\n\n');

    const file = new Blob([combinedText], {
      type: 'text/plain;charset=utf-8'
    });

    const url = URL.createObjectURL(file);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'textify-selected-history.txt';

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showAlert('Selected texts downloaded successfully!');
  };

  const handleDeleteSelected = () => {
    const selectedItems = history.filter((item) =>
      selectedIds.includes(item.id)
    );

    if (selectedItems.length === 0) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedItems.length} selected texts?`
    );

    if (!confirmDelete) return;

    const idsToDelete = selectedItems.map((item) => item.id);

    setHistory((previousHistory) =>
      previousHistory.filter((item) => !idsToDelete.includes(item.id))
    );

    setSelectedIds([]);

    if (deletedItem && idsToDelete.includes(deletedItem.id)) {
      clearTimeout(deleteTimer.current);
      deleteTimer.current = null;
      setDeletedItem(null);
    }

    if (previewItem && idsToDelete.includes(previewItem.id)) {
      setPreviewItem(null);
    }

    showAlert('Selected texts deleted successfully!');
  };

  const handleToggleSelection = (id) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((selectedId) => selectedId !== id)
        : [...previous, id]
    );
  };

  const handleSelectAllHistory = () => {
    if (allVisibleSelected) {
      const visibleIds = sortedHistory.map((item) => item.id);

      setSelectedIds((previous) =>
        previous.filter((id) => !visibleIds.includes(id))
      );
    } else {
      setSelectedIds((previous) => [
        ...new Set([
          ...previous,
          ...sortedHistory.map((item) => item.id)
        ])
      ]);
    }
  };

  const handleExportPDF = () => {
    if (isTextEmpty) return;

    try {
      const pdf = new jsPDF();

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 15;
      const maxWidth = pageWidth - margin * 2;
      const lineHeight = 7;

      const lines = pdf.splitTextToSize(text, maxWidth);

      let y = 20;

      lines.forEach((line) => {
        if (y + lineHeight > pageHeight - margin) {
          pdf.addPage();
          y = 20;
        }

        pdf.text(line, margin, y);
        y += lineHeight;
      });

      pdf.save('textify.pdf');

      showAlert('PDF exported successfully!');
    } catch {
      showAlert('Unable to export PDF!', 'error');
    }
  };

  const handleOpen = (savedText) => {
    updateText(savedText);

    textAreaRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    textAreaRef.current.focus();
    showAlert('Saved text opened!');
  };

  const handleDelete = (id) => {
    const itemToDelete = history.find((item) => item.id === id);

    if (!itemToDelete) return;

    clearTimeout(deleteTimer.current);

    setHistory((previousHistory) =>
      previousHistory.filter((item) => item.id !== id)
    );

    setSelectedIds((previous) =>
      previous.filter((selectedId) => selectedId !== id)
    );

    setDeletedItem(itemToDelete);

    deleteTimer.current = setTimeout(() => {
      setDeletedItem(null);
      deleteTimer.current = null;
    }, 5000);
  };

  const handleUndoDelete = () => {
    if (!deletedItem) return;

    clearTimeout(deleteTimer.current);

    setHistory((previousHistory) => [
      deletedItem,
      ...previousHistory
    ]);

    setDeletedItem(null);
    deleteTimer.current = null;

    showAlert('Deleted text restored!');
  };

  const handleRename = (id, currentTitle) => {
    const newTitle = window.prompt(
      'Enter a new title:',
      currentTitle || 'Untitled Text'
    );

    if (newTitle === null) return;

    if (!newTitle.trim()) {
      showAlert('Title cannot be empty!', 'error');
      return;
    }

    setHistory((previousHistory) =>
      previousHistory.map((item) =>
        item.id === id
          ? { ...item, title: newTitle.trim() }
          : item
      )
    );

    showAlert('Text renamed successfully!');
  };

  const handleClearHistory = () => {
    if (history.length === 0) return;

    const confirmDelete = window.confirm(
      'Are you sure you want to delete all saved text history?'
    );

    if (!confirmDelete) return;

    clearTimeout(deleteTimer.current);
    deleteTimer.current = null;
    setDeletedItem(null);

    setHistory([]);
    setSelectedIds([]);
    setPreviewItem(null);

    showAlert('All text history cleared!');
  };

  const handleReplace = () => {
    if (!findText.trim()) {
      showAlert('Please enter a word to find!', 'error');
      return;
    }

    if (!text.includes(findText)) {
      showAlert('Word not found!', 'error');
      return;
    }

    const updatedText = text.split(findText).join(replaceText);
    updateText(updatedText);
    showAlert('Text replaced successfully!');
  };

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = text.length;
  const readingTime = (words * 0.008).toFixed(2);

  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  const sentenceCount = sentences.filter(
    (sentence) => sentence.trim()
  ).length;

  const paragraphs = text.trim()
    ? text.trim().split(/\n\s*\n/).filter(
        (paragraph) => paragraph.trim()
      )
    : [];

  const paragraphCount = paragraphs.length;

  const analysisWords =
    text.match(/[a-zA-Z0-9]+(?:['’-][a-zA-Z0-9]+)*/g) || [];

  const totalWordLength = analysisWords.reduce(
    (total, word) =>
      total + word.replace(/[^a-zA-Z0-9]/g, '').length,
    0
  );

  const averageWordLength = analysisWords.length
    ? (totalWordLength / analysisWords.length).toFixed(2)
    : '0.00';

  const longestWord = analysisWords.length
    ? analysisWords.reduce((longest, word) =>
        word.length > longest.length ? word : longest
      )
    : '—';

  return (
    <div className="editor-card">
      <span className="section-tag">TEXT EDITOR</span>

      <h2>Transform your text.</h2>

      <p>Enter your text below and choose what you want to do.</p>

      <textarea
        className="form-control"
        value={text}
        onChange={handleOnChange}
        onKeyDown={handleKeyboardShortcuts}
        id="myBox"
        rows="8"
        ref={textAreaRef}
      ></textarea>

      {saveStatus && (
        <p className="auto-save-status">{saveStatus}</p>
      )}

      <input
        type="file"
        accept=".txt,text/plain"
        ref={importFileRef}
        onChange={handleImport}
        style={{ display: 'none' }}
      />

      <div className="editor-buttons">
        <button disabled={past.length === 0} onClick={handleUndo}>
          Undo
        </button>

        <button disabled={future.length === 0} onClick={handleRedo}>
          Redo
        </button>

        <button disabled={isTextEmpty} onClick={handleUpClick}>
          UPPERCASE
        </button>

        <button disabled={isTextEmpty} onClick={handleLowClick}>
          lowercase
        </button>

        <button disabled={isTextEmpty} onClick={handleTitleCase}>
          Title Case
        </button>

        <button disabled={isTextEmpty} onClick={handleSentenceCase}>
          Sentence Case
        </button>

        <button disabled={isTextEmpty} onClick={handleAlternatingCase}>
          aLtErNaTiNg CaSe
        </button>

        <button disabled={isTextEmpty} onClick={handleInverseClick}>
          Reverse Text
        </button>

        <button disabled={isTextEmpty} onClick={handleExtraSpaces}>
          Remove Spaces
        </button>

        <button disabled={isTextEmpty} onClick={handleCopy}>
          Copy Text
        </button>

        <button disabled={isTextEmpty} onClick={handleSelectAll}>
          Select All
        </button>

        <button disabled={isTextEmpty} onClick={handleSave}>
          Save Text
        </button>

        <button onClick={() => importFileRef.current.click()}>
          Import Text File
        </button>

        <button disabled={isTextEmpty} onClick={handleDownload}>
          Download Text
        </button>

        <button disabled={isTextEmpty} onClick={handleExportPDF}>
          Export PDF
        </button>

        <button
          disabled={isTextEmpty}
          className="clear-btn"
          onClick={handleClear}
        >
          Clear Text
        </button>
      </div>

      {!isTextEmpty && (
        <div className="find-replace-section">
          <span className="section-tag">TEXT TOOLS</span>
          <h3>Find & Replace</h3>
          <p>Quickly find words and replace them in your text.</p>

          <div className="find-replace-inputs">
            <input
              type="text"
              placeholder="Enter word to find"
              value={findText}
              onChange={(event) => setFindText(event.target.value)}
            />

            <input
              type="text"
              placeholder="Replace with"
              value={replaceText}
              onChange={(event) => setReplaceText(event.target.value)}
            />

            <button
              className="replace-btn"
              disabled={isTextEmpty}
              onClick={handleReplace}
            >
              Replace All
            </button>
          </div>
        </div>
      )}

      {/* Text Case History */}
      <div className="case-history-section">
        <h3>Text Case History</h3>
        <p>View and restore your previous text transformations.</p>

        {caseHistory.length > 0 ? (
          <>
            <button
              className="case-history-clear"
              onClick={handleClearCaseHistory}
            >
              Clear Transformation History
            </button>

            <div className="case-history-list">
              {caseHistory.map((item) => (
                <div className="case-history-item" key={item.id}>
                  <div>
                    <h4>{item.action}</h4>
                    <small>{item.date}</small>
                    <p>
                      {item.content.substring(0, 100)}
                      {item.content.length > 100 ? '...' : ''}
                    </p>
                  </div>

                  <button
                    className="case-history-restore"
                    onClick={() =>
                      handleRestoreTransformation(item.content)
                    }
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>No transformations yet. Try changing your text case!</p>
        )}
      </div>

      <div className="summary-section">
        <h3>Your Text Summary</h3>

        <div className="summary-grid">
          <div className="summary-card">
            <h2>{words}</h2>
            <p>Words</p>
          </div>

          <div className="summary-card">
            <h2>{characters}</h2>
            <p>Characters</p>
          </div>

          <div className="summary-card">
            <h2>{readingTime}</h2>
            <p>Reading Minutes</p>
          </div>
        </div>

        <div className="preview-box">
          <h3>Text Preview</h3>
          <p>{text || 'Your text preview will appear here...'}</p>
        </div>

        <div className="text-analysis-section">
          <h3>Text Statistics & Analysis</h3>

          <div className="summary-grid">
            <div className="summary-card">
              <h2>{sentenceCount}</h2>
              <p>Sentences</p>
            </div>

            <div className="summary-card">
              <h2>{paragraphCount}</h2>
              <p>Paragraphs</p>
            </div>

            <div className="summary-card">
              <h2>{averageWordLength}</h2>
              <p>Average Word Length</p>
            </div>

            <div className="summary-card">
              <h2>{longestWord}</h2>
              <p>Longest Word</p>
            </div>
          </div>
        </div>
      </div>

      <div className="history-section">
        <h3>Your Text History</h3>

        {deletedItem && (
          <p className="undo-delete-message">
            Text deleted.
            <button onClick={handleUndoDelete}>
              Undo
            </button>
          </p>
        )}

        <input
          type="text"
          className="history-search"
          placeholder="Search by title or content..."
          value={historySearch}
          onChange={(event) => setHistorySearch(event.target.value)}
        />

        {history.length > 0 && (
          <>
            <select
              className="history-sort"
              value={historySort}
              onChange={(event) => setHistorySort(event.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="az">A–Z</option>
              <option value="za">Z–A</option>
            </select>

            <button onClick={handleClearHistory}>
              Clear All History
            </button>
          </>
        )}

        {sortedHistory.length > 0 && (
          <div className="history-bulk-actions">
            <label className="history-select-all">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={handleSelectAllHistory}
              />
              Select All
            </label>

            {selectedIds.length > 0 && (
              <>
                <span>
                  {selectedIds.length} selected
                </span>

                <button
                  className="history-download-selected"
                  onClick={handleDownloadSelected}
                >
                  Download Selected
                </button>

                <button
                  className="history-delete-selected"
                  onClick={handleDeleteSelected}
                >
                  Delete Selected
                </button>
              </>
            )}
          </div>
        )}

        {history.length === 0 ? (
          <p>No saved text yet.</p>
        ) : sortedHistory.length === 0 ? (
          <p>No matching saved text found.</p>
        ) : (
          sortedHistory.map((item) => (
            <div className="history-item" key={item.id}>
              <label className="history-checkbox">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => handleToggleSelection(item.id)}
                />
              </label>

              <h4>{item.title || 'Untitled Text'}</h4>

              <p>{item.content.substring(0, 100)}</p>

              <small>{item.date}</small>

              <button onClick={() => setPreviewItem(item)}>
                Preview
              </button>

              <button onClick={() => handleOpen(item.content)}>
                Open
              </button>

              <button
                onClick={() =>
                  handleDownloadHistory(item.content, item.id)
                }
              >
                Download
              </button>

              <button
                onClick={() =>
                  handleRename(item.id, item.title)
                }
              >
                Rename
              </button>

              <button onClick={() => handleDelete(item.id)}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      {previewItem && (
        <div
          className="text-preview-overlay"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="text-preview-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="text-preview-header">
              <h3>{previewItem.title || 'Untitled Text'}</h3>

              <button
                className="preview-close-btn"
                onClick={() => setPreviewItem(null)}
              >
                ×
              </button>
            </div>

            <small>{previewItem.date}</small>

            <div className="text-preview-content">
              {previewItem.content}
            </div>

            <button
              className="preview-close-action"
              onClick={() => setPreviewItem(null)}
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}