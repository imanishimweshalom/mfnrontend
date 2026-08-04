import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { storiesAPI, authorsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['Business','Sport','Technology','Health','Culture','Environment','Le Phare','Music','Transport','Education','Opinion'];

// ─── RESPONSIVE & MODERN STYLES ──────────────────────────────────────────────
const ResponsiveStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    
    :root { --primary: #1a472a; --primary-light: #2d6a4f; --bg-card: #ffffff; --bg-subtle: #f8fafc; --border: #e2e8f0; --text-main: #0f172a; --text-muted: #64748b; --text-faint: #94a3b8; }
    
    .s-container { font-family: 'Plus Jakarta Sans', sans-serif; animation: fadeIn .4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    /* Grids - Mobile First */
    .grid-1 { display: grid; grid-template-columns: 1fr; gap: 24px; }
    @media (min-width: 1024px) { .grid-form-table { grid-template-columns: 1fr 380px; } .sidebar-section { order: 1; } }
    @media (max-width: 1023px) { .sidebar-section { order: -1; } /* Move publish settings to top on mobile */ }

    /* Cards */
    .s-card { background: var(--bg-card); padding: 28px; border-radius: 20px; border: 1px solid var(--border); box-shadow: 0 4px 15px rgba(0,0,0,.03); margin-bottom: 24px; transition: box-shadow .3s; }
    .s-card:hover { box-shadow: 0 8px 25px rgba(0,0,0,.06); }
    .s-card-title { font-weight: 800; margin: 0 0 24px; font-size: 1.05rem; display: flex; align-items: center; gap: 10px; color: var(--text-main); }

    /* Inputs - Modern Floating */
    .s-input-group { position: relative; margin-bottom: 20px; }
    .s-input { width: 100%; padding: 20px 16px 8px 16px; border: 2px solid var(--border); border-radius: 12px; font-size: 14px; outline: none; font-family: inherit; box-sizing: border-box; transition: border-color .2s, box-shadow .2s; background: transparent; color: var(--text-main); font-weight: 600; }
    .s-input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(26, 71, 42, 0.1); }
    .s-floating-label { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-faint); font-size: 14px; pointer-events: none; transition: all .2s ease; font-weight: 500; }
    .s-input:focus ~ .s-floating-label, .s-input:not(:placeholder-shown) ~ .s-floating-label { top: 10px; transform: translateY(0); font-size: 10px; color: var(--primary); font-weight: 700; text-transform: uppercase; letter-spacing: .05em; }
    .s-select { width: 100%; padding: 14px 16px; border: 2px solid var(--border); border-radius: 12px; font-size: 14px; outline: none; font-family: inherit; box-sizing: border-box; background: #fff; font-weight: 600; color: var(--text-main); appearance: none; margin-bottom: 20px; }

    /* Buttons */
    .s-btn { background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%); color: #fff; border: none; padding: 14px 24px; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; font-family: inherit; transition: all .2s; box-shadow: 0 4px 6px -1px rgba(26, 71, 42, 0.2); display: inline-flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; white-space: nowrap; }
    .s-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(26, 71, 42, 0.3); }
    .s-btn:disabled { background: var(--text-faint); cursor: not-allowed; box-shadow: none; }
    .s-btn-full { width: 100%; justify-content: center; }
    .s-btn-outline { background: transparent; border: 2px solid var(--border); color: var(--text-muted); box-shadow: none; }
    .s-btn-outline:hover { border-color: var(--primary); color: var(--primary); }
    .s-btn-danger { background: #fef2f2; color: #ef4444; border: 1px solid #fca5a5; box-shadow: none; padding: 8px 14px; font-size: 12px; border-radius: 8px; }
    
    /* Table */
    .s-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; background: #fff; border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 4px 15px rgba(0,0,0,.03); }
    .s-table { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 800px; }
    .s-table thead th { padding: 14px 16px; background: var(--bg-subtle); color: var(--text-muted); font-size: 11px; text-transform: uppercase; font-weight: 800; letterSpacing: .05em; borderBottom: '1px solid var(--border)'; textAlign: 'left'; whiteSpace: 'nowrap'; }
    .s-table tbody tr { transition: background .2s; }
    .s-table tbody tr:hover { background: #f8fafc; }
    .s-table tbody td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }

    /* Badges */
    .badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; display: inline-block; white-space: nowrap; }

    /* Enforce Times New Roman, 12px inside the editor */
    .rich-editor p, .rich-editor div, .rich-editor span, .rich-editor h1, .rich-editor h2, .rich-editor h3, .rich-editor h4, .rich-editor li { font-family: 'Times New Roman', Times, serif !important; font-size: 12px !important; }
    .rich-editor h1 { font-size: 18px !important; font-weight: bold !important; }
    .rich-editor h2 { font-size: 16px !important; font-weight: bold !important; }
    .rich-editor h3 { font-size: 14px !important; font-weight: bold !important; }
    .rich-editor img { max-width: 100%; width: 400px; height: auto; display: block; margin: 10px auto; cursor: pointer; border-radius: 4px; }
  `}</style>
);

// ─── STORIES LIST ────────────────────────────────────────────────────────────
export function StoriesList() {
  const [stories, setStories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const { can } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, search, status: filterStatus || undefined };
      if (filterCat) params.category = filterCat;
      const res = await storiesAPI.getAll(params);
      setStories(res.data.stories || []);
      setTotal(res.data.total || 0);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, filterCat, filterStatus]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this story?')) return;
    await storiesAPI.delete(id);
    load();
  };

  return (
    <AdminLayout>
      <ResponsiveStyles />
      <div className="s-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontWeight: 800, fontSize: '1.8rem', margin: 0, letterSpacing: '-0.03em', color: 'var(--text-main)' }}>Content Library</h1>
          <Link to="/admin/stories/new" className="s-btn">+ New Story</Link>
        </div>

        <div className="s-card" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', padding: 20, marginBottom: 24 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} placeholder="Search headlines…" className="s-input" style={{ flex: '1 1 200px', marginBottom: 0 }} />
          <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1); }} className="s-select" style={{ flex: '1 1 150px', marginBottom: 0 }}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="s-select" style={{ flex: '1 1 150px', marginBottom: 0 }}>
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
          <button onClick={load} className="s-btn" style={{ flexShrink: 0 }}>Search</button>
        </div>

        <div className="s-table-scroll">
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>
          ) : (
            <table className="s-table">
              <thead>
                <tr>{['', 'Headline', 'Category', 'Author', 'Views', 'Status', 'Date', 'Actions'].map(h => (<th key={h}>{h}</th>))}</tr>
              </thead>
              <tbody>
                {stories.map(s => (
                  <tr key={s.id}>
                    <td><img src={s.image?.startsWith('http') ? s.image : `${process.env.REACT_APP_API_URL?.replace('/api','')}/uploads/${s.image?.replace('uploads/','')}` || '/placeholder.jpg'} alt="" style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover' }} onError={e => e.target.src='/placeholder.jpg'} /></td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2, color: 'var(--text-main)' }}>{s.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>ID: {s.id}</div>
                    </td>
                    <td><span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>{s.category}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{s.author}</td>
                    <td style={{ fontWeight: 700, color: '#0369a1' }}>{Number(s.views||0).toLocaleString()}</td>
                    <td>
                      <span className="badge" style={{ background: s.status === 'published' ? '#dcfce7' : s.status === 'scheduled' ? '#e0f2fe' : '#f1f5f9', color: s.status === 'published' ? '#166534' : s.status === 'scheduled' ? '#0369a1' : '#475569' }}>
                        {s.status?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-faint)' }}>{new Date(s.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
                        <Link to={`/story/${s.id}`} target="_blank" className="s-btn s-btn-outline" style={{ padding: '6px 10px', fontSize: 12 }}>View</Link>
                        <Link to={`/admin/stories/edit/${s.id}`} className="s-btn" style={{ padding: '6px 10px', fontSize: 12 }}>Edit</Link>
                        {can('delete_content') && (<button onClick={() => handleDelete(s.id)} className="s-btn s-btn-danger">Del</button>)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && (
            <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--text-faint)', fontWeight: 600 }}>{total} total stories</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {[...Array(Math.ceil(total / 12)).keys()].slice(0, 8).map(i => (
                  <button key={i} onClick={() => setPage(i+1)} className="s-btn" style={{ padding: '6px 12px', background: page === i+1 ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)' : '#fff', color: page === i+1 ? '#fff' : '#475569', border: page === i+1 ? 'none' : '2px solid var(--border)', fontSize: 13, borderRadius: 8 }}>{i+1}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

// ─── SMALL IMAGE-SOURCE POPOVER ─────────────────────────────────────────────
function ImageSourcePopover({ onInsert, onClose }) {
  const [mode, setMode] = useState('device');
  const [linkValue, setLinkValue] = useState('https://');
  const localFileRef = useRef();

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => onInsert(reader.result);
      reader.readAsDataURL(file);
    });
    onClose();
  };

  const handleLinkInsert = () => {
    if (!linkValue || linkValue === 'https://') return;
    onInsert(linkValue);
    onClose();
  };

  return (
    <div style={{ position: 'absolute', zIndex: 20, top: 44, left: 0, width: 280, background: '#fff', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 12px 28px rgba(0,0,0,.15)', padding: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        <button type="button" onClick={() => setMode('device')} className={mode === 'device' ? 's-btn s-btn-full' : 's-btn s-btn-outline s-btn-full'} style={{padding: '8px'}}>Device</button>
        <button type="button" onClick={() => setMode('link')} className={mode === 'link' ? 's-btn s-btn-full' : 's-btn s-btn-outline s-btn-full'} style={{padding: '8px'}}>Link</button>
      </div>
      {mode === 'device' ? (
        <div onClick={() => localFileRef.current?.click()} style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '20px 10px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-subtle)' }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Click to choose images</p>
          <input ref={localFileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
        </div>
      ) : (
        <div>
          <input value={linkValue} onChange={e => setLinkValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleLinkInsert())} placeholder="https://..." className="s-input" style={{ marginBottom: 10 }} />
          <button type="button" onClick={handleLinkInsert} className="s-btn s-btn-full">Insert</button>
        </div>
      )}
      <button type="button" onClick={onClose} style={{ marginTop: 10, width: '100%', padding: '8px', background: 'transparent', color: 'var(--text-faint)', border: 'none', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
    </div>
  );
}

// ─── RICH TEXT TOOLBAR ───────────────────────────────────────────────────────
function RichTextEditor({ value, onChange, onImageClick }) {
  const editorRef = useRef();
  const [imagePopoverOpen, setImagePopoverOpen] = useState(false);
  const savedRange = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const emit = () => onChange(editorRef.current.innerHTML);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) savedRange.current = sel.getRangeAt(0);
  };

  const restoreSelection = () => {
    editorRef.current.focus();
    const sel = window.getSelection();
    if (savedRange.current) { sel.removeAllRanges(); sel.addRange(savedRange.current); }
  };

  const exec = (cmd, val = null) => {
    editorRef.current.focus();
    document.execCommand(cmd, false, val);
    emit();
  };

  const insertImageHtml = (src) => {
    restoreSelection();
    const imgHtml = `<img src="${src}" style="max-width:100%; width:400px; height:auto; display:block; margin:10px auto; cursor:pointer; border-radius:4px;" alt="document image" />`;
    exec('insertHTML', imgHtml);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault(); const file = items[i].getAsFile(); const reader = new FileReader();
          reader.onload = () => insertImageHtml(reader.result); reader.readAsDataURL(file); return;
        }
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) { const reader = new FileReader(); reader.onload = () => insertImageHtml(reader.result); reader.readAsDataURL(file); }
      });
    }
  };

  const handleEditorClick = (e) => { if (e.target.tagName === 'IMG' && onImageClick) onImageClick(e.target.src); };

  const btn = (label, title, onClick, isActive = false) => (
    <button type="button" title={title} onMouseDown={e => e.preventDefault()} onClick={onClick} style={{ minWidth: 32, height: 32, padding: '0 8px', border: 'none', background: isActive ? '#e2e8f0' : 'transparent', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'var(--text-main)', transition: 'background .2s' }}>{label}</button>
  );

  const divider = <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />;

  return (
    <div style={{ border: '2px solid var(--border)', borderRadius: 12, overflow: 'visible', background: '#fff', transition: 'border-color .2s, box-shadow .2s' }}>
      <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', padding: '8px 10px', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', borderRadius: '10px 10px 0 0' }}>
        <select onMouseDown={e => e.preventDefault()} onChange={e => { exec('formatBlock', e.target.value); e.target.value = ''; }} defaultValue="" style={{ height: 32, border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, fontFamily: "'Times New Roman', serif", color: 'var(--text-main)', background: '#fff', padding: '0 8px', fontWeight: 600 }}>
          <option value="" disabled>Format</option>
          <option value="<p>">Normal (12px)</option>
          <option value="<h2>">Heading 2 (16px)</option>
          <option value="<h3>">Heading 3 (14px)</option>
          <option value="<blockquote>">Quote</option>
        </select>
        {divider}
        {btn('B', 'Bold', () => exec('bold'))}
        {btn('I', 'Italic', () => exec('italic'))}
        {btn('U', 'Underline', () => exec('underline'))}
        {divider}
        {btn('⬅', 'Align Left', () => exec('justifyLeft'))}
        {btn('⬌', 'Align Center', () => exec('justifyCenter'))}
        {btn('➡', 'Align Right', () => exec('justifyRight'))}
        {divider}
        {btn('• List', 'Bullet List', () => exec('insertUnorderedList'))}
        {btn('1. List', 'Numbered List', () => exec('insertOrderedList'))}
        {divider}
        <div style={{ position: 'relative' }}>
          {btn('🖼', 'Insert Image', () => { saveSelection(); setImagePopoverOpen(true); })}
          {imagePopoverOpen && <ImageSourcePopover onInsert={insertImageHtml} onClose={() => setImagePopoverOpen(false)} />}
        </div>
        {btn('🔗', 'Insert Link', () => { saveSelection(); const url = window.prompt('Enter URL:', 'https://'); if (url) { restoreSelection(); exec('createLink', url); } })}
        {divider}
        {btn('↺', 'Undo', () => exec('undo'))}
        {btn('↻', 'Redo', () => exec('redo'))}
      </div>

      <div
        ref={editorRef}
        className="rich-editor"
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={() => { emit(); saveSelection(); }}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={handleEditorClick}
        style={{ minHeight: 350, padding: '20px 24px', fontFamily: "'Times New Roman', Times, serif", fontSize: '12px', lineHeight: 1.6, color: '#1e293b', outline: 'none', overflowY: 'auto' }}
      />
    </div>
  );
}

// ─── CREATE / EDIT STORY ─────────────────────────────────────────────────────
export function StoryForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();
  const [form, setForm] = useState({
    title: '', category: 'Business', subcategory: '', description: '',
    author_id: '', tags: '', meta_description: '', status: 'published',
    scheduled_at: '', featured: false,
  });

  useEffect(() => {
    authorsAPI.getAll().then(r => setAuthors(r.data || []));
    if (isEdit) {
      setLoading(true);
      storiesAPI.getOne(id).then(r => {
        const s = r.data;
        setForm({
          title: s.title || '', category: s.category || 'Business', subcategory: s.subcategory || '',
          description: s.description || '', author_id: s.author_id || '', tags: s.tags || '',
          meta_description: s.meta_description || '', status: s.status || 'published',
          scheduled_at: s.scheduled_at ? s.scheduled_at.slice(0,16) : '', featured: Boolean(s.featured),
        });
        if (s.image) {
          setPreview(s.image.startsWith('http') ? s.image : `${process.env.REACT_APP_API_URL?.replace('/api','')}/uploads/${s.image.replace('uploads/','')}`);
        }
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v === null ? '' : v));
      if (fileRef.current?.files[0]) fd.append('image', fileRef.current.files[0]);
      if (isEdit) await storiesAPI.update(id, fd);
      else await storiesAPI.create(fd);
      navigate('/admin/stories');
    } catch (err) { setError(err.response?.data?.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDocumentImageClick = (src) => { window.open(src, '_blank'); };

  if (loading) return <AdminLayout><div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>Loading…</div></AdminLayout>;

  return (
    <AdminLayout>
      <ResponsiveStyles />
      <div className="s-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontWeight: 800, fontSize: '1.8rem', margin: 0, letterSpacing: '-0.03em', color: 'var(--text-main)' }}>{isEdit ? 'Edit Story' : 'Publish New Story'}</h1>
          <Link to="/admin/stories" className="s-btn s-btn-outline">← Back</Link>
        </div>

        {error && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '14px 18px', borderRadius: 12, marginBottom: 24, fontSize: 14, fontWeight: 600, border: '1px solid #fca5a5' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid-1 grid-form-table" style={{ display: 'grid' }}>
            
            {/* Main Content Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="s-card">
                <div className="s-input-group">
                  <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required placeholder=" " id="headline" className="s-input" style={{ fontSize: 16, fontWeight: 700 }} />
                  <label htmlFor="headline" className="s-floating-label">Story Headline *</label>
                </div>
                
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Content Body *</label>
                  <RichTextEditor value={form.description} onChange={html => setForm(f => ({ ...f, description: html }))} onImageClick={handleDocumentImageClick} />
                  <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 8, fontWeight: 500 }}>Times New Roman 12pt enforced. Paste, drag & drop, or use 🖼 to insert images.</p>
                </div>

                <div className="s-input-group" style={{ marginBottom: 0 }}>
                  <textarea value={form.meta_description} onChange={e => setForm(f => ({...f, meta_description: e.target.value}))} placeholder=" " id="meta" rows={3} className="s-input" style={{ resize: 'vertical' }} />
                  <label htmlFor="meta" className="s-floating-label" style={{ top: 18, transform: 'translateY(0)' }}>Meta / SEO Description</label>
                </div>
              </div>

              <div className="s-card">
                <label style={{ display: 'block', marginBottom: 12, fontWeight: 700, fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Featured Image {!isEdit && '*'}</label>
                <div onClick={() => fileRef.current?.click()} style={{ border: '2px dashed var(--border)', borderRadius: 16, padding: preview ? 12 : 40, textAlign: 'center', cursor: 'pointer', background: 'var(--bg-subtle)', transition: 'all .2s' }}>
                  {preview ? <img src={preview} alt="" style={{ maxHeight: 240, borderRadius: 10, margin: '0 auto', display: 'block' }} /> : (
                    <>
                      <div style={{ fontSize: 32, marginBottom: 12, opacity: .5 }}>🖼</div>
                      <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>Click to upload image</p>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) setPreview(URL.createObjectURL(e.target.files[0])); }} />
              </div>
            </div>

            {/* Sidebar Settings */}
            <div className="sidebar-section" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="s-card">
                <h3 className="s-card-title">⚙️ Publish Settings</h3>
                <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))} className="s-select" style={{ marginBottom: 20 }}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                </select>
                
                {form.status === 'scheduled' && (
                  <div className="s-input-group">
                    <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({...f, scheduled_at: e.target.value}))} placeholder=" " id="sched" className="s-input" />
                    <label htmlFor="sched" className="s-floating-label">Schedule Date</label>
                  </div>
                )}
                
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 20, fontSize: 14, fontWeight: 600 }}>
                  <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({...f, featured: e.target.checked}))} style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }} />
                  Featured Story
                </label>
                
                <button type="submit" disabled={saving} className="s-btn s-btn-full">
                  {saving ? 'Saving…' : isEdit ? 'Update Story' : 'Publish Story'}
                </button>
              </div>

              <div className="s-card">
                <h3 className="s-card-title">🏷️ Categorization</h3>
                <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} required className="s-select" style={{ marginBottom: 20 }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                
                <div className="s-input-group">
                  <input value={form.subcategory} onChange={e => setForm(f => ({...f, subcategory: e.target.value}))} placeholder=" " id="subcat" className="s-input" />
                  <label htmlFor="subcat" className="s-floating-label">Subcategory</label>
                </div>

                <div className="s-input-group" style={{ marginBottom: 0 }}>
                  <input value={form.tags} onChange={e => setForm(f => ({...f, tags: e.target.value}))} placeholder=" " id="tags" className="s-input" />
                  <label htmlFor="tags" className="s-floating-label">Tags (comma-separated)</label>
                </div>
              </div>

              <div className="s-card">
                <h3 className="s-card-title">✍️ Author</h3>
                <select value={form.author_id} onChange={e => setForm(f => ({...f, author_id: e.target.value}))} required className="s-select" style={{ marginBottom: 12 }}>
                  <option value="">Select Author *</option>
                  {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <Link to="/admin/authors" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>+ Add new author</Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
