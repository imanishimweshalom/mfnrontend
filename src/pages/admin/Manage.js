import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import {
  authorsAPI,
  commentsAPI,
  videosAPI,
  adsAPI,
  subscribeAPI,
  analyticsAPI
} from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

// Fix: Centralized API base and secure image URL getter
const API_BASE =
  process.env.REACT_APP_API_URL?.replace('/api', '') ||
  'https://mahokofridaynewsbackend.onrender.com';

const PLACEHOLDER = `${API_BASE}/uploads/placeholder.jpg`;

const getImgUrl = (path) => {
  if (!path || typeof path !== 'string') return PLACEHOLDER;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.includes('..')) return PLACEHOLDER;

  const cleanPath = path
    .replace(/^uploads?\//, '')
    .replace(/^\/+/, '');

  return `${API_BASE}/uploads/${cleanPath}`;
};

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  fontSize: 14,
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  marginBottom: 14
};

const labelStyle = {
  display: 'block',
  marginBottom: 6,
  fontWeight: 700,
  fontSize: 13,
  color: '#334155'
};

function Card({ children, style, className }) {
  return (
    <div
      className={`admin-card-base ${className || ''}`}
      style={{
        background: '#fff',
        padding: 24,
        borderRadius: 20,
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 15px rgba(0,0,0,.03)',
        ...style
      }}
    >
      {children}
    </div>
  );
}

// Inject responsive CSS (Mobile-First)
const responsiveCSS = `
  .admin-form-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .admin-table-scroll {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .admin-table-scroll table {
    min-width: 640px;
  }

  .admin-flex-wrap {
    flex-wrap: wrap;
  }

  .admin-card-base {
    padding: 16px !important;
  }

  .author-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, .65);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 9999;
    overflow-y: auto;
  }

  .author-modal {
    width: 100%;
    max-width: 680px;
    max-height: 92vh;
    overflow-y: auto;
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 25px 70px rgba(0,0,0,.25);
  }

  .author-modal-header {
    position: sticky;
    top: 0;
    z-index: 2;
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 22px;
    border-bottom: 1px solid #e2e8f0;
  }

  .author-modal-body {
    padding: 22px;
  }

  .author-section {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    margin-bottom: 12px;
    overflow: hidden;
  }

  .author-section-title {
    width: 100%;
    border: none;
    background: #f8fafc;
    padding: 13px 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    font-family: inherit;
    font-weight: 800;
    color: #334155;
  }

  .author-section-content {
    padding: 15px;
  }

  .author-social-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .author-action-buttons {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  @media (min-width: 768px) {
    .admin-form-grid {
      grid-template-columns: 360px 1fr;
      gap: 24px;
    }

    .admin-card-base {
      padding: 24px !important;
    }

    .author-social-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// AUTHORS
// ─────────────────────────────────────────────────────────────────────────────

const emptyAuthor = {
  name: '',
  bio: '',
  email: '',
  twitter: '',
  portfolio: '',
  linkedin: '',
  facebook: '',
  instagram: '',
  youtube: '',
  phone: '',
  location: '',
  expertise: '',
  achievements: ''
};

export function Authors() {
  const [authors, setAuthors] = useState([]);
  const [form, setForm] = useState(emptyAuthor);
  const [editForm, setEditForm] = useState(emptyAuthor);

  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editAuthor, setEditAuthor] = useState(null);

  const [openSection, setOpenSection] = useState('basic');

  const fileRef = useRef();
  const editFileRef = useRef();

  const { can } = useAuth();

  const load = async () => {
    try {
      const r = await authorsAPI.getAll();
      setAuthors(r.data || []);
    } catch (error) {
      console.error('Failed to load authors:', error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ─────────────────────────────────────────────
  // CREATE AUTHOR
  // ─────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const fd = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        fd.append(key, value || '');
      });

      if (fileRef.current?.files[0]) {
        fd.append('profile_image', fileRef.current.files[0]);
      }

      await authorsAPI.create(fd);

      setForm(emptyAuthor);

      if (fileRef.current) {
        fileRef.current.value = '';
      }

      await load();
    } catch (error) {
      console.error('Create author error:', error);
      alert(
        error?.response?.data?.message ||
        'Failed to create author.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────
  // OPEN EDIT MODAL
  // ─────────────────────────────────────────────

  const openEdit = (author) => {
    setEditAuthor(author);

    setEditForm({
      name: author.name || '',
      bio: author.bio || '',
      email: author.email || '',
      twitter: author.twitter || '',
      portfolio: author.portfolio || '',
      linkedin: author.linkedin || '',
      facebook: author.facebook || '',
      instagram: author.instagram || '',
      youtube: author.youtube || '',
      phone: author.phone || '',
      location: author.location || '',
      expertise: author.expertise || '',
      achievements: author.achievements || ''
    });

    setOpenSection('basic');
    setEditing(true);
  };

  // ─────────────────────────────────────────────
  // UPDATE AUTHOR
  // ─────────────────────────────────────────────

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editAuthor) return;

    try {
      setSaving(true);

      const fd = new FormData();

      Object.entries(editForm).forEach(([key, value]) => {
        fd.append(key, value || '');
      });

      if (editFileRef.current?.files[0]) {
        fd.append('profile_image', editFileRef.current.files[0]);
      }

      await authorsAPI.update(editAuthor.id, fd);

      setEditing(false);
      setEditAuthor(null);

      if (editFileRef.current) {
        editFileRef.current.value = '';
      }

      await load();
    } catch (error) {
      console.error('Update author error:', error);

      alert(
        error?.response?.data?.message ||
        'Failed to update author.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────
  // DELETE
  // ─────────────────────────────────────────────

  const handleDelete = async (id) => {
    if (!window.confirm('Delete author?')) return;

    try {
      await authorsAPI.delete(id);
      await load();
    } catch (error) {
      console.error('Delete author error:', error);

      alert(
        error?.response?.data?.message ||
        'Failed to delete author.'
      );
    }
  };

  // ─────────────────────────────────────────────
  // CLOSE MODAL
  // ─────────────────────────────────────────────

  const closeEdit = () => {
    if (saving) return;

    setEditing(false);
    setEditAuthor(null);
  };

  // ─────────────────────────────────────────────
  // COLLAPSIBLE SECTION
  // ─────────────────────────────────────────────

  const toggleSection = (section) => {
    setOpenSection(
      openSection === section ? '' : section
    );
  };

  // ─────────────────────────────────────────────
  // FORM SECTION
  // ─────────────────────────────────────────────

  const FormSection = ({
    title,
    id,
    children
  }) => (
    <div className="author-section">
      <button
        type="button"
        className="author-section-title"
        onClick={() => toggleSection(id)}
      >
        <span>{title}</span>
        <span>
          {openSection === id ? '−' : '+'}
        </span>
      </button>

      {openSection === id && (
        <div className="author-section-content">
          {children}
        </div>
      )}
    </div>
  );

  // ─────────────────────────────────────────────
  // AUTHOR FORM
  // ─────────────────────────────────────────────

  const AuthorForm = ({
    data,
    setData,
    imageRef,
    isEdit = false
  }) => (
    <>
      <FormSection title="👤 Basic Information" id="basic">
        <label style={labelStyle}>Full Name *</label>

        <input
          value={data.name}
          onChange={(e) =>
            setData(f => ({
              ...f,
              name: e.target.value
            }))
          }
          required
          placeholder="Author name…"
          style={inputStyle}
        />

        <label style={labelStyle}>Email</label>

        <input
          type="email"
          value={data.email}
          onChange={(e) =>
            setData(f => ({
              ...f,
              email: e.target.value
            }))
          }
          placeholder="author@mfn.com"
          style={inputStyle}
        />

        <label style={labelStyle}>Phone</label>

        <input
          value={data.phone}
          onChange={(e) =>
            setData(f => ({
              ...f,
              phone: e.target.value
            }))
          }
          placeholder="+250..."
          style={inputStyle}
        />

        <label style={labelStyle}>Location</label>

        <input
          value={data.location}
          onChange={(e) =>
            setData(f => ({
              ...f,
              location: e.target.value
            }))
          }
          placeholder="Kigali, Rwanda"
          style={inputStyle}
        />

        <label style={labelStyle}>Bio</label>

        <textarea
          value={data.bio}
          onChange={(e) =>
            setData(f => ({
              ...f,
              bio: e.target.value
            }))
          }
          rows={4}
          placeholder="Short biography…"
          style={{
            ...inputStyle,
            resize: 'vertical'
          }}
        />

        <label style={labelStyle}>
          Profile Image
        </label>

        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          style={{
            ...inputStyle,
            padding: '8px 12px'
          }}
        />
      </FormSection>

      <FormSection title="🌐 Social Media & Website" id="social">
        <div className="author-social-grid">

          <div>
            <label style={labelStyle}>
              Portfolio Website
            </label>

            <input
              value={data.portfolio}
              onChange={(e) =>
                setData(f => ({
                  ...f,
                  portfolio: e.target.value
                }))
              }
              placeholder="https://yourportfolio.com"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              LinkedIn
            </label>

            <input
              value={data.linkedin}
              onChange={(e) =>
                setData(f => ({
                  ...f,
                  linkedin: e.target.value
                }))
              }
              placeholder="LinkedIn URL"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              Facebook
            </label>

            <input
              value={data.facebook}
              onChange={(e) =>
                setData(f => ({
                  ...f,
                  facebook: e.target.value
                }))
              }
              placeholder="Facebook URL"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              Instagram
            </label>

            <input
              value={data.instagram}
              onChange={(e) =>
                setData(f => ({
                  ...f,
                  instagram: e.target.value
                }))
              }
              placeholder="@username / URL"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              X / Twitter
            </label>

            <input
              value={data.twitter}
              onChange={(e) =>
                setData(f => ({
                  ...f,
                  twitter: e.target.value
                }))
              }
              placeholder="@username / URL"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              YouTube
            </label>

            <input
              value={data.youtube}
              onChange={(e) =>
                setData(f => ({
                  ...f,
                  youtube: e.target.value
                }))
              }
              placeholder="YouTube channel URL"
              style={inputStyle}
            />
          </div>

        </div>
      </FormSection>

      <FormSection title="⭐ Professional Information" id="professional">

        <label style={labelStyle}>
          Expertise / Skills
        </label>

        <textarea
          value={data.expertise}
          onChange={(e) =>
            setData(f => ({
              ...f,
              expertise: e.target.value
            }))
          }
          rows={3}
          placeholder="Sports journalism, politics, technology..."
          style={{
            ...inputStyle,
            resize: 'vertical'
          }}
        />

        <label style={labelStyle}>
          Awards / Achievements
        </label>

        <textarea
          value={data.achievements}
          onChange={(e) =>
            setData(f => ({
              ...f,
              achievements: e.target.value
            }))
          }
          rows={3}
          placeholder="Awards, certificates, major achievements..."
          style={{
            ...inputStyle,
            resize: 'vertical'
          }}
        />

      </FormSection>
    </>
  );

  return (
    <AdminLayout>
      <style>{responsiveCSS}</style>

      <h1
        style={{
          fontWeight: 800,
          fontSize: '1.6rem',
          margin: '0 0 24px',
          letterSpacing: '-0.03em'
        }}
      >
        Author Profiles
      </h1>

      <div className="admin-form-grid">

        {/* CREATE AUTHOR */}
        <Card>

          <h3
            style={{
              fontWeight: 800,
              margin: '0 0 20px',
              fontSize: '1rem'
            }}
          >
            Add New Author
          </h3>

          <form onSubmit={handleSubmit}>

            <AuthorForm
              data={form}
              setData={setForm}
              imageRef={fileRef}
            />

            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%',
                background: saving
                  ? '#64748b'
                  : '#1a472a',
                color: '#fff',
                border: 'none',
                padding: '12px',
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 14,
                cursor: saving
                  ? 'not-allowed'
                  : 'pointer',
                fontFamily: 'inherit'
              }}
            >
              {saving
                ? 'Creating…'
                : 'Create Author'}
            </button>

          </form>

        </Card>

        {/* AUTHORS TABLE */}
        <Card
          className="admin-table-scroll"
          style={{
            padding: 0,
            overflow: 'hidden'
          }}
        >

          <table
            style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0
            }}
          >

            <thead>
              <tr>
                {[
                  'Photo',
                  'Name',
                  'Email',
                  'Stories',
                  'Actions'
                ].map(h => (
                  <th
                    key={h}
                    style={{
                      padding: '14px 16px',
                      background: '#f8fafc',
                      color: '#64748b',
                      fontSize: 11,
                      textTransform: 'uppercase',
                      fontWeight: 800,
                      borderBottom:
                        '1px solid #e2e8f0',
                      textAlign: 'left'
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>

              {authors.map(a => (

                <tr
                  key={a.id}
                  style={{
                    borderBottom:
                      '1px solid #f1f5f9'
                  }}
                >

                  <td style={{
                    padding: '14px 16px'
                  }}>
                    <img
                      src={getImgUrl(
                        a.profile_image
                      )}
                      alt=""
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src =
                          PLACEHOLDER;
                      }}
                    />
                  </td>

                  <td style={{
                    padding: '14px 16px'
                  }}>

                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14
                      }}
                    >
                      {a.name}
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: '#94a3b8',
                        maxWidth: 220
                      }}
                    >
                      {a.bio?.substring(0, 70)}
                      {a.bio?.length > 70
                        ? '...'
                        : ''}
                    </div>

                    {a.portfolio && (
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 11,
                          color: '#0369a1'
                        }}
                      >
                        🌐 Portfolio
                      </div>
                    )}

                  </td>

                  <td
                    style={{
                      padding: '14px 16px',
                      fontSize: 13,
                      color: '#475569'
                    }}
                  >
                    {a.email || '—'}
                  </td>

                  <td
                    style={{
                      padding: '14px 16px',
                      fontWeight: 700,
                      color: '#0369a1'
                    }}
                  >
                    {a.story_count || 0} stories
                  </td>

                  <td
                    style={{
                      padding: '14px 16px'
                    }}
                  >

                    <div className="author-action-buttons">

                      {can('manage_authors') && (
                        <button
                          onClick={() =>
                            openEdit(a)
                          }
                          style={{
                            padding:
                              '5px 12px',
                            background:
                              '#eff6ff',
                            color:
                              '#2563eb',
                            border:
                              '1px solid #93c5fd',
                            borderRadius: 6,
                            cursor:
                              'pointer',
                            fontSize: 12,
                            fontFamily:
                              'inherit',
                            fontWeight: 700
                          }}
                        >
                          ✏️ Edit
                        </button>
                      )}

                      {can('manage_authors') && (
                        <button
                          onClick={() =>
                            handleDelete(
                              a.id
                            )
                          }
                          style={{
                            padding:
                              '5px 12px',
                            background:
                              '#fef2f2',
                            color:
                              '#ef4444',
                            border:
                              '1px solid #fca5a5',
                            borderRadius: 6,
                            cursor:
                              'pointer',
                            fontSize: 12,
                            fontFamily:
                              'inherit'
                          }}
                        >
                          Delete
                        </button>
                      )}

                    </div>

                  </td>

                </tr>

              ))}

              {authors.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: 40,
                      textAlign: 'center',
                      color: '#94a3b8'
                    }}
                  >
                    No authors found
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </Card>

      </div>

      {/* ─────────────────────────────────────────
          EDIT AUTHOR MODAL
      ───────────────────────────────────────── */}

      {editing && editAuthor && (

        <div
          className="author-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              closeEdit();
            }
          }}
        >

          <div className="author-modal">

            <div className="author-modal-header">

              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 18,
                    color: '#0f172a'
                  }}
                >
                  Edit Author
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: '#94a3b8',
                    marginTop: 3
                  }}
                >
                  Update {editAuthor.name}'s
                  profile
                </div>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                style={{
                  width: 36,
                  height: 36,
                  border: 'none',
                  borderRadius: 10,
                  background: '#f1f5f9',
                  color: '#475569',
                  cursor: 'pointer',
                  fontSize: 20
                }}
              >
                ×
              </button>

            </div>

            <div className="author-modal-body">

              <form onSubmit={handleUpdate}>

                <AuthorForm
                  data={editForm}
                  setData={setEditForm}
                  imageRef={editFileRef}
                  isEdit
                />

                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    marginTop: 8
                  }}
                >

                  <button
                    type="button"
                    onClick={closeEdit}
                    disabled={saving}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 10,
                      border:
                        '1px solid #e2e8f0',
                      background: '#fff',
                      color: '#475569',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily:
                        'inherit'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 10,
                      border: 'none',
                      background: saving
                        ? '#64748b'
                        : '#1a472a',
                      color: '#fff',
                      fontWeight: 800,
                      cursor: saving
                        ? 'not-allowed'
                        : 'pointer',
                      fontFamily:
                        'inherit'
                    }}
                  >
                    {saving
                      ? 'Saving…'
                      : 'Save Changes'}
                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      )}

    </AdminLayout>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMENTS
// ─────────────────────────────────────────────────────────────────────────────

export function Comments() {
  const [comments, setComments] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const { can } = useAuth();

  const load = async () => {
    setLoading(true);

    commentsAPI
      .getAll({ status, limit: 30 })
      .then(r => {
        setComments(r.data.comments || []);
        setTotal(r.data.total || 0);
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, [status]);

  return (
    <AdminLayout>
      <style>{responsiveCSS}</style>

      <div
        className="admin-flex-wrap"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          gap: '12px'
        }}
      >
        <h1
          style={{
            fontWeight: 800,
            fontSize: '1.6rem',
            margin: 0
          }}
        >
          Comments
        </h1>

        <span
          style={{
            background: '#fef9c3',
            color: '#854d0e',
            padding: '6px 14px',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 13,
            whiteSpace: 'nowrap'
          }}
        >
          {total} {status}
        </span>
      </div>

      <div
        className="admin-flex-wrap"
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 20
        }}
      >
        {['pending', 'approved', 'spam'].map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            style={{
              padding: '8px 18px',
              background:
                status === s
                  ? '#1a472a'
                  : '#fff',
              color:
                status === s
                  ? '#fff'
                  : '#64748b',
              border:
                '1px solid #e2e8f0',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 13,
              textTransform:
                'capitalize',
              fontFamily: 'inherit'
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <Card
        className="admin-table-scroll"
        style={{
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {loading ? (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              color: '#94a3b8'
            }}
          >
            Loading…
          </div>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse:
                'separate',
              borderSpacing: 0
            }}
          >
            <thead>
              <tr>
                {[
                  'Author',
                  'Story',
                  'Comment',
                  'Date',
                  'Actions'
                ].map(h => (
                  <th
                    key={h}
                    style={{
                      padding:
                        '14px 16px',
                      background:
                        '#f8fafc',
                      color:
                        '#64748b',
                      fontSize: 11,
                      textTransform:
                        'uppercase',
                      fontWeight: 800,
                      borderBottom:
                        '1px solid #e2e8f0',
                      textAlign:
                        'left'
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {comments.map(c => (
                <tr
                  key={c.id}
                  style={{
                    borderBottom:
                      '1px solid #f1f5f9'
                  }}
                >
                  <td style={{
                    padding:
                      '14px 16px'
                  }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14
                      }}
                    >
                      {c.name}
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color:
                          '#94a3b8'
                      }}
                    >
                      {c.email}
                    </div>
                  </td>

                  <td
                    style={{
                      padding:
                        '14px 16px',
                      fontSize: 13,
                      color:
                        '#475569',
                      maxWidth: 160
                    }}
                  >
                    <div
                      style={{
                        overflow:
                          'hidden',
                        textOverflow:
                          'ellipsis',
                        whiteSpace:
                          'nowrap'
                      }}
                    >
                      {c.story_title}
                    </div>
                  </td>

                  <td
                    style={{
                      padding:
                        '14px 16px',
                      fontSize: 14,
                      maxWidth: 300
                    }}
                  >
                    <div
                      style={{
                        overflow:
                          'hidden',
                        textOverflow:
                          'ellipsis',
                        whiteSpace:
                          'nowrap'
                      }}
                    >
                      {c.comment}
                    </div>
                  </td>

                  <td
                    style={{
                      padding:
                        '14px 16px',
                      fontSize: 12,
                      color:
                        '#94a3b8',
                      whiteSpace:
                        'nowrap'
                    }}
                  >
                    {new Date(
                      c.created_at
                    ).toLocaleDateString()}
                  </td>

                  <td style={{
                    padding:
                      '14px 16px'
                  }}>
                    <div
                      style={{
                        display:
                          'flex',
                        gap: 6
                      }}
                    >
                      {status ===
                        'pending' &&
                        can(
                          'approve_comments'
                        ) && (
                          <button
                            onClick={async () => {
                              await commentsAPI.approve(
                                c.id
                              );
                              load();
                            }}
                            style={{
                              padding:
                                '5px 10px',
                              background:
                                '#dcfce7',
                              color:
                                '#166534',
                              border:
                                '1px solid #86efac',
                              borderRadius:
                                6,
                              cursor:
                                'pointer',
                              fontSize:
                                12,
                              fontFamily:
                                'inherit',
                              whiteSpace:
                                'nowrap'
                            }}
                          >
                            ✓ Approve
                          </button>
                        )}

                      {can(
                        'delete_content'
                      ) && (
                        <button
                          onClick={async () => {
                            if (
                              window.confirm(
                                'Delete?'
                              )
                            ) {
                              await commentsAPI.delete(
                                c.id
                              );
                              load();
                            }
                          }}
                          style={{
                            padding:
                              '5px 10px',
                            background:
                              '#fef2f2',
                            color:
                              '#ef4444',
                            border:
                              '1px solid #fca5a5',
                            borderRadius:
                              6,
                            cursor:
                              'pointer',
                            fontSize:
                              12,
                            fontFamily:
                              'inherit',
                            whiteSpace:
                              'nowrap'
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {comments.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: 40,
                      textAlign:
                        'center',
                      color:
                        '#94a3b8'
                    }}
                  >
                    No {status} comments
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </AdminLayout>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIDEOS
// ─────────────────────────────────────────────────────────────────────────────

export function Videos() {
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState({
    title: '',
    youtube_url: '',
    category: 'Sport'
  });

  const fileRef = useRef();
  const [saving, setSaving] = useState(false);

  const load = () =>
    videosAPI
      .getAll({ limit: 50 })
      .then(r => setVideos(r.data || []));

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);

    const fd = new FormData();

    Object.entries(form).forEach(
      ([k, v]) => fd.append(k, v)
    );

    if (fileRef.current?.files[0]) {
      fd.append(
        'thumbnail',
        fileRef.current.files[0]
      );
    }

    await videosAPI.create(fd);

    setForm({
      title: '',
      youtube_url: '',
      category: 'Sport'
    });

    load();
    setSaving(false);
  };

  return (
    <AdminLayout>
      <style>{responsiveCSS}</style>

      <h1
        style={{
          fontWeight: 800,
          fontSize: '1.6rem',
          margin: '0 0 24px'
        }}
      >
        Videos
      </h1>

      <div className="admin-form-grid">
        <Card>
          <h3
            style={{
              fontWeight: 800,
              margin: '0 0 20px',
              fontSize: '1rem'
            }}
          >
            Add YouTube Video
          </h3>

          <form onSubmit={handleSubmit}>

            <label style={labelStyle}>
              Title *
            </label>

            <input
              value={form.title}
              onChange={e =>
                setForm(f => ({
                  ...f,
                  title: e.target.value
                }))
              }
              required
              placeholder="Video title…"
              style={inputStyle}
            />

            <label style={labelStyle}>
              YouTube URL *
            </label>

            <input
              value={form.youtube_url}
              onChange={e =>
                setForm(f => ({
                  ...f,
                  youtube_url:
                    e.target.value
                }))
              }
              required
              placeholder="https://youtube.com/watch?v=…"
              style={inputStyle}
            />

            <label style={labelStyle}>
              Category
            </label>

            <select
              value={form.category}
              onChange={e =>
                setForm(f => ({
                  ...f,
                  category:
                    e.target.value
                }))
              }
              style={inputStyle}
            >
              {[
                'Sport',
                'Business',
                'Technology',
                'Health',
                'Culture',
                'Entertainment'
              ].map(c => (
                <option key={c}>
                  {c}
                </option>
              ))}
            </select>

            <label style={labelStyle}>
              Thumbnail
            </label>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{
                ...inputStyle,
                padding:
                  '8px 12px'
              }}
            />

            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%',
                background:
                  '#1a472a',
                color: '#fff',
                border: 'none',
                padding: 12,
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily:
                  'inherit'
              }}
            >
              {saving
                ? 'Saving…'
                : 'Add Video'}
            </button>

          </form>
        </Card>

        <Card
          className="admin-table-scroll"
          style={{
            padding: 0,
            overflow: 'hidden'
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse:
                'separate',
              borderSpacing: 0
            }}
          >
            <thead>
              <tr>
                {[
                  'Thumb',
                  'Title',
                  'Category',
                  'Date',
                  'Action'
                ].map(h => (
                  <th
                    key={h}
                    style={{
                      padding:
                        '14px 16px',
                      background:
                        '#f8fafc',
                      color:
                        '#64748b',
                      fontSize: 11,
                      textTransform:
                        'uppercase',
                      fontWeight: 800,
                      borderBottom:
                        '1px solid #e2e8f0',
                      textAlign:
                        'left'
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {videos.map(v => (
                <tr
                  key={v.id}
                  style={{
                    borderBottom:
                      '1px solid #f1f5f9'
                  }}
                >
                  <td style={{
                    padding:
                      '12px 16px'
                  }}>
                    {v.thumbnail ? (
                      <img
                        src={getImgUrl(
                          v.thumbnail
                        )}
                        alt=""
                        style={{
                          width: 80,
                          height: 50,
                          objectFit:
                            'cover',
                          borderRadius: 6
                        }}
                        onError={e =>
                          (e.target.style.display =
                            'none')
                        }
                      />
                    ) : (
                      <div
                        style={{
                          width: 80,
                          height: 50,
                          background:
                            '#f1f5f9',
                          borderRadius: 6,
                          display:
                            'flex',
                          alignItems:
                            'center',
                          justifyContent:
                            'center',
                          fontSize: 20
                        }}
                      >
                        🎬
                      </div>
                    )}
                  </td>

                  <td style={{
                    padding:
                      '12px 16px',
                    fontWeight: 600,
                    fontSize: 14
                  }}>
                    {v.title}
                  </td>

                  <td style={{
                    padding:
                      '12px 16px'
                  }}>
                    <span
                      style={{
                        background:
                          '#f1f5f9',
                        padding:
                          '3px 10px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700
                      }}
                    >
                      {v.category}
                    </span>
                  </td>

                  <td style={{
                    padding:
                      '12px 16px',
                    fontSize: 12,
                    color:
                      '#94a3b8'
                  }}>
                    {new Date(
                      v.created_at
                    ).toLocaleDateString()}
                  </td>

                  <td style={{
                    padding:
                      '12px 16px'
                  }}>
                    <button
                      onClick={async () => {
                        if (
                          window.confirm(
                            'Delete?'
                          )
                        ) {
                          await videosAPI.delete(
                            v.id
                          );
                          load();
                        }
                      }}
                      style={{
                        padding:
                          '5px 10px',
                        background:
                          '#fef2f2',
                        color:
                          '#ef4444',
                        border:
                          '1px solid #fca5a5',
                        borderRadius:
                          6,
                        cursor:
                          'pointer',
                        fontSize:
                          12,
                        fontFamily:
                          'inherit'
                      }}
                    >
                      Delete
                    </button>
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

// ─────────────────────────────────────────────────────────────────────────────
// ADS
// ─────────────────────────────────────────────────────────────────────────────

export function Ads() {
  const [ads, setAds] = useState([]);

  const [form, setForm] = useState({
    type: 'image',
    link: '',
    position: 'sidebar',
    text: ''
  });

  const fileRef = useRef();
  const [saving, setSaving] = useState(false);

  const load = () =>
    adsAPI
      .getAll()
      .then(r => setAds(r.data || []));

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();

    setSaving(true);

    const fd = new FormData();

    Object.entries(form).forEach(
      ([k, v]) => fd.append(k, v)
    );

    if (fileRef.current?.files[0]) {
      fd.append(
        'file',
        fileRef.current.files[0]
      );
    }

    await adsAPI.create(fd);

    setForm({
      type: 'image',
      link: '',
      position: 'sidebar',
      text: ''
    });

    load();
    setSaving(false);
  };

  return (
    <AdminLayout>
      <style>{responsiveCSS}</style>

      <h1
        style={{
          fontWeight: 800,
          fontSize: '1.6rem',
          margin: '0 0 24px'
        }}
      >
        Advertisements
      </h1>

      <div className="admin-form-grid">

        <Card>

          <h3
            style={{
              fontWeight: 800,
              margin: '0 0 20px',
              fontSize: '1rem'
            }}
          >
            Add Advertisement
          </h3>

          <form onSubmit={handleSubmit}>

            <label style={labelStyle}>
              Type
            </label>

            <select
              value={form.type}
              onChange={e =>
                setForm(f => ({
                  ...f,
                  type:
                    e.target.value
                }))
              }
              style={inputStyle}
            >
              <option value="image">
                Image
              </option>

              <option value="video">
                Video
              </option>
            </select>

            <label style={labelStyle}>
              Position
            </label>

            <select
              value={form.position}
              onChange={e =>
                setForm(f => ({
                  ...f,
                  position:
                    e.target.value
                }))
              }
              style={inputStyle}
            >
              <option value="sidebar">
                Sidebar
              </option>

              <option value="inline">
                Inline / Center
              </option>

              <option value="top">
                Top Banner
              </option>

              <option value="popup">
                Popup
              </option>
            </select>

            <label style={labelStyle}>
              Link URL
            </label>

            <input
              value={form.link}
              onChange={e =>
                setForm(f => ({
                  ...f,
                  link:
                    e.target.value
                }))
              }
              placeholder="https://…"
              style={inputStyle}
            />

            <label style={labelStyle}>
              Caption (optional)
            </label>

            <input
              value={form.text}
              onChange={e =>
                setForm(f => ({
                  ...f,
                  text:
                    e.target.value
                }))
              }
              placeholder="Ad caption…"
              style={inputStyle}
            />

            <label style={labelStyle}>
              Media File *
            </label>

            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              required
              style={{
                ...inputStyle,
                padding:
                  '8px 12px'
              }}
            />

            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%',
                background:
                  '#1a472a',
                color: '#fff',
                border: 'none',
                padding: 12,
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 14,
                cursor:
                  'pointer',
                fontFamily:
                  'inherit'
              }}
            >
              {saving
                ? 'Uploading…'
                : 'Add Ad'}
            </button>

          </form>

        </Card>

        <Card
          className="admin-table-scroll"
          style={{
            padding: 0,
            overflow: 'hidden'
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse:
                'separate',
              borderSpacing: 0
            }}
          >

            <thead>
              <tr>
                {[
                  'Preview',
                  'Type',
                  'Position',
                  'Link',
                  'Actions'
                ].map(h => (
                  <th
                    key={h}
                    style={{
                      padding:
                        '14px 16px',
                      background:
                        '#f8fafc',
                      color:
                        '#64748b',
                      fontSize: 11,
                      textTransform:
                        'uppercase',
                      fontWeight: 800,
                      borderBottom:
                        '1px solid #e2e8f0',
                      textAlign:
                        'left'
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>

              {ads.map(ad => (
                <tr
                  key={ad.id}
                  style={{
                    borderBottom:
                      '1px solid #f1f5f9'
                  }}
                >

                  <td style={{
                    padding:
                      '12px 16px'
                  }}>
                    {ad.type ===
                    'video' ? (
                      <video
                        src={getImgUrl(
                          ad.file
                        )}
                        style={{
                          width: 100,
                          height: 60,
                          objectFit:
                            'cover',
                          borderRadius: 6
                        }}
                        muted
                      />
                    ) : (
                      <img
                        src={getImgUrl(
                          ad.file
                        )}
                        alt=""
                        style={{
                          width: 100,
                          height: 60,
                          objectFit:
                            'cover',
                          borderRadius: 6
                        }}
                        onError={e =>
                          (e.target.style.display =
                            'none')
                        }
                      />
                    )}
                  </td>

                  <td style={{
                    padding:
                      '12px 16px'
                  }}>
                    <span
                      style={{
                        background:
                          '#e0f2fe',
                        color:
                          '#0369a1',
                        padding:
                          '3px 10px',
                        borderRadius:
                          6,
                        fontSize:
                          12,
                        fontWeight:
                          700
                      }}
                    >
                      {ad.type}
                    </span>
                  </td>

                  <td style={{
                    padding:
                      '12px 16px',
                    fontSize: 13
                  }}>
                    {ad.position}
                  </td>

                  <td
                    style={{
                      padding:
                        '12px 16px',
                      fontSize: 12,
                      color:
                        '#0369a1'
                    }}
                  >
                    <a
                      href={ad.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color:
                          '#0369a1'
                      }}
                    >
                      {ad.link?.substring(
                        0,
                        30
                      )}
                      …
                    </a>
                  </td>

                  <td style={{
                    padding:
                      '12px 16px'
                  }}>
                    <button
                      onClick={async () => {
                        if (
                          window.confirm(
                            'Delete ad?'
                          )
                        ) {
                          await adsAPI.delete(
                            ad.id
                          );
                          load();
                        }
                      }}
                      style={{
                        padding:
                          '5px 10px',
                        background:
                          '#fef2f2',
                        color:
                          '#ef4444',
                        border:
                          '1px solid #fca5a5',
                        borderRadius:
                          6,
                        cursor:
                          'pointer',
                        fontSize:
                          12,
                        fontFamily:
                          'inherit'
                      }}
                    >
                      Delete
                    </button>
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

// ─────────────────────────────────────────────────────────────────────────────
// SUBSCRIBERS
// ─────────────────────────────────────────────────────────────────────────────

export function Subscribers() {
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    subscribeAPI
      .getAll()
      .then(r =>
        setSubs(r.data || [])
      );
  }, []);

  return (
    <AdminLayout>
      <style>{responsiveCSS}</style>

      <div
        className="admin-flex-wrap"
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          marginBottom: 24,
          gap: '12px'
        }}
      >

        <h1
          style={{
            fontWeight: 800,
            fontSize: '1.6rem',
            margin: 0
          }}
        >
          Subscribers
        </h1>

        <span
          style={{
            background:
              '#dcfce7',
            color:
              '#166534',
            padding:
              '6px 16px',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 14,
            whiteSpace:
              'nowrap'
          }}
        >
          {
            subs.filter(
              s =>
                s.status ===
                'active'
            ).length
          } active
        </span>

      </div>

      <Card
        className="admin-table-scroll"
        style={{
          padding: 0,
          overflow: 'hidden'
        }}
      >

        <table
          style={{
            width: '100%',
            borderCollapse:
              'separate',
            borderSpacing: 0
          }}
        >

          <thead>
            <tr>
              {[
                'Email',
                'Name',
                'Joined',
                'Status'
              ].map(h => (
                <th
                  key={h}
                  style={{
                    padding:
                      '14px 16px',
                    background:
                      '#f8fafc',
                    color:
                      '#64748b',
                    fontSize: 11,
                    textTransform:
                      'uppercase',
                    fontWeight: 800,
                    borderBottom:
                      '1px solid #e2e8f0',
                    textAlign:
                      'left'
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {subs.map(s => (
              <tr
                key={s.id}
                style={{
                  borderBottom:
                    '1px solid #f1f5f9'
                }}
              >

                <td style={{
                  padding:
                    '14px 16px',
                  fontWeight: 600,
                  fontSize: 14
                }}>
                  {s.email}
                </td>

                <td style={{
                  padding:
                    '14px 16px',
                  fontSize: 13,
                  color:
                    '#475569'
                }}>
                  {s.name || '—'}
                </td>

                <td style={{
                  padding:
                    '14px 16px',
                  fontSize: 12,
                  color:
                    '#94a3b8'
                }}>
                  {new Date(
                    s.subscribed_at
                  ).toLocaleDateString()}
                </td>

                <td style={{
                  padding:
                    '14px 16px'
                }}>
                  <span
                    style={{
                      padding:
                        '4px 10px',
                      borderRadius:
                        6,
                      fontSize:
                        11,
                      fontWeight:
                        700,
                      background:
                        s.status ===
                        'active'
                          ? '#dcfce7'
                          : '#f1f5f9',
                      color:
                        s.status ===
                        'active'
                          ? '#166534'
                          : '#475569'
                    }}
                  >
                    {s.status}
                  </span>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </Card>

    </AdminLayout>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT LOGS
// ─────────────────────────────────────────────────────────────────────────────

export function AuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    analyticsAPI
      .getAuditLogs()
      .then(r =>
        setLogs(r.data || [])
      );
  }, []);

  return (
    <AdminLayout>
      <style>{responsiveCSS}</style>

      <h1
        style={{
          fontWeight: 800,
          fontSize: '1.6rem',
          margin:
            '0 0 24px'
        }}
      >
        Security Audit Logs
      </h1>

      <Card
        className="admin-table-scroll"
        style={{
          padding: 0,
          overflow: 'hidden'
        }}
      >

        <table
          style={{
            width: '100%',
            borderCollapse:
              'separate',
            borderSpacing: 0
          }}
        >

          <thead>
            <tr>
              {[
                'User',
                'Action',
                'IP',
                'Timestamp'
              ].map(h => (
                <th
                  key={h}
                  style={{
                    padding:
                      '14px 16px',
                    background:
                      '#f8fafc',
                    color:
                      '#64748b',
                    fontSize: 11,
                    textTransform:
                      'uppercase',
                    fontWeight: 800,
                    borderBottom:
                      '1px solid #e2e8f0',
                    textAlign:
                      'left'
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>

            {logs.map(l => (
              <tr
                key={l.id}
                style={{
                  borderBottom:
                    '1px solid #f1f5f9'
                }}
              >

                <td style={{
                  padding:
                    '14px 16px',
                  fontWeight: 700,
                  fontSize: 14
                }}>
                  {l.username}
                </td>

                <td style={{
                  padding:
                    '14px 16px',
                  fontSize: 14
                }}>
                  {l.action}
                </td>

                <td style={{
                  padding:
                    '14px 16px',
                  fontSize: 12,
                  color:
                    '#94a3b8'
                }}>
                  {l.ip_address ||
                    '—'}
                </td>

                <td style={{
                  padding:
                    '14px 16px',
                  fontSize: 12,
                  color:
                    '#94a3b8',
                  whiteSpace:
                    'nowrap'
                }}>
                  {new Date(
                    l.created_at
                  ).toLocaleString()}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </Card>
    </AdminLayout>
  );
}