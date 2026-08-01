import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { authorsAPI, commentsAPI, videosAPI, adsAPI, subscribeAPI, analyticsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const inputStyle = { width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 14 };
const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13, color: '#334155' };

function Card({ children, style }) {
  return <div style={{ background: '#fff', padding: 24, borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,.03)', ...style }}>{children}</div>;
}

// ─── AUTHORS ─────────────────────────────────────────────────────────────────
export function Authors() {
  const [authors, setAuthors] = useState([]);
  const [form, setForm] = useState({ name: '', bio: '', email: '', twitter: '' });
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();
  const { can } = useAuth();

  const load = () => authorsAPI.getAll().then(r => setAuthors(r.data || []));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (fileRef.current?.files[0]) fd.append('profile_image', fileRef.current.files[0]);
    await authorsAPI.create(fd);
    setForm({ name: '', bio: '', email: '', twitter: '' });
    load();
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete author?')) return;
    await authorsAPI.delete(id);
    load();
  };

  return (
    <AdminLayout>
      <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: '0 0 24px', letterSpacing: '-0.03em' }}>Author Profiles</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24 }}>
        <Card>
          <h3 style={{ fontWeight: 800, margin: '0 0 20px', fontSize: '1rem' }}>Add New Author</h3>
          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>Full Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required placeholder="Author name…" style={inputStyle} />
            <label style={labelStyle}>Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="author@mfn.com" style={inputStyle} />
            <label style={labelStyle}>Twitter</label>
            <input value={form.twitter} onChange={e => setForm(f => ({...f, twitter: e.target.value}))} placeholder="@username" style={inputStyle} />
            <label style={labelStyle}>Bio</label>
            <textarea value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} rows={4} placeholder="Short biography…" style={{ ...inputStyle, resize: 'vertical' }} />
            <label style={labelStyle}>Profile Image</label>
            <input ref={fileRef} type="file" accept="image/*" style={{ ...inputStyle, padding: '8px 12px' }} />
            <button type="submit" disabled={saving} style={{ width: '100%', background: '#1a472a', color: '#fff', border: 'none', padding: '12px', borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
              {saving ? 'Creating…' : 'Create Author'}
            </button>
          </form>
        </Card>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>{['Photo','Name','Email','Stories','Actions'].map(h => (
                <th key={h} style={{ padding: '14px 16px', background: '#f8fafc', color: '#64748b', fontSize: 11, textTransform: 'uppercase', fontWeight: 800, borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {authors.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <img src={a.profile_image?.startsWith('http') ? a.profile_image : `${process.env.REACT_APP_API_URL?.replace('/api','')}/uploads/${a.profile_image?.replace('uploads/','')}` || '/placeholder.jpg'} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} onError={e => e.target.src='/placeholder.jpg'} />
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{a.name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{a.bio?.substring(0,50)}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#475569' }}>{a.email || '—'}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0369a1' }}>{a.story_count} stories</td>
                  <td style={{ padding: '14px 16px' }}>
                    {can('manage_authors') && (
                      <button onClick={() => handleDelete(a.id)} style={{ padding: '5px 12px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </AdminLayout>
  );
}

// ─── COMMENTS ────────────────────────────────────────────────────────────────
export function Comments() {
  const [comments, setComments] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const { can } = useAuth();

  const load = async () => {
    setLoading(true);
    commentsAPI.getAll({ status, limit: 30 }).then(r => { setComments(r.data.comments || []); setTotal(r.data.total || 0); setLoading(false); });
  };
  useEffect(() => { load(); }, [status]);

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: 0 }}>Comments</h1>
        <span style={{ background: '#fef9c3', color: '#854d0e', padding: '6px 14px', borderRadius: 8, fontWeight: 700, fontSize: 13 }}>{total} {status}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['pending','approved','spam'].map(s => (
          <button key={s} onClick={() => setStatus(s)} style={{ padding: '8px 18px', background: status === s ? '#1a472a' : '#fff', color: status === s ? '#fff' : '#64748b', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13, textTransform: 'capitalize', fontFamily: 'inherit' }}>{s}</button>
        ))}
      </div>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading…</div> : (
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>{['Author','Story','Comment','Date','Actions'].map(h => (
                <th key={h} style={{ padding: '14px 16px', background: '#f8fafc', color: '#64748b', fontSize: 11, textTransform: 'uppercase', fontWeight: 800, borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {comments.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{c.email}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#475569', maxWidth: 160 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.story_title}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, maxWidth: 300 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.comment}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {status === 'pending' && can('approve_comments') && (
                        <button onClick={async () => { await commentsAPI.approve(c.id); load(); }} style={{ padding: '5px 10px', background: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>✓ Approve</button>
                      )}
                      {can('delete_content') && (
                        <button onClick={async () => { if (window.confirm('Delete?')) { await commentsAPI.delete(c.id); load(); } }} style={{ padding: '5px 10px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {comments.length === 0 && <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No {status} comments</td></tr>}
            </tbody>
          </table>
        )}
      </Card>
    </AdminLayout>
  );
}

// ─── VIDEOS ──────────────────────────────────────────────────────────────────
export function Videos() {
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState({ title: '', youtube_url: '', category: 'Sport' });
  const fileRef = useRef();
  const [saving, setSaving] = useState(false);

  const load = () => videosAPI.getAll({ limit: 50 }).then(r => setVideos(r.data || []));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (fileRef.current?.files[0]) fd.append('thumbnail', fileRef.current.files[0]);
    await videosAPI.create(fd);
    setForm({ title: '', youtube_url: '', category: 'Sport' });
    load();
    setSaving(false);
  };

  return (
    <AdminLayout>
      <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: '0 0 24px' }}>Videos</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24 }}>
        <Card>
          <h3 style={{ fontWeight: 800, margin: '0 0 20px', fontSize: '1rem' }}>Add YouTube Video</h3>
          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required placeholder="Video title…" style={inputStyle} />
            <label style={labelStyle}>YouTube URL *</label>
            <input value={form.youtube_url} onChange={e => setForm(f => ({...f, youtube_url: e.target.value}))} required placeholder="https://youtube.com/watch?v=…" style={inputStyle} />
            <label style={labelStyle}>Category</label>
            <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} style={inputStyle}>
              {['Sport','Business','Technology','Health','Culture','Entertainment'].map(c => <option key={c}>{c}</option>)}
            </select>
            <label style={labelStyle}>Thumbnail</label>
            <input ref={fileRef} type="file" accept="image/*" style={{ ...inputStyle, padding: '8px 12px' }} />
            <button type="submit" disabled={saving} style={{ width: '100%', background: '#1a472a', color: '#fff', border: 'none', padding: '12px', borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
              {saving ? 'Saving…' : 'Add Video'}
            </button>
          </form>
        </Card>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>{['Thumb','Title','Category','Date','Action'].map(h => (
                <th key={h} style={{ padding: '14px 16px', background: '#f8fafc', color: '#64748b', fontSize: 11, textTransform: 'uppercase', fontWeight: 800, borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {videos.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    {v.thumbnail ? <img src={`${process.env.REACT_APP_API_URL?.replace('/api','')}/uploads/${v.thumbnail?.replace('uploads/','')}`} alt="" style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 6 }} onError={e => e.target.style.display='none'} /> : <div style={{ width: 80, height: 50, background: '#f1f5f9', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎬</div>}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 14 }}>{v.title}</td>
                  <td style={{ padding: '12px 16px' }}><span style={{ background: '#f1f5f9', padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{v.category}</span></td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>{new Date(v.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={async () => { if (window.confirm('Delete?')) { await videosAPI.delete(v.id); load(); } }} style={{ padding: '5px 10px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </AdminLayout>
  );
}

// ─── ADS ─────────────────────────────────────────────────────────────────────
export function Ads() {
  const [ads, setAds] = useState([]);
  const [form, setForm] = useState({ type: 'image', link: '', position: 'sidebar', text: '' });
  const fileRef = useRef();
  const [saving, setSaving] = useState(false);

  const load = () => adsAPI.getAll().then(r => setAds(r.data || []));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (fileRef.current?.files[0]) fd.append('file', fileRef.current.files[0]);
    await adsAPI.create(fd);
    setForm({ type: 'image', link: '', position: 'sidebar', text: '' });
    load();
    setSaving(false);
  };

  return (
    <AdminLayout>
      <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: '0 0 24px' }}>Advertisements</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24 }}>
        <Card>
          <h3 style={{ fontWeight: 800, margin: '0 0 20px', fontSize: '1rem' }}>Add Advertisement</h3>
          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>Type</label>
            <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} style={inputStyle}>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
            <label style={labelStyle}>Position</label>
            <select value={form.position} onChange={e => setForm(f => ({...f, position: e.target.value}))} style={inputStyle}>
              <option value="sidebar">Sidebar</option>
              <option value="inline">Inline / Center</option>
              <option value="top">Top Banner</option>
              <option value="popup">Popup</option>
            </select>
            <label style={labelStyle}>Link URL</label>
            <input value={form.link} onChange={e => setForm(f => ({...f, link: e.target.value}))} placeholder="https://…" style={inputStyle} />
            <label style={labelStyle}>Caption (optional)</label>
            <input value={form.text} onChange={e => setForm(f => ({...f, text: e.target.value}))} placeholder="Ad caption…" style={inputStyle} />
            <label style={labelStyle}>Media File *</label>
            <input ref={fileRef} type="file" accept="image/*,video/*" required style={{ ...inputStyle, padding: '8px 12px' }} />
            <button type="submit" disabled={saving} style={{ width: '100%', background: '#1a472a', color: '#fff', border: 'none', padding: '12px', borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
              {saving ? 'Uploading…' : 'Add Ad'}
            </button>
          </form>
        </Card>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>{['Preview','Type','Position','Link','Actions'].map(h => (
                <th key={h} style={{ padding: '14px 16px', background: '#f8fafc', color: '#64748b', fontSize: 11, textTransform: 'uppercase', fontWeight: 800, borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {ads.map(ad => (
                <tr key={ad.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    {ad.type === 'video'
                      ? <video src={`${process.env.REACT_APP_API_URL?.replace('/api','')}/uploads/${ad.file?.replace('uploads/','')}`} style={{ width: 100, height: 60, objectFit: 'cover', borderRadius: 6 }} muted />
                      : <img src={`${process.env.REACT_APP_API_URL?.replace('/api','')}/uploads/${ad.file?.replace('uploads/','')}`} alt="" style={{ width: 100, height: 60, objectFit: 'cover', borderRadius: 6 }} onError={e => e.target.style.display='none'} />
                    }
                  </td>
                  <td style={{ padding: '12px 16px' }}><span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{ad.type}</span></td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{ad.position}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#0369a1' }}><a href={ad.link} target="_blank" rel="noopener noreferrer" style={{ color: '#0369a1' }}>{ad.link?.substring(0,30)}…</a></td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={async () => { if (window.confirm('Delete ad?')) { await adsAPI.delete(ad.id); load(); } }} style={{ padding: '5px 10px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </AdminLayout>
  );
}

// ─── SUBSCRIBERS ─────────────────────────────────────────────────────────────
export function Subscribers() {
  const [subs, setSubs] = useState([]);
  useEffect(() => { subscribeAPI.getAll().then(r => setSubs(r.data || [])); }, []);

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: 0 }}>Subscribers</h1>
        <span style={{ background: '#dcfce7', color: '#166534', padding: '6px 16px', borderRadius: 8, fontWeight: 700, fontSize: 14 }}>{subs.filter(s => s.status === 'active').length} active</span>
      </div>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>{['Email','Name','Joined','Status'].map(h => (
              <th key={h} style={{ padding: '14px 16px', background: '#f8fafc', color: '#64748b', fontSize: 11, textTransform: 'uppercase', fontWeight: 800, borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {subs.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: 14 }}>{s.email}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#475569' }}>{s.name || '—'}</td>
                <td style={{ padding: '14px 16px', fontSize: 12, color: '#94a3b8' }}>{new Date(s.subscribed_at).toLocaleDateString()}</td>
                <td style={{ padding: '14px 16px' }}><span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: s.status === 'active' ? '#dcfce7' : '#f1f5f9', color: s.status === 'active' ? '#166534' : '#475569' }}>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AdminLayout>
  );
}

// ─── AUDIT LOGS ──────────────────────────────────────────────────────────────
export function AuditLogs() {
  const [logs, setLogs] = useState([]);
  useEffect(() => { analyticsAPI.getAuditLogs().then(r => setLogs(r.data || [])); }, []);

  return (
    <AdminLayout>
      <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: '0 0 24px' }}>Security Audit Logs</h1>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>{['User','Action','IP','Timestamp'].map(h => (
              <th key={h} style={{ padding: '14px 16px', background: '#f8fafc', color: '#64748b', fontSize: 11, textTransform: 'uppercase', fontWeight: 800, borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: 14 }}>{l.username}</td>
                <td style={{ padding: '14px 16px', fontSize: 14 }}>{l.action}</td>
                <td style={{ padding: '14px 16px', fontSize: 12, color: '#94a3b8' }}>{l.ip_address || '—'}</td>
                <td style={{ padding: '14px 16px', fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>{new Date(l.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AdminLayout>
  );
}
