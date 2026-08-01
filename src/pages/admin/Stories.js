import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { storiesAPI, authorsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['Business','Sport','Technology','Health','Culture','Environment','Le Phare','Music','Transport','Education','Opinion'];

// ─── RESPONSIVE STYLES ──────────────────────────────────────────────────────
const ResponsiveStyles = () => (
  <style>{`
    /* Enforce Times New Roman, 12px inside the editor */
    .rich-editor p, .rich-editor div, .rich-editor span, 
    .rich-editor h1, .rich-editor h2, .rich-editor h3, .rich-editor h4, .rich-editor li {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12px;
    }
    .rich-editor h1 { font-size: 18px; font-weight: bold; }
    .rich-editor h2 { font-size: 16px; font-weight: bold; }
    .rich-editor h3 { font-size: 14px; font-weight: bold; }

    /* Responsive Grid Layouts */
    @media (max-width: 900px) {
      .story-form-grid { grid-template-columns: 1fr !important; }
      .sidebar-section { order: -1; } /* Move publish settings to top on mobile */
    }
    
    /* Responsive Table */
    .stories-table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .stories-table { min-width: 800px; }
    
    /* Image constraints inside editor */
    .rich-editor img { 
      max-width: 100%; 
      width: 400px; 
      height: auto; 
      display: block; 
      margin: 10px auto; 
      cursor: pointer; 
      border-radius: 4px; 
    }
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: 0, letterSpacing: '-0.03em' }}>Content Library</h1>
        <Link to="/admin/stories/new" style={{ background: '#1a472a', color: '#fff', padding: '10px 22px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap' }}>+ New Story</Link>
      </div>

      {/* Filters - Responsive Flexbox */}
      <div style={{ background: '#fff', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} placeholder="Search headlines…" style={{ flex: '1 1 200px', padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
        <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1); }} style={{ flex: '1 1 150px', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit', background: '#fff' }}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} style={{ flex: '1 1 150px', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit', background: '#fff' }}>
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
        </select>
        <button onClick={load} style={{ padding: '10px 22px', background: '#1a472a', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Search</button>
      </div>

      <div className="stories-table-wrapper" style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,.03)' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>
        ) : (
          <table className="stories-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>{['', 'Headline', 'Category', 'Author', 'Views', 'Status', 'Date', 'Actions'].map(h => (
                <th key={h} style={{ padding: '14px 16px', background: '#f8fafc', color: '#64748b', fontSize: 11, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '.05em', borderBottom: '1px solid #e2e8f0', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {stories.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <img src={s.image?.startsWith('http') ? s.image : `${process.env.REACT_APP_API_URL?.replace('/api','')}/uploads/${s.image?.replace('uploads/','')}` || '/placeholder.jpg'} alt="" style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover' }} onError={e => e.target.src='/placeholder.jpg'} />
                  </td>
                  <td style={{ padding: '12px 16px', maxWidth: 280 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>ID: {s.id}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>{s.category}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569', whiteSpace: 'nowrap' }}>{s.author}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: '#0369a1' }}>{Number(s.views||0).toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: s.status === 'published' ? '#dcfce7' : s.status === 'scheduled' ? '#e0f2fe' : '#f1f5f9', color: s.status === 'published' ? '#166534' : s.status === 'scheduled' ? '#0369a1' : '#475569', whiteSpace: 'nowrap' }}>{s.status?.toUpperCase()}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>{new Date(s.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap' }}>
                      <Link to={`/story/${s.id}`} target="_blank" style={{ padding: '5px 10px', fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 6, color: '#475569', textDecoration: 'none' }}>View</Link>
                      <Link to={`/admin/stories/edit/${s.id}`} style={{ padding: '5px 10px', fontSize: 12, background: '#1a472a', color: '#fff', borderRadius: 6, textDecoration: 'none', border: 'none' }}>Edit</Link>
                      {can('delete_content') && (
                        <button onClick={() => handleDelete(s.id)} style={{ padding: '5px 10px', fontSize: 12, background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' }}>Del</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>{total} total stories</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[...Array(Math.ceil(total / 12)).keys()].slice(0, 8).map(i => (
                <button key={i} onClick={() => setPage(i+1)} style={{ padding: '6px 12px', background: page === i+1 ? '#1a472a' : '#fff', color: page === i+1 ? '#fff' : '#475569', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 13 }}>{i+1}</button>
              ))}
            </div>
          </div>
        )}
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
    <div style={{ position: 'absolute', zIndex: 20, top: 40, left: 0, width: 280, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,.12)', padding: 14 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
        <button type="button" onClick={() => setMode('device')} style={{ flex: 1, padding: '7px 8px', borderRadius: 6, border: '1px solid #e2e8f0', background: mode === 'device' ? '#1a472a' : '#fff', color: mode === 'device' ? '#fff' : '#334155', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>From Device</button>
        <button type="button" onClick={() => setMode('link')} style={{ flex: 1, padding: '7px 8px', borderRadius: 6, border: '1px solid #e2e8f0', background: mode === 'link' ? '#1a472a' : '#fff', color: mode === 'link' ? '#fff' : '#334155', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>Image Link</button>
      </div>
      {mode === 'device' ? (
        <div onClick={() => localFileRef.current?.click()} style={{ border: '2px dashed #e2e8f0', borderRadius: 8, padding: '16px 10px', textAlign: 'center', cursor: 'pointer', background: '#f8fafc' }}>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Click to choose images</p>
          <input ref={localFileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
        </div>
      ) : (
        <div>
          <input value={linkValue} onChange={e => setLinkValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleLinkInsert())} placeholder="https://..." style={{ width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, outline: 'none', boxSizing: 'border-box', marginBottom: 8 }} />
          <button type="button" onClick={handleLinkInsert} style={{ width: '100%', padding: '8px 10px', background: '#1a472a', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Insert</button>
        </div>
      )}
      <button type="button" onClick={onClose} style={{ marginTop: 8, width: '100%', padding: '6px 10px', background: 'transparent', color: '#94a3b8', border: 'none', fontSize: 11, cursor: 'pointer' }}>Cancel</button>
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
    if (savedRange.current) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
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
          e.preventDefault();
          const file = items[i].getAsFile();
          const reader = new FileReader();
          reader.onload = () => insertImageHtml(reader.result);
          reader.readAsDataURL(file);
          return;
        }
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = () => insertImageHtml(reader.result);
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const handleEditorClick = (e) => {
    if (e.target.tagName === 'IMG') {
      if (onImageClick) onImageClick(e.target.src);
    }
  };

  const btn = (label, title, onClick) => (
    <button type="button" title={title} onMouseDown={e => e.preventDefault()} onClick={onClick} style={{ minWidth: 28, height: 28, padding: '0 6px', border: '1px solid #e2e8f0', background: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#334155' }}>{label}</button>
  );

  const divider = <div style={{ width: 1, height: 18, background: '#e2e8f0', margin: '0 2px' }} />;

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'visible', background: '#fff' }}>
      <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', padding: '6px 8px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', borderRadius: '8px 8px 0 0' }}>
        <select onMouseDown={e => e.preventDefault()} onChange={e => { exec('formatBlock', e.target.value); e.target.value = ''; }} defaultValue="" style={{ height: 28, border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 11, fontFamily: "'Times New Roman', serif", color: '#334155', background: '#fff' }}>
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
        
        {btn('🔗', 'Insert Link', () => {
          saveSelection();
          const url = window.prompt('Enter URL:', 'https://');
          if (url) { restoreSelection(); exec('createLink', url); }
        })}
        
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
        style={{
          minHeight: 350, padding: '16px 20px', 
          fontFamily: "'Times New Roman', Times, serif",
          fontSize: '12px',
          lineHeight: 1.5,
          color: '#1e293b', outline: 'none', overflowY: 'auto'
        }}
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
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v === null ? '' : v));
      if (fileRef.current?.files[0]) fd.append('image', fileRef.current.files[0]);
      if (isEdit) await storiesAPI.update(id, fd);
      else await storiesAPI.create(fd);
      navigate('/admin/stories');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDocumentImageClick = (src) => {
    window.open(src, '_blank'); // Opens image in new tab
  };

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, outline: 'none', fontFamily: "'Times New Roman', Times, serif", boxSizing: 'border-box' };
  const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 12, color: '#334155', fontFamily: "'Times New Roman', Times, serif" };

  if (loading) return <AdminLayout><div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>Loading…</div></AdminLayout>;

  return (
    <AdminLayout>
      <ResponsiveStyles />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: 0, letterSpacing: '-0.03em' }}>{isEdit ? 'Edit Story' : 'Publish New Story'}</h1>
        <Link to="/admin/stories" style={{ fontSize: 14, color: '#64748b', textDecoration: 'none', whiteSpace: 'nowrap' }}>← Back</Link>
      </div>

      {error && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '14px 18px', borderRadius: 10, marginBottom: 20, fontSize: 12, fontFamily: "'Times New Roman', serif" }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="story-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
          
          {/* Main Content Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: '#fff', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Story Headline *</label>
                <input 
                  value={form.title} 
                  onChange={e => setForm(f => ({...f, title: e.target.value}))} 
                  required 
                  placeholder="Write a compelling headline…" 
                  style={{ ...inputStyle, fontSize: 14, fontWeight: 'bold', padding: '12px 14px' }} 
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Content Body *</label>
                <RichTextEditor
                  value={form.description}
                  onChange={html => setForm(f => ({ ...f, description: html }))}
                  onImageClick={handleDocumentImageClick}
                />
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, fontFamily: "'Times New Roman', serif" }}>Times New Roman 12pt enforced. You can paste, drag & drop, or use the 🖼 button to insert images directly.</p>
              </div>
              <div>
                <label style={labelStyle}>Meta Description</label>
                <textarea value={form.meta_description} onChange={e => setForm(f => ({...f, meta_description: e.target.value}))} rows={3} placeholder="SEO description…" style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
            </div>

            {/* Featured Image */}
            <div style={{ background: '#fff', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <label style={labelStyle}>Featured Image {!isEdit && '*'}</label>
              <div onClick={() => fileRef.current?.click()} style={{ border: '2px dashed #e2e8f0', borderRadius: 10, padding: '28px', textAlign: 'center', cursor: 'pointer', background: '#f8fafc' }}>
                {preview ? <img src={preview} alt="" style={{ maxHeight: 180, borderRadius: 6, margin: '0 auto', display: 'block' }} /> : (
                  <>
                    <div style={{ fontSize: 28, marginBottom: 8, opacity: .5 }}>🖼</div>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Click to upload image</p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) setPreview(URL.createObjectURL(e.target.files[0])); }} />
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="sidebar-section" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: '#fff', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontWeight: 800, fontSize: 13, margin: '0 0 16px', color: '#0f172a', fontFamily: "'Times New Roman', serif" }}>Publish Settings</h3>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))} style={inputStyle}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              {form.status === 'scheduled' && (
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Schedule Date</label>
                  <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({...f, scheduled_at: e.target.value}))} style={inputStyle} />
                </div>
              )}
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 14, fontFamily: "'Times New Roman', serif", fontSize: 12 }}>
                <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({...f, featured: e.target.checked}))} style={{ width: 16, height: 16, accentColor: '#1a472a' }} />
                <span style={{ fontWeight: 600 }}>Featured Story</span>
              </label>
              <button type="submit" disabled={saving} style={{ width: '100%', background: saving ? '#94a3b8' : '#1a472a', color: '#fff', border: 'none', padding: '12px', borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'Times New Roman', serif" }}>
                {saving ? 'Saving…' : isEdit ? 'Update Story' : 'Publish Story'}
              </button>
            </div>

            <div style={{ background: '#fff', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontWeight: 800, fontSize: 13, margin: '0 0 16px', color: '#0f172a', fontFamily: "'Times New Roman', serif" }}>Categorization</h3>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Category *</label>
                <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} required style={inputStyle}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Subcategory</label>
                <input value={form.subcategory} onChange={e => setForm(f => ({...f, subcategory: e.target.value}))} placeholder="Optional sub-topic" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Tags</label>
                <input value={form.tags} onChange={e => setForm(f => ({...f, tags: e.target.value}))} placeholder="Rwanda, Kigali, sport…" style={inputStyle} />
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, fontFamily: "'Times New Roman', serif" }}>Comma-separated</p>
              </div>
            </div>

            <div style={{ background: '#fff', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontWeight: 800, fontSize: 13, margin: '0 0 16px', color: '#0f172a', fontFamily: "'Times New Roman', serif" }}>Author</h3>
              <select value={form.author_id} onChange={e => setForm(f => ({...f, author_id: e.target.value}))} required style={inputStyle}>
                <option value="">Select Author *</option>
                {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <Link to="/admin/authors" style={{ display: 'block', marginTop: 8, fontSize: 12, color: '#1a472a', fontWeight: 600, fontFamily: "'Times New Roman', serif" }}>+ Add new author</Link>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}