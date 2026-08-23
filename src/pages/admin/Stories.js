
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { storiesAPI, authorsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

/* =========================================================
   CONFIG
========================================================= */

const CATEGORIES = [
  'Business',
  'Sport',
  'Technology',
  'Health',
  'Culture',
  'Religion',
  'Environment',
  'Le Phare',
  'Music',
  'Transport',
  'Education',
  'Entertainment',
  'Job Links',
  'Opinion',
];

const API_BASE =
  process.env.REACT_APP_API_URL?.replace(/\/api\/?$/, '') ||
  'https://mahokofridaynewsbackend.onrender.com';

const PLACEHOLDER = `${API_BASE}/uploads/placeholder.jpg`;

/* =========================================================
   IMAGE URL
========================================================= */

const getImgUrl = (path) => {
  if (!path || typeof path !== 'string') return PLACEHOLDER;

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  if (path.includes('..')) {
    return PLACEHOLDER;
  }

  const cleanPath = path
    .replace(/^uploads?\//, '')
    .replace(/^\/+/, '');

  return `${API_BASE}/uploads/${cleanPath}`;
};

/* =========================================================
   GLOBAL STYLES
========================================================= */

const ResponsiveStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    :root {
      --primary: #1a472a;
      --primary-light: #2d6a4f;
      --bg-card: #ffffff;
      --bg-subtle: #f8fafc;
      --border: #e2e8f0;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --text-faint: #94a3b8;
    }

    * {
      box-sizing: border-box;
    }

    .s-container {
      font-family: 'Plus Jakarta Sans', sans-serif;
      animation: fadeIn .4s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .s-card {
      background: var(--bg-card);
      padding: 20px;
      border-radius: 16px;
      border: 1px solid var(--border);
      box-shadow: 0 4px 15px rgba(0,0,0,.03);
      margin-bottom: 16px;
      transition: box-shadow .3s;
    }

    .s-card:hover {
      box-shadow: 0 8px 25px rgba(0,0,0,.06);
    }

    .s-card-title {
      font-weight: 800;
      margin: 0 0 20px;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--text-main);
    }

    .grid-1 {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .sidebar-section {
      order: -1;
    }

    .s-input-group {
      position: relative;
      margin-bottom: 20px;
    }

    .s-input {
      width: 100%;
      padding: 20px 16px 8px 16px;
      border: 2px solid var(--border);
      border-radius: 12px;
      font-size: 14px;
      outline: none;
      font-family: inherit;
      transition: border-color .2s, box-shadow .2s;
      background: #fff;
      color: var(--text-main);
      font-weight: 600;
    }

    .s-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 4px rgba(26,71,42,.1);
    }

    .s-floating-label {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-faint);
      font-size: 14px;
      pointer-events: none;
      transition: all .2s ease;
      font-weight: 500;
    }

    .s-input:focus ~ .s-floating-label,
    .s-input:not(:placeholder-shown) ~ .s-floating-label {
      top: 10px;
      transform: translateY(0);
      font-size: 10px;
      color: var(--primary);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .05em;
    }

    .s-select {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid var(--border);
      border-radius: 12px;
      font-size: 14px;
      outline: none;
      font-family: inherit;
      background: #fff;
      font-weight: 600;
      color: var(--text-main);
      margin-bottom: 20px;
    }

    .s-btn {
      background: linear-gradient(
        135deg,
        var(--primary) 0%,
        var(--primary-light) 100%
      );
      color: #fff;
      border: none;
      padding: 12px 20px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      font-family: inherit;
      transition: all .2s;
      box-shadow: 0 4px 6px -1px rgba(26,71,42,.2);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-decoration: none;
      white-space: nowrap;
    }

    .s-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 10px 15px -3px rgba(26,71,42,.3);
    }

    .s-btn:disabled {
      background: var(--text-faint);
      cursor: not-allowed;
      box-shadow: none;
    }

    .s-btn-full {
      width: 100%;
    }

    .s-btn-outline {
      background: transparent;
      border: 2px solid var(--border);
      color: var(--text-muted);
      box-shadow: none;
    }

    .s-btn-outline:hover {
      border-color: var(--primary);
      color: var(--primary);
    }

    .s-btn-danger {
      background: #fef2f2;
      color: #ef4444;
      border: 1px solid #fca5a5;
      box-shadow: none;
      padding: 8px 14px;
      font-size: 12px;
      border-radius: 8px;
    }

    .s-table-scroll {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      background: #fff;
      border-radius: 16px;
      border: 1px solid var(--border);
      box-shadow: 0 4px 15px rgba(0,0,0,.03);
    }

    .s-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      min-width: 800px;
    }

    .s-table thead th {
      padding: 14px 16px;
      background: var(--bg-subtle);
      color: var(--text-muted);
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: .05em;
      border-bottom: 1px solid var(--border);
      text-align: left;
      white-space: nowrap;
    }

    .s-table tbody tr:hover {
      background: #f8fafc;
    }

    .s-table tbody td {
      padding: 16px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
    }

    .badge {
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      display: inline-block;
      white-space: nowrap;
    }

    /* =====================================================
       ARTICLE EDITOR
    ===================================================== */

    .article-editor {
      border: 2px solid var(--border);
      border-radius: 14px;
      background: #fff;
      overflow: visible;
    }

    .editor-toolbar {
      position: relative;
      display: flex;
      flex-wrap: wrap;
      gap: 3px;
      align-items: center;
      padding: 9px;
      background: var(--bg-subtle);
      border-bottom: 1px solid var(--border);
      border-radius: 12px 12px 0 0;
    }

    .editor-group {
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .editor-divider {
      width: 1px;
      height: 24px;
      background: var(--border);
      margin: 0 5px;
    }

    .editor-btn {
      min-width: 34px;
      height: 34px;
      padding: 0 8px;
      border: none;
      background: transparent;
      border-radius: 7px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 700;
      color: var(--text-main);
    }

    .editor-btn:hover {
      background: #e2e8f0;
    }

    .editor-select {
      height: 34px;
      border: 1px solid var(--border);
      border-radius: 7px;
      font-size: 12px;
      font-family: inherit;
      color: var(--text-main);
      background: #fff;
      padding: 0 8px;
      font-weight: 600;
      outline: none;
    }

    .editor-content {
      min-height: 450px;
      padding: 24px;
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.7;
      color: #1e293b;
      outline: none;
      overflow-y: auto;
    }

    .editor-content:empty:before {
      content: attr(data-placeholder);
      color: #94a3b8;
      pointer-events: none;
    }

    .editor-content img {
      max-width: 100%;
      width: 400px;
      height: auto;
      display: block;
      margin: 18px auto;
      cursor: pointer;
      border-radius: 8px;
    }

    /* =====================================================
       LARGE CENTERED VIDEO
    ===================================================== */

    .editor-content .article-video {
      width: 100%;
      max-width: 1200px;
      margin: 35px auto;
      display: block;
      position: relative;
    }

    .editor-content .article-video iframe,
    .editor-content .article-video video {
      width: 100%;
      height: auto;
      aspect-ratio: 16 / 9;
      min-height: 0;
      display: block;
      border: 0;
      border-radius: 14px;
      margin: 0 auto;
      background: #000;
      object-fit: cover;
    }

    /* Make video slightly larger on big screens */
    @media (min-width: 1400px) {
      .editor-content .article-video {
        max-width: 1250px;
      }
    }

    .editor-content blockquote {
      margin: 20px 0;
      padding: 14px 20px;
      border-left: 5px solid var(--primary);
      background: #f8fafc;
      font-style: italic;
    }

    .editor-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }

    .editor-content table td,
    .editor-content table th {
      border: 1px solid #cbd5e1;
      padding: 8px;
    }

    .editor-content table th {
      background: #f1f5f9;
      font-weight: 700;
    }

    .editor-content h1 {
      font-size: 26px;
      line-height: 1.2;
      font-weight: 800;
    }

    .editor-content h2 {
      font-size: 22px;
      line-height: 1.3;
      font-weight: 800;
    }

    .editor-content h3 {
      font-size: 18px;
      line-height: 1.4;
      font-weight: 800;
    }

    .editor-content h4 {
      font-size: 15px;
      line-height: 1.4;
      font-weight: 800;
    }

    .media-popup {
      position: absolute;
      z-index: 100;
      top: 48px;
      left: 0;
      width: min(420px, calc(100vw - 40px));
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 14px;
      box-shadow: 0 18px 45px rgba(15,23,42,.18);
      padding: 18px;
    }

    .popup-title {
      font-size: 14px;
      font-weight: 800;
      margin-bottom: 14px;
      color: var(--text-main);
    }

    .popup-tabs {
      display: flex;
      gap: 5px;
      margin-bottom: 15px;
    }

    .popup-tab {
      flex: 1;
      padding: 8px;
      border: 1px solid var(--border);
      background: #fff;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 700;
      font-size: 12px;
    }

    .popup-tab.active {
      background: var(--primary);
      color: #fff;
      border-color: var(--primary);
    }

    .color-input {
      width: 34px;
      height: 34px;
      padding: 2px;
      border: 1px solid var(--border);
      border-radius: 7px;
      cursor: pointer;
      background: #fff;
    }

    @media (min-width: 768px) {
      .s-card {
        padding: 28px;
        border-radius: 20px;
        margin-bottom: 24px;
      }

      .s-btn {
        padding: 14px 24px;
        font-size: 14px;
        border-radius: 12px;
      }

      .editor-content {
        min-height: 500px;
      }
    }

    @media (min-width: 1024px) {
      .grid-form-table {
        grid-template-columns: 1fr 380px;
      }

      .sidebar-section {
        order: 1;
      }
    }

    /* =====================================================
       MOBILE VIDEO
    ===================================================== */

    @media (max-width: 768px) {
      .editor-content {
        padding: 16px;
      }

      .editor-content .article-video {
        width: 100%;
        max-width: 100%;
        margin: 25px auto;
      }

      .editor-content .article-video iframe,
      .editor-content .article-video video {
        width: 100%;
        height: auto;
        aspect-ratio: 16 / 9;
        min-height: 0;
        border-radius: 10px;
      }
    }

    @media (max-width: 600px) {
      .editor-content {
        padding: 16px;
        min-height: 380px;
      }

      .editor-toolbar {
        gap: 2px;
      }

      .editor-divider {
        display: none;
      }

      .editor-content .article-video {
        margin: 20px auto;
      }

      .editor-content .article-video iframe,
      .editor-content .article-video video {
        width: 100%;
        aspect-ratio: 16 / 9;
        border-radius: 8px;
      }
    }
  `}</style>
);

/* =========================================================
   IMAGE SOURCE POPUP
========================================================= */

function ImageSourcePopover({ onInsert, onClose }) {
  const [mode, setMode] = useState('device');
  const [linkValue, setLinkValue] = useState('');
  const localFileRef = useRef();

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();

      reader.onload = () => {
        onInsert(reader.result);
      };

      reader.readAsDataURL(file);
    });

    onClose();
  };

  const handleLinkInsert = () => {
    if (!linkValue.trim()) return;

    onInsert(linkValue.trim());
    onClose();
  };

  return (
    <div className="media-popup">
      <div className="popup-title">🖼 Insert Image</div>

      <div className="popup-tabs">
        <button
          type="button"
          className={`popup-tab ${
            mode === 'device' ? 'active' : ''
          }`}
          onClick={() => setMode('device')}
        >
          Device
        </button>

        <button
          type="button"
          className={`popup-tab ${
            mode === 'link' ? 'active' : ''
          }`}
          onClick={() => setMode('link')}
        >
          Image URL
        </button>
      </div>

      {mode === 'device' ? (
        <div
          onClick={() => localFileRef.current?.click()}
          style={{
            border: '2px dashed var(--border)',
            borderRadius: 10,
            padding: 25,
            textAlign: 'center',
            cursor: 'pointer',
            background: 'var(--bg-subtle)',
          }}
        >
          <div
            style={{
              fontSize: 28,
              marginBottom: 8,
            }}
          >
            🖼️
          </div>

          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            Click to choose images
          </p>

          <input
            ref={localFileRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) =>
              handleFiles(e.target.files)
            }
          />
        </div>
      ) : (
        <>
          <input
            value={linkValue}
            onChange={(e) =>
              setLinkValue(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleLinkInsert();
              }
            }}
            placeholder="https://example.com/image.jpg"
            className="s-input"
            style={{ marginBottom: 10 }}
          />

          <button
            type="button"
            onClick={handleLinkInsert}
            className="s-btn s-btn-full"
          >
            Insert Image
          </button>
        </>
      )}

      <button
        type="button"
        onClick={onClose}
        style={{
          marginTop: 10,
          width: '100%',
          padding: 8,
          background: 'transparent',
          color: 'var(--text-faint)',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        Cancel
      </button>
    </div>
  );
}

/* =========================================================
   VIDEO POPUP
========================================================= */

function VideoSourcePopover({ onInsert, onClose }) {
  const [type, setType] = useState('youtube');
  const [url, setUrl] = useState('');

  const extractYouTubeId = (value) => {
    try {
      const parsed = new URL(value);

      if (parsed.hostname.includes('youtu.be')) {
        return parsed.pathname
          .substring(1)
          .split('?')[0];
      }

      if (parsed.hostname.includes('youtube.com')) {
        if (parsed.searchParams.get('v')) {
          return parsed.searchParams.get('v');
        }

        const parts = parsed.pathname.split('/');
        const embedIndex = parts.indexOf('embed');

        if (
          embedIndex !== -1 &&
          parts[embedIndex + 1]
        ) {
          return parts[embedIndex + 1];
        }
      }
    } catch {
      return null;
    }

    return null;
  };

  const extractVimeoId = (value) => {
    const match = value.match(
      /vimeo\.com\/(?:video\/)?(\d+)/i
    );

    return match ? match[1] : null;
  };

  const insert = () => {
    if (!url.trim()) return;

    if (type === 'youtube') {
      const id = extractYouTubeId(url.trim());

      if (!id) {
        alert('Invalid YouTube URL.');
        return;
      }

      onInsert(`
        <div class="article-video" contenteditable="false">
          <iframe
            src="https://www.youtube.com/embed/${id}"
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen>
          </iframe>
        </div>
      `);

      onClose();
      return;
    }

    if (type === 'vimeo') {
      const id = extractVimeoId(url.trim());

      if (!id) {
        alert('Invalid Vimeo URL.');
        return;
      }

      onInsert(`
        <div class="article-video" contenteditable="false">
          <iframe
            src="https://player.vimeo.com/video/${id}"
            title="Vimeo video"
            allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>
      `);

      onClose();
      return;
    }

    onInsert(`
      <div class="article-video" contenteditable="false">
        <video controls preload="metadata">
          <source src="${url.trim()}" />
          Your browser does not support video playback.
        </video>
      </div>
    `);

    onClose();
  };

  return (
    <div className="media-popup">
      <div className="popup-title">
        🎥 Insert Video
      </div>

      <div className="popup-tabs">
        <button
          type="button"
          className={`popup-tab ${
            type === 'youtube' ? 'active' : ''
          }`}
          onClick={() => setType('youtube')}
        >
          YouTube
        </button>

        <button
          type="button"
          className={`popup-tab ${
            type === 'vimeo' ? 'active' : ''
          }`}
          onClick={() => setType('vimeo')}
        >
          Vimeo
        </button>

        <button
          type="button"
          className={`popup-tab ${
            type === 'direct' ? 'active' : ''
          }`}
          onClick={() => setType('direct')}
        >
          Direct URL
        </button>
      </div>

      <input
        value={url}
        onChange={(e) =>
          setUrl(e.target.value)
        }
        placeholder={
          type === 'youtube'
            ? 'https://youtube.com/watch?v=...'
            : type === 'vimeo'
            ? 'https://vimeo.com/...'
            : 'https://example.com/video.mp4'
        }
        className="s-input"
        style={{ marginBottom: 12 }}
      />

      <button
        type="button"
        onClick={insert}
        className="s-btn s-btn-full"
      >
        Insert Video
      </button>

      <button
        type="button"
        onClick={onClose}
        style={{
          marginTop: 10,
          width: '100%',
          padding: 8,
          background: 'transparent',
          color: 'var(--text-faint)',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        Cancel
      </button>
    </div>
  );
}

/* =========================================================
   TABLE POPUP
========================================================= */

function TablePopover({ onInsert, onClose }) {
  const [rows, setRows] = useState(3);
  const [columns, setColumns] = useState(3);

  const insertTable = () => {
    const safeRows = Math.min(
      Math.max(Number(rows) || 1, 1),
      20
    );

    const safeColumns = Math.min(
      Math.max(Number(columns) || 1, 1),
      10
    );

    let html = `
      <table>
        <thead>
          <tr>
    `;

    for (let c = 0; c < safeColumns; c++) {
      html += `<th>Header ${c + 1}</th>`;
    }

    html += `
          </tr>
        </thead>
        <tbody>
    `;

    for (let r = 0; r < safeRows; r++) {
      html += '<tr>';

      for (let c = 0; c < safeColumns; c++) {
        html += '<td>Content</td>';
      }

      html += '</tr>';
    }

    html += `
        </tbody>
      </table>
    `;

    onInsert(html);
    onClose();
  };

  return (
    <div className="media-popup">
      <div className="popup-title">
        📊 Insert Table
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
        }}
      >
        <div>
          <label
            style={{
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            Rows
          </label>

          <input
            type="number"
            min="1"
            max="20"
            value={rows}
            onChange={(e) =>
              setRows(e.target.value)
            }
            className="s-input"
            style={{ marginTop: 5 }}
          />
        </div>

        <div>
          <label
            style={{
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            Columns
          </label>

          <input
            type="number"
            min="1"
            max="10"
            value={columns}
            onChange={(e) =>
              setColumns(e.target.value)
            }
            className="s-input"
            style={{ marginTop: 5 }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={insertTable}
        className="s-btn s-btn-full"
        style={{ marginTop: 10 }}
      >
        Insert Table
      </button>

      <button
        type="button"
        onClick={onClose}
        style={{
          marginTop: 10,
          width: '100%',
          padding: 8,
          background: 'transparent',
          color: 'var(--text-faint)',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Cancel
      </button>
    </div>
  );
}

/* =========================================================
   RICH TEXT EDITOR
========================================================= */

function RichTextEditor({
  value,
  onChange,
  onImageClick,
}) {
  const editorRef = useRef(null);

  const [imagePopup, setImagePopup] =
    useState(false);

  const [videoPopup, setVideoPopup] =
    useState(false);

  const [tablePopup, setTablePopup] =
    useState(false);

  const savedRange = useRef(null);

  useEffect(() => {
    if (
      editorRef.current &&
      editorRef.current.innerHTML !==
        (value || '')
    ) {
      editorRef.current.innerHTML =
        value || '';
    }
  }, [value]);

  const emit = () => {
    if (editorRef.current) {
      onChange(
        editorRef.current.innerHTML
      );
    }
  };

  const saveSelection = () => {
    const editor = editorRef.current;

    if (!editor) return;

    const selection = window.getSelection();

    if (
      !selection ||
      selection.rangeCount === 0
    ) {
      return;
    }

    const range =
      selection.getRangeAt(0);

    if (
      editor.contains(
        range.commonAncestorContainer
      )
    ) {
      savedRange.current =
        range.cloneRange();
    }
  };

  const restoreSelection = () => {
    const editor = editorRef.current;

    if (!editor) return;

    editor.focus();

    const selection = window.getSelection();

    if (savedRange.current) {
      selection.removeAllRanges();
      selection.addRange(
        savedRange.current
      );
    }
  };

  const exec = (
    command,
    valueArg = null
  ) => {
    restoreSelection();

    document.execCommand(
      command,
      false,
      valueArg
    );

    emit();
  };

  const insertHTML = (html) => {
    restoreSelection();

    document.execCommand(
      'insertHTML',
      false,
      html
    );

    emit();
  };

  const insertImageHtml = (src) => {
    const safeSrc = String(src).replace(
      /"/g,
      '&quot;'
    );

    insertHTML(`
      <img
        src="${safeSrc}"
        alt="Article image"
        style="
          max-width:100%;
          width:400px;
          height:auto;
          display:block;
          margin:18px auto;
          border-radius:8px;
        "
      />
    `);
  };

  const handlePaste = (e) => {
    const items =
      e.clipboardData?.items;

    if (!items) return;

    for (
      let i = 0;
      i < items.length;
      i++
    ) {
      const item = items[i];

      if (
        item.type.startsWith('image/')
      ) {
        e.preventDefault();

        const file =
          item.getAsFile();

        if (!file) return;

        const reader =
          new FileReader();

        reader.onload = () => {
          insertImageHtml(
            reader.result
          );
        };

        reader.readAsDataURL(file);

        return;
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files =
      e.dataTransfer?.files;

    if (!files?.length) return;

    Array.from(files).forEach(
      (file) => {
        if (
          !file.type.startsWith(
            'image/'
          )
        ) {
          return;
        }

        const reader =
          new FileReader();

        reader.onload = () => {
          insertImageHtml(
            reader.result
          );
        };

        reader.readAsDataURL(file);
      }
    );
  };

  const insertLink = () => {
    saveSelection();

    const url = window.prompt(
      'Enter URL:',
      'https://'
    );

    if (!url) return;

    if (
      !/^https?:\/\//i.test(url)
    ) {
      alert(
        'Please enter a valid URL starting with http:// or https://'
      );

      return;
    }

    restoreSelection();

    document.execCommand(
      'createLink',
      false,
      url
    );

    emit();
  };

  const insertHorizontalRule = () => {
    insertHTML('<hr />');
  };

  const insertCode = () => {
    insertHTML(
      '<pre style="background:#0f172a;color:#fff;padding:16px;border-radius:8px;overflow:auto;"><code>Write code here...</code></pre>'
    );
  };

  const clearFormatting = () => {
    restoreSelection();

    document.execCommand(
      'removeFormat',
      false,
      null
    );

    document.execCommand(
      'unlink',
      false,
      null
    );

    emit();
  };

  const handleEditorClick = (e) => {
    if (
      e.target.tagName === 'IMG' &&
      onImageClick
    ) {
      onImageClick(
        e.target.src
      );
    }
  };

  const closeAllPopups = () => {
    setImagePopup(false);
    setVideoPopup(false);
    setTablePopup(false);
  };

  const toolbarButton = (
    label,
    title,
    callback
  ) => (
    <button
      type="button"
      title={title}
      className="editor-btn"
      onMouseDown={(e) =>
        e.preventDefault()
      }
      onClick={callback}
    >
      {label}
    </button>
  );

  return (
    <div className="article-editor">
      <div className="editor-toolbar">

        <select
          className="editor-select"
          defaultValue=""
          onMouseDown={
            saveSelection
          }
          onChange={(e) => {
            if (!e.target.value)
              return;

            exec(
              'formatBlock',
              e.target.value
            );

            e.target.value = '';
          }}
        >
          <option
            value=""
            disabled
          >
            Format
          </option>

          <option value="<p>">
            Paragraph
          </option>

          <option value="<h1>">
            Heading 1
          </option>

          <option value="<h2>">
            Heading 2
          </option>

          <option value="<h3>">
            Heading 3
          </option>

          <option value="<h4>">
            Heading 4
          </option>

          <option value="<blockquote>">
            Quote
          </option>
        </select>

        <div className="editor-divider" />

        {toolbarButton(
          'B',
          'Bold',
          () => exec('bold')
        )}

        {toolbarButton(
          'I',
          'Italic',
          () => exec('italic')
        )}

        {toolbarButton(
          'U',
          'Underline',
          () => exec('underline')
        )}

        {toolbarButton(
          'S',
          'Strikethrough',
          () =>
            exec('strikeThrough')
        )}

        <div className="editor-divider" />

        {toolbarButton(
          '⬅',
          'Align Left',
          () =>
            exec('justifyLeft')
        )}

        {toolbarButton(
          '⬌',
          'Align Center',
          () =>
            exec('justifyCenter')
        )}

        {toolbarButton(
          '➡',
          'Align Right',
          () =>
            exec('justifyRight')
        )}

        {toolbarButton(
          '↔',
          'Justify',
          () =>
            exec('justifyFull')
        )}

        <div className="editor-divider" />

        {toolbarButton(
          '• List',
          'Bullet List',
          () =>
            exec(
              'insertUnorderedList'
            )
        )}

        {toolbarButton(
          '1. List',
          'Numbered List',
          () =>
            exec(
              'insertOrderedList'
            )
        )}

        {toolbarButton(
          '←',
          'Decrease Indent',
          () => exec('outdent')
        )}

        {toolbarButton(
          '→',
          'Increase Indent',
          () => exec('indent')
        )}

        <div className="editor-divider" />

        <div
          style={{
            position: 'relative',
          }}
        >
          {toolbarButton(
            '🖼',
            'Insert Image',
            () => {
              closeAllPopups();
              saveSelection();
              setImagePopup(true);
            }
          )}

          {imagePopup && (
            <ImageSourcePopover
              onInsert={
                insertImageHtml
              }
              onClose={() =>
                setImagePopup(false)
              }
            />
          )}
        </div>

        <div
          style={{
            position: 'relative',
          }}
        >
          {toolbarButton(
            '🎥',
            'Insert Video',
            () => {
              closeAllPopups();
              saveSelection();
              setVideoPopup(true);
            }
          )}

          {videoPopup && (
            <VideoSourcePopover
              onInsert={insertHTML}
              onClose={() =>
                setVideoPopup(false)
              }
            />
          )}
        </div>

        <div
          style={{
            position: 'relative',
          }}
        >
          {toolbarButton(
            '📊',
            'Insert Table',
            () => {
              closeAllPopups();
              saveSelection();
              setTablePopup(true);
            }
          )}

          {tablePopup && (
            <TablePopover
              onInsert={insertHTML}
              onClose={() =>
                setTablePopup(false)
              }
            />
          )}
        </div>

        {toolbarButton(
          '🔗',
          'Insert Link',
          insertLink
        )}

        {toolbarButton(
          '❝',
          'Block Quote',
          () =>
            exec(
              'formatBlock',
              '<blockquote>'
            )
        )}

        {toolbarButton(
          '―',
          'Horizontal Line',
          insertHorizontalRule
        )}

        {toolbarButton(
          '</>',
          'Code Block',
          insertCode
        )}

        <div className="editor-divider" />

        <input
          type="color"
          className="color-input"
          title="Text Color"
          onMouseDown={
            saveSelection
          }
          onChange={(e) =>
            exec(
              'foreColor',
              e.target.value
            )
          }
        />

        <input
          type="color"
          className="color-input"
          title="Highlight Color"
          defaultValue="#fff59d"
          onMouseDown={
            saveSelection
          }
          onChange={(e) =>
            exec(
              'hiliteColor',
              e.target.value
            )
          }
        />

        <div className="editor-divider" />

        {toolbarButton(
          '↺',
          'Undo',
          () => exec('undo')
        )}

        {toolbarButton(
          '↻',
          'Redo',
          () => exec('redo')
        )}

        {toolbarButton(
          '✕',
          'Clear Formatting',
          clearFormatting
        )}
      </div>

      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Start writing your story here..."
        onInput={emit}
        onBlur={() => {
          emit();
          saveSelection();
        }}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={(e) =>
          e.preventDefault()
        }
        onClick={
          handleEditorClick
        }
      />
    </div>
  );
}

/* =========================================================
   STORIES LIST
========================================================= */

export function StoriesList() {
  const [stories, setStories] =
    useState([]);

  const [total, setTotal] =
    useState(0);

  const [page, setPage] =
    useState(1);

  const [search, setSearch] =
    useState('');

  const [filterCat, setFilterCat] =
    useState('');

  const [filterStatus, setFilterStatus] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const { can } = useAuth();

  const load = async () => {
    setLoading(true);

    try {
      const params = {
        page,
        limit: 12,
        search,
        status:
          filterStatus || undefined,
      };

      if (filterCat) {
        params.category = filterCat;
      }

      const res =
        await storiesAPI.getAll(
          params
        );

      setStories(
        res.data?.stories || []
      );

      setTotal(
        res.data?.total || 0
      );
    } catch (err) {
      console.error(
        'Failed to load stories:',
        err
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [
    page,
    filterCat,
    filterStatus,
  ]);

  const handleDelete = async (
    id
  ) => {
    if (
      !window.confirm(
        'Delete this story?'
      )
    ) {
      return;
    }

    try {
      await storiesAPI.delete(id);
      load();
    } catch (err) {
      alert(
        err.response?.data?.error ||
          'Failed to delete story.'
      );
    }
  };

  return (
    <AdminLayout>
      <ResponsiveStyles />

      <div className="s-container">
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            marginBottom: 28,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <h1
            style={{
              fontWeight: 800,
              fontSize: '1.8rem',
              margin: 0,
              letterSpacing:
                '-0.03em',
              color:
                'var(--text-main)',
            }}
          >
            Content Library
          </h1>

          <Link
            to="/admin/stories/new"
            className="s-btn"
          >
            + New Story
          </Link>
        </div>

        <div
          className="s-card"
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter')
                load();
            }}
            placeholder="Search headlines..."
            className="s-input"
            style={{
              flex: '1 1 200px',
              marginBottom: 0,
            }}
          />

          <select
            value={filterCat}
            onChange={(e) => {
              setFilterCat(
                e.target.value
              );
              setPage(1);
            }}
            className="s-select"
            style={{
              flex: '1 1 150px',
              marginBottom: 0,
            }}
          >
            <option value="">
              All Categories
            </option>

            {CATEGORIES.map(
              (category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              )
            )}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(
                e.target.value
              );
              setPage(1);
            }}
            className="s-select"
            style={{
              flex: '1 1 150px',
              marginBottom: 0,
            }}
          >
            <option value="">
              All Status
            </option>

            <option value="published">
              Published
            </option>

            <option value="draft">
              Draft
            </option>

            <option value="scheduled">
              Scheduled
            </option>
          </select>

          <button
            onClick={load}
            className="s-btn"
          >
            Search
          </button>
        </div>

        <div className="s-table-scroll">
          {loading ? (
            <div
              style={{
                padding: 60,
                textAlign: 'center',
                color: '#94a3b8',
              }}
            >
              Loading...
            </div>
          ) : (
            <table className="s-table">
              <thead>
                <tr>
                  {[
                    '',
                    'Headline',
                    'Category',
                    'Author',
                    'Views',
                    'Status',
                    'Date',
                    'Actions',
                  ].map(
                    (heading) => (
                      <th key={heading}>
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {stories.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        padding: 50,
                        textAlign:
                          'center',
                        color:
                          '#94a3b8',
                      }}
                    >
                      No stories found.
                    </td>
                  </tr>
                ) : (
                  stories.map(
                    (story) => (
                      <tr
                        key={story.id}
                      >
                        <td>
                          <img
                            src={getImgUrl(
                              story.image
                            )}
                            alt=""
                            style={{
                              width: 56,
                              height: 56,
                              borderRadius:
                                12,
                              objectFit:
                                'cover',
                            }}
                            onError={(
                              e
                            ) => {
                              e.currentTarget.onerror =
                                null;

                              e.currentTarget.src =
                                PLACEHOLDER;
                            }}
                          />
                        </td>

                        <td>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 14,
                              overflow:
                                'hidden',
                              textOverflow:
                                'ellipsis',
                              whiteSpace:
                                'nowrap',
                              marginBottom: 2,
                              color:
                                'var(--text-main)',
                            }}
                          >
                            {story.title}
                          </div>

                          <div
                            style={{
                              fontSize: 12,
                              color:
                                'var(--text-faint)',
                            }}
                          >
                            ID: {story.id}
                          </div>
                        </td>

                        <td>
                          <span
                            className="badge"
                            style={{
                              background:
                                '#f1f5f9',
                              color:
                                '#475569',
                            }}
                          >
                            {
                              story.category
                            }
                          </span>
                        </td>

                        <td
                          style={{
                            color:
                              'var(--text-muted)',
                            fontWeight: 500,
                          }}
                        >
                          {
                            story.author
                          }
                        </td>

                        <td
                          style={{
                            fontWeight: 700,
                            color:
                              '#0369a1',
                          }}
                        >
                          {Number(
                            story.views ||
                              0
                          ).toLocaleString()}
                        </td>

                        <td>
                          <span
                            className="badge"
                            style={{
                              background:
                                story.status ===
                                'published'
                                  ? '#dcfce7'
                                  : story.status ===
                                    'scheduled'
                                  ? '#e0f2fe'
                                  : '#f1f5f9',

                              color:
                                story.status ===
                                'published'
                                  ? '#166534'
                                  : story.status ===
                                    'scheduled'
                                  ? '#0369a1'
                                  : '#475569',
                            }}
                          >
                            {story.status?.toUpperCase()}
                          </span>
                        </td>

                        <td
                          style={{
                            fontSize: 12,
                            color:
                              'var(--text-faint)',
                          }}
                        >
                          {story.created_at
                            ? new Date(
                                story.created_at
                              ).toLocaleDateString()
                            : '-'}
                        </td>

                        <td>
                          <div
                            style={{
                              display:
                                'flex',
                              gap: 6,
                              flexWrap:
                                'nowrap',
                            }}
                          >
                            <Link
                              to={`/story/${story.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="s-btn s-btn-outline"
                              style={{
                                padding:
                                  '6px 10px',
                                fontSize: 12,
                              }}
                            >
                              View
                            </Link>

                            <Link
                              to={`/admin/stories/edit/${story.id}`}
                              className="s-btn"
                              style={{
                                padding:
                                  '6px 10px',
                                fontSize: 12,
                              }}
                            >
                              Edit
                            </Link>

                            {can(
                              'delete_content'
                            ) && (
                              <button
                                onClick={() =>
                                  handleDelete(
                                    story.id
                                  )
                                }
                                className="s-btn s-btn-danger"
                              >
                                Del
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          )}

          {!loading && (
            <div
              style={{
                padding:
                  '16px 20px',
                borderTop:
                  '1px solid #f1f5f9',
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color:
                    'var(--text-faint)',
                  fontWeight: 600,
                }}
              >
                {total} total stories
              </span>

              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  flexWrap:
                    'wrap',
                }}
              >
                {[
                  ...Array(
                    Math.ceil(
                      total / 12
                    )
                  ).keys(),
                ]
                  .slice(0, 8)
                  .map((i) => (
                    <button
                      key={i}
                      onClick={() =>
                        setPage(
                          i + 1
                        )
                      }
                      className="s-btn"
                      style={{
                        padding:
                          '6px 12px',
                        background:
                          page ===
                          i + 1
                            ? 'linear-gradient(135deg,var(--primary),var(--primary-light))'
                            : '#fff',
                        color:
                          page ===
                          i + 1
                            ? '#fff'
                            : '#475569',
                        border:
                          page ===
                          i + 1
                            ? 'none'
                            : '2px solid var(--border)',
                        fontSize: 13,
                        borderRadius: 8,
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

/* =========================================================
   STORY FORM
========================================================= */

export function StoryForm() {
  const { id } = useParams();

  const isEdit = Boolean(id);

  const navigate = useNavigate();

  const [authors, setAuthors] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [preview, setPreview] =
    useState(null);

  const fileRef = useRef(null);

  const [form, setForm] =
    useState({
      title: '',
      category: 'Business',
      subcategory: '',
      description: '',
      author_id: '',
      tags: '',
      meta_description: '',
      status: 'published',
      scheduled_at: '',
      featured: false,
    });

  /* =====================================================
     LOAD AUTHORS / STORY
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    authorsAPI
      .getAll()
      .then((response) => {
        if (!mounted) return;

        setAuthors(
          response.data || []
        );
      })
      .catch((err) => {
        console.error(
          'Failed to load authors:',
          err
        );
      });

    if (isEdit) {
      setLoading(true);

      storiesAPI
        .getOne(id)
        .then((response) => {
          if (!mounted) return;

          const story =
            response.data;

          setForm({
            title:
              story.title || '',
            category:
              story.category ||
              'Business',
            subcategory:
              story.subcategory ||
              '',
            description:
              story.description ||
              '',
            author_id:
              story.author_id ||
              '',
            tags:
              story.tags || '',
            meta_description:
              story.meta_description ||
              '',
            status:
              story.status ||
              'published',
            scheduled_at:
              story.scheduled_at
                ? story.scheduled_at.slice(
                    0,
                    16
                  )
                : '',
            featured:
              Boolean(
                story.featured
              ),
          });

          if (story.image) {
            setPreview(
              getImgUrl(
                story.image
              )
            );
          }
        })
        .catch((err) => {
          console.error(
            'Failed to load story:',
            err
          );

          setError(
            'Failed to load this story.'
          );
        })
        .finally(() => {
          if (mounted) {
            setLoading(false);
          }
        });
    }

    return () => {
      mounted = false;
    };
  }, [id, isEdit]);

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError('');

    try {
      if (!form.title.trim()) {
        throw new Error(
          'Story headline is required.'
        );
      }

      if (
        !form.description.trim()
      ) {
        throw new Error(
          'Story content is required.'
        );
      }

      if (!form.author_id) {
        throw new Error(
          'Please select an author.'
        );
      }

      const formData =
        new FormData();

      Object.entries(form).forEach(
        ([key, value]) => {
          formData.append(
            key,
            value === null ||
              value === undefined
              ? ''
              : value
          );
        }
      );

      if (
        fileRef.current?.files?.[0]
      ) {
        formData.append(
          'image',
          fileRef.current.files[0]
        );
      }

      if (isEdit) {
        await storiesAPI.update(
          id,
          formData
        );
      } else {
        await storiesAPI.create(
          formData
        );
      }

      navigate('/admin/stories');
    } catch (err) {
      console.error(
        'Story save error:',
        err
      );

      setError(
        err.response?.data?.error ||
          err.message ||
          'Failed to save story.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentImageClick = (
    src
  ) => {
    if (!src) return;

    window.open(
      src,
      '_blank',
      'noopener,noreferrer'
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <ResponsiveStyles />

        <div
          style={{
            padding: 60,
            textAlign: 'center',
            color: '#94a3b8',
          }}
        >
          Loading...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <ResponsiveStyles />

      <div className="s-container">

        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            marginBottom: 28,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                fontWeight: 800,
                fontSize: '1.8rem',
                margin: 0,
                letterSpacing:
                  '-0.03em',
                color:
                  'var(--text-main)',
              }}
            >
              {isEdit
                ? 'Edit Story'
                : 'Publish New Story'}
            </h1>

            <p
              style={{
                margin:
                  '6px 0 0',
                color:
                  'var(--text-muted)',
                fontSize: 13,
              }}
            >
              Create a modern,
              multimedia news article.
            </p>
          </div>

          <Link
            to="/admin/stories"
            className="s-btn s-btn-outline"
          >
            ← Back
          </Link>
        </div>

        {error && (
          <div
            style={{
              background: '#fef2f2',
              color: '#b91c1c',
              padding:
                '14px 18px',
              borderRadius: 12,
              marginBottom: 24,
              fontSize: 14,
              fontWeight: 600,
              border:
                '1px solid #fca5a5',
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
        >
          <div
            className="grid-1 grid-form-table"
            style={{
              display: 'grid',
            }}
          >

            <div
              style={{
                display: 'flex',
                flexDirection:
                  'column',
                gap: 24,
              }}
            >

              <div className="s-card">

                <div className="s-input-group">
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm(
                        (current) => ({
                          ...current,
                          title:
                            e.target.value,
                        })
                      )
                    }
                    required
                    placeholder=" "
                    id="headline"
                    className="s-input"
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                    }}
                  />

                  <label
                    htmlFor="headline"
                    className="s-floating-label"
                  >
                    Story Headline *
                  </label>
                </div>

                <div
                  style={{
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      alignItems:
                        'center',
                      marginBottom: 8,
                      flexWrap:
                        'wrap',
                      gap: 8,
                    }}
                  >
                    <label
                      style={{
                        fontWeight: 700,
                        fontSize: 12,
                        color:
                          'var(--text-muted)',
                        textTransform:
                          'uppercase',
                        letterSpacing:
                          '.05em',
                      }}
                    >
                      Article Content *
                    </label>

                    <span
                      style={{
                        fontSize: 11,
                        color:
                          'var(--text-faint)',
                      }}
                    >
                      Rich multimedia
                      editor
                    </span>
                  </div>

                  <RichTextEditor
                    value={
                      form.description
                    }
                    onChange={(
                      html
                    ) =>
                      setForm(
                        (current) => ({
                          ...current,
                          description:
                            html,
                        })
                      )
                    }
                    onImageClick={
                      handleDocumentImageClick
                    }
                  />

                  <p
                    style={{
                      fontSize: 11,
                      color:
                        'var(--text-faint)',
                      marginTop: 8,
                      fontWeight: 500,
                    }}
                  >
                    Supports images,
                    YouTube, Vimeo,
                    videos, tables,
                    links, headings,
                    quotes, lists,
                    colors and more.
                  </p>
                </div>

                <div
                  className="s-input-group"
                  style={{
                    marginBottom: 0,
                  }}
                >
                  <textarea
                    value={
                      form.meta_description
                    }
                    onChange={(e) =>
                      setForm(
                        (current) => ({
                          ...current,
                          meta_description:
                            e.target.value,
                        })
                      )
                    }
                    placeholder=" "
                    id="meta"
                    rows={3}
                    className="s-input"
                    style={{
                      resize:
                        'vertical',
                    }}
                  />

                  <label
                    htmlFor="meta"
                    className="s-floating-label"
                    style={{
                      top: 18,
                      transform:
                        'translateY(0)',
                    }}
                  >
                    Meta / SEO Description
                  </label>
                </div>
              </div>

              <div className="s-card">

                <label
                  style={{
                    display: 'block',
                    marginBottom: 12,
                    fontWeight: 700,
                    fontSize: 12,
                    color:
                      'var(--text-muted)',
                    textTransform:
                      'uppercase',
                    letterSpacing:
                      '.05em',
                  }}
                >
                  Featured Image{' '}
                  {!isEdit && '*'}
                </label>

                <div
                  onClick={() =>
                    fileRef.current?.click()
                  }
                  style={{
                    border:
                      '2px dashed var(--border)',
                    borderRadius: 16,
                    padding: preview
                      ? 12
                      : 40,
                    textAlign:
                      'center',
                    cursor: 'pointer',
                    background:
                      'var(--bg-subtle)',
                  }}
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="Featured preview"
                      style={{
                        maxHeight: 260,
                        maxWidth:
                          '100%',
                        borderRadius: 10,
                        margin:
                          '0 auto',
                        display:
                          'block',
                        objectFit:
                          'cover',
                      }}
                      onError={(e) => {
                        e.currentTarget.src =
                          PLACEHOLDER;
                      }}
                    />
                  ) : (
                    <>
                      <div
                        style={{
                          fontSize: 36,
                          marginBottom: 12,
                          opacity: 0.5,
                        }}
                      >
                        🖼️
                      </div>

                      <p
                        style={{
                          fontSize: 14,
                          color:
                            'var(--text-muted)',
                          margin: 0,
                          fontWeight: 600,
                        }}
                      >
                        Click to upload
                        featured image
                      </p>

                      <p
                        style={{
                          fontSize: 11,
                          color:
                            'var(--text-faint)',
                        }}
                      >
                        JPG, PNG, WEBP
                      </p>
                    </>
                  )}
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{
                    display: 'none',
                  }}
                  onChange={(e) => {
                    const file =
                      e.target
                        .files?.[0];

                    if (!file) return;

                    setPreview(
                      URL.createObjectURL(
                        file
                      )
                    );
                  }}
                />
              </div>
            </div>

            <div
              className="sidebar-section"
              style={{
                display: 'flex',
                flexDirection:
                  'column',
                gap: 24,
              }}
            >

              <div className="s-card">

                <h3 className="s-card-title">
                  ⚙️ Publish Settings
                </h3>

                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm(
                      (current) => ({
                        ...current,
                        status:
                          e.target.value,
                      })
                    )
                  }
                  className="s-select"
                >
                  <option value="published">
                    Published
                  </option>

                  <option value="draft">
                    Draft
                  </option>

                  <option value="scheduled">
                    Scheduled
                  </option>
                </select>

                {form.status ===
                  'scheduled' && (
                  <div className="s-input-group">
                    <input
                      type="datetime-local"
                      value={
                        form.scheduled_at
                      }
                      onChange={(e) =>
                        setForm(
                          (current) => ({
                            ...current,
                            scheduled_at:
                              e.target.value,
                          })
                        )
                      }
                      id="sched"
                      className="s-input"
                    />

                    <label
                      htmlFor="sched"
                      className="s-floating-label"
                      style={{
                        top: 10,
                        transform:
                          'translateY(0)',
                        fontSize: 10,
                      }}
                    >
                      Schedule Date
                    </label>
                  </div>
                )}

                <label
                  style={{
                    display: 'flex',
                    alignItems:
                      'center',
                    gap: 10,
                    cursor: 'pointer',
                    marginBottom: 20,
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={
                      form.featured
                    }
                    onChange={(e) =>
                      setForm(
                        (current) => ({
                          ...current,
                          featured:
                            e.target.checked,
                        })
                      )
                    }
                    style={{
                      width: 18,
                      height: 18,
                      accentColor:
                        'var(--primary)',
                    }}
                  />

                  Featured Story
                </label>

                <button
                  type="submit"
                  disabled={saving}
                  className="s-btn s-btn-full"
                >
                  {saving
                    ? 'Saving...'
                    : isEdit
                    ? 'Update Story'
                    : 'Publish Story'}
                </button>
              </div>

              <div className="s-card">

                <h3 className="s-card-title">
                  🏷️ Categorization
                </h3>

                <select
                  value={
                    form.category
                  }
                  onChange={(e) =>
                    setForm(
                      (current) => ({
                        ...current,
                        category:
                          e.target.value,
                      })
                    )
                  }
                  required
                  className="s-select"
                >
                  {CATEGORIES.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>

                <div className="s-input-group">
                  <input
                    value={
                      form.subcategory
                    }
                    onChange={(e) =>
                      setForm(
                        (current) => ({
                          ...current,
                          subcategory:
                            e.target.value,
                        })
                      )
                    }
                    placeholder=" "
                    id="subcat"
                    className="s-input"
                  />

                  <label
                    htmlFor="subcat"
                    className="s-floating-label"
                  >
                    Subcategory
                  </label>
                </div>

                <div
                  className="s-input-group"
                  style={{
                    marginBottom: 0,
                  }}
                >
                  <input
                    value={form.tags}
                    onChange={(e) =>
                      setForm(
                        (current) => ({
                          ...current,
                          tags: e.target.value,
                        })
                      )
                    }
                    placeholder=" "
                    id="tags"
                    className="s-input"
                  />

                  <label
                    htmlFor="tags"
                    className="s-floating-label"
                  >
                    Tags
                    (comma-separated)
                  </label>
                </div>
              </div>

              <div className="s-card">

                <h3 className="s-card-title">
                  ✍️ Author
                </h3>

                <select
                  value={
                    form.author_id
                  }
                  onChange={(e) =>
                    setForm(
                      (current) => ({
                        ...current,
                        author_id:
                          e.target.value,
                      })
                    )
                  }
                  required
                  className="s-select"
                >
                  <option value="">
                    Select Author *
                  </option>

                  {authors.map(
                    (author) => (
                      <option
                        key={author.id}
                        value={author.id}
                      >
                        {author.name}
                      </option>
                    )
                  )}
                </select>

                <Link
                  to="/admin/authors"
                  style={{
                    fontSize: 13,
                    color:
                      'var(--primary)',
                    fontWeight: 700,
                    textDecoration:
                      'none',
                  }}
                >
                  + Add new author
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default StoryForm;

