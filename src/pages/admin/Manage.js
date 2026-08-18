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

// ─── API / IMAGE CONFIG ──────────────────────────────────────────────────────

const API_BASE =
  process.env.REACT_APP_API_URL?.replace('/api', '') ||
  'https://mahokofridaynewsbackend.onrender.com';

const PLACEHOLDER = `${API_BASE}/uploads/placeholder.jpg`;

const getImgUrl = (path) => {
  if (!path || typeof path !== 'string') return PLACEHOLDER;

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  if (path.includes('..')) return PLACEHOLDER;

  const cleanPath = path
    .replace(/^uploads?\//, '')
    .replace(/^\/+/, '');

  return `${API_BASE}/uploads/${cleanPath}`;
};

// ─── STYLES ──────────────────────────────────────────────────────────────────

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  fontSize: 14,
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  marginBottom: 14,
  background: '#fff'
};

const labelStyle = {
  display: 'block',
  marginBottom: 6,
  fontWeight: 700,
  fontSize: 13,
  color: '#334155'
};

const sectionTitleStyle = {
  fontSize: 13,
  fontWeight: 800,
  color: '#1e293b',
  margin: '20px 0 12px',
  paddingBottom: 8,
  borderBottom: '1px solid #e2e8f0'
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

// ─── RESPONSIVE CSS ──────────────────────────────────────────────────────────

const responsiveCSS = `
  .admin-form-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .author-social-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0;
  }

  .admin-table-scroll {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .admin-table-scroll table {
    min-width: 760px;
  }

  .admin-flex-wrap {
    flex-wrap: wrap;
  }

  .admin-card-base {
    padding: 16px !important;
  }

  .author-modal {
    width: calc(100% - 24px) !important;
    max-height: 94vh !important;
  }

  @media (min-width: 600px) {
    .author-social-grid {
      grid-template-columns: 1fr 1fr;
      column-gap: 12px;
    }
  }

  @media (min-width: 768px) {
    .admin-form-grid {
      grid-template-columns: 360px 1fr;
      gap: 24px;
    }

    .admin-card-base {
      padding: 24px !important;
    }

    .author-modal {
      width: 700px !important;
      max-height: 90vh !important;
    }
  }
`;

// ─── AUTHOR EMPTY FORM ───────────────────────────────────────────────────────

const emptyAuthorForm = {
  name: '',
  bio: '',
  email: '',
  twitter: '',
  website: '',
  portfolio: '',
  linkedin: '',
  facebook: '',
  instagram: '',
  youtube: '',
  github: '',
  phone: '',
  location: ''
};

// ─── AUTHORS ─────────────────────────────────────────────────────────────────

export function Authors() {
  const [authors, setAuthors] = useState([]);
  const [form, setForm] = useState(emptyAuthorForm);

  const [editingAuthor, setEditingAuthor] = useState(null);
  const [editForm, setEditForm] = useState(emptyAuthorForm);

  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fileRef = useRef();
  const editFileRef = useRef();

  const { can } = useAuth();

  // ─── LOAD AUTHORS ──────────────────────────────────────────────────────────

  const load = async () => {
    try {
      setLoading(true);

      const r = await authorsAPI.getAll();

      setAuthors(r.data || []);
    } catch (error) {
      console.error('Failed to load authors:', error);
      alert('Failed to load authors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ─── FORM CHANGE ───────────────────────────────────────────────────────────

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // ─── CREATE AUTHOR ─────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!can('manage_authors')) {
      alert('You do not have permission to manage authors.');
      return;
    }

    try {
      setSaving(true);

      const fd = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        fd.append(key, value || '');
      });

      if (fileRef.current?.files?.[0]) {
        fd.append('profile_image', fileRef.current.files[0]);
      }

      await authorsAPI.create(fd);

      setForm(emptyAuthorForm);

      if (fileRef.current) {
        fileRef.current.value = '';
      }

      await load();

      alert('Author created successfully.');
    } catch (error) {
      console.error('Create author error:', error);

      alert(
        error?.response?.data?.message ||
          'Failed to create author. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ─── OPEN EDIT ─────────────────────────────────────────────────────────────

  const openEdit = (author) => {
    setEditingAuthor(author);

    setEditForm({
      name: author.name || '',
      bio: author.bio || '',
      email: author.email || '',
      twitter: author.twitter || '',
      website: author.website || '',
      portfolio: author.portfolio || '',
      linkedin: author.linkedin || '',
      facebook: author.facebook || '',
      instagram: author.instagram || '',
      youtube: author.youtube || '',
      github: author.github || '',
      phone: author.phone || '',
      location: author.location || ''
    });

    if (editFileRef.current) {
      editFileRef.current.value = '';
    }
  };

  // ─── UPDATE AUTHOR ─────────────────────────────────────────────────────────

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingAuthor) return;

    if (!can('manage_authors')) {
      alert('You do not have permission to manage authors.');
      return;
    }

    try {
      setEditing(true);

      const fd = new FormData();

      Object.entries(editForm).forEach(([key, value]) => {
        fd.append(key, value || '');
      });

      if (editFileRef.current?.files?.[0]) {
        fd.append('profile_image', editFileRef.current.files[0]);
      }

      /*
        This expects:
        authorsAPI.update(id, fd)
      */

      await authorsAPI.update(editingAuthor.id, fd);

      setEditingAuthor(null);
      setEditForm(emptyAuthorForm);

      await load();

      alert('Author updated successfully.');
    } catch (error) {
      console.error('Update author error:', error);

      alert(
        error?.response?.data?.message ||
          'Failed to update author. Please try again.'
      );
    } finally {
      setEditing(false);
    }
  };

  // ─── DELETE AUTHOR ─────────────────────────────────────────────────────────

  const handleDelete = async (id) => {
    if (!can('manage_authors')) {
      alert('You do not have permission to manage authors.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this author?')) {
      return;
    }

    try {
      await authorsAPI.delete(id);

      await load();

      alert('Author deleted successfully.');
    } catch (error) {
      console.error('Delete author error:', error);

      alert(
        error?.response?.data?.message ||
          'Failed to delete author. Please try again.'
      );
    }
  };

  // ─── AUTHOR FORM ───────────────────────────────────────────────────────────

  const AuthorFields = ({
    data,
    onChange,
    imageRef,
    currentImage,
    editMode = false
  }) => (
    <>
      <label style={labelStyle}>Full Name *</label>

      <input
        name="name"
        value={data.name}
        onChange={onChange}
        required
        placeholder="Author full name"
        style={inputStyle}
      />

      <label style={labelStyle}>Email</label>

      <input
        name="email"
        type="email"
        value={data.email}
        onChange={onChange}
        placeholder="author@example.com"
        style={inputStyle}
      />

      <label style={labelStyle}>Phone</label>

      <input
        name="phone"
        type="tel"
        value={data.phone}
        onChange={onChange}
        placeholder="+250 7XX XXX XXX"
        style={inputStyle}
      />

      <label style={labelStyle}>Location</label>

      <input
        name="location"
        value={data.location}
        onChange={onChange}
        placeholder="Kigali, Rwanda"
        style={inputStyle}
      />

      <label style={labelStyle}>Bio</label>

      <textarea
        name="bio"
        value={data.bio}
        onChange={onChange}
        rows={5}
        placeholder="Write a short biography about this author..."
        style={{
          ...inputStyle,
          resize: 'vertical'
        }}
      />

      <div style={sectionTitleStyle}>
        🌐 Website & Portfolio
      </div>

      <div className="author-social-grid">
        <div>
          <label style={labelStyle}>Personal Website</label>

          <input
            name="website"
            value={data.website}
            onChange={onChange}
            placeholder="https://example.com"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Portfolio</label>

          <input
            name="portfolio"
            value={data.portfolio}
            onChange={onChange}
            placeholder="https://portfolio.example.com"
            style={inputStyle}
          />
        </div>
      </div>

      <div style={sectionTitleStyle}>
        📱 Social Media
      </div>

      <div className="author-social-grid">
        <div>
          <label style={labelStyle}>Twitter / X</label>

          <input
            name="twitter"
            value={data.twitter}
            onChange={onChange}
            placeholder="https://x.com/username"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>LinkedIn</label>

          <input
            name="linkedin"
            value={data.linkedin}
            onChange={onChange}
            placeholder="https://linkedin.com/in/username"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Facebook</label>

          <input
            name="facebook"
            value={data.facebook}
            onChange={onChange}
            placeholder="https://facebook.com/username"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Instagram</label>

          <input
            name="instagram"
            value={data.instagram}
            onChange={onChange}
            placeholder="https://instagram.com/username"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>YouTube</label>

          <input
            name="youtube"
            value={data.youtube}
            onChange={onChange}
            placeholder="https://youtube.com/@username"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>GitHub</label>

          <input
            name="github"
            value={data.github}
            onChange={onChange}
            placeholder="https://github.com/username"
            style={inputStyle}
          />
        </div>
      </div>

      <div style={sectionTitleStyle}>
        🖼️ Profile Image
      </div>

      {editMode && currentImage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 14
          }}
        >
          <img
            src={getImgUrl(currentImage)}
            alt=""
            style={{
              width: 70,
              height: 70,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #e2e8f0'
            }}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = PLACEHOLDER;
            }}
          />

          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#334155'
              }}
            >
              Current profile photo
            </div>

            <div
              style={{
                fontSize: 12,
                color: '#94a3b8',
                marginTop: 3
              }}
            >
              Upload another image to replace it.
            </div>
          </div>
        </div>
      )}

      <input
        ref={imageRef}
        type="file"
        accept="image/*"
        style={{
          ...inputStyle,
          padding: '8px 12px'
        }}
      />
    </>
  );

  // ─── AUTHORS UI ────────────────────────────────────────────────────────────

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
          gap: 12
        }}
      >
        <div>
          <h1
            style={{
              fontWeight: 800,
              fontSize: '1.6rem',
              margin: 0,
              letterSpacing: '-0.03em'
            }}
          >
            Author Profiles
          </h1>

          <p
            style={{
              margin: '6px 0 0',
              color: '#64748b',
              fontSize: 13
            }}
          >
            Manage author profiles, portfolios and social media.
          </p>
        </div>

        <span
          style={{
            background: '#ecfdf5',
            color: '#047857',
            padding: '7px 14px',
            borderRadius: 8,
            fontWeight: 800,
            fontSize: 13
          }}
        >
          {authors.length} Authors
        </span>
      </div>

      <div className="admin-form-grid">
        {/* ───────────────── CREATE AUTHOR ───────────────── */}

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
            <AuthorFields
              data={form}
              onChange={handleFormChange}
              imageRef={fileRef}
            />

            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%',
                background: saving ? '#94a3b8' : '#1a472a',
                color: '#fff',
                border: 'none',
                padding: '13px',
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 14,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                marginTop: 6
              }}
            >
              {saving ? 'Creating Author…' : 'Create Author'}
            </button>
          </form>
        </Card>

        {/* ───────────────── AUTHORS TABLE ───────────────── */}

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
                padding: 50,
                textAlign: 'center',
                color: '#94a3b8'
              }}
            >
              Loading authors…
            </div>
          ) : (
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
                    'Author',
                    'Contact',
                    'Online',
                    'Stories',
                    'Actions'
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '14px 16px',
                        background: '#f8fafc',
                        color: '#64748b',
                        fontSize: 11,
                        textTransform: 'uppercase',
                        fontWeight: 800,
                        borderBottom: '1px solid #e2e8f0',
                        textAlign: 'left'
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {authors.map((a) => (
                  <tr
                    key={a.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9'
                    }}
                  >
                    {/* PHOTO */}

                    <td style={{ padding: '14px 16px' }}>
                      <img
                        src={getImgUrl(a.profile_image)}
                        alt={a.name || ''}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #e2e8f0'
                        }}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = PLACEHOLDER;
                        }}
                      />
                    </td>

                    {/* AUTHOR */}

                    <td style={{ padding: '14px 16px' }}>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 14
                        }}
                      >
                        {a.name}
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          color: '#94a3b8',
                          marginTop: 4,
                          maxWidth: 230
                        }}
                      >
                        {a.bio
                          ? `${a.bio.substring(0, 70)}${
                              a.bio.length > 70 ? '…' : ''
                            }`
                          : 'No biography'}
                      </div>

                      {a.location && (
                        <div
                          style={{
                            fontSize: 11,
                            color: '#64748b',
                            marginTop: 5
                          }}
                        >
                          📍 {a.location}
                        </div>
                      )}
                    </td>

                    {/* CONTACT */}

                    <td style={{ padding: '14px 16px' }}>
                      <div
                        style={{
                          fontSize: 13,
                          color: '#475569'
                        }}
                      >
                        {a.email || '—'}
                      </div>

                      {a.phone && (
                        <div
                          style={{
                            fontSize: 12,
                            color: '#94a3b8',
                            marginTop: 4
                          }}
                        >
                          {a.phone}
                        </div>
                      )}
                    </td>

                    {/* ONLINE LINKS */}

                    <td style={{ padding: '14px 16px' }}>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 5,
                          maxWidth: 190
                        }}
                      >
                        {a.website && (
                          <a
                            href={a.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Website"
                            style={{
                              textDecoration: 'none',
                              background: '#eff6ff',
                              color: '#2563eb',
                              padding: '4px 7px',
                              borderRadius: 5,
                              fontSize: 11,
                              fontWeight: 700
                            }}
                          >
                            🌐 Web
                          </a>
                        )}

                        {a.portfolio && (
                          <a
                            href={a.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Portfolio"
                            style={{
                              textDecoration: 'none',
                              background: '#f5f3ff',
                              color: '#7c3aed',
                              padding: '4px 7px',
                              borderRadius: 5,
                              fontSize: 11,
                              fontWeight: 700
                            }}
                          >
                            💼 Portfolio
                          </a>
                        )}

                        {a.linkedin && (
                          <a
                            href={a.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="LinkedIn"
                            style={{
                              textDecoration: 'none',
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              padding: '4px 7px',
                              borderRadius: 5,
                              fontSize: 11,
                              fontWeight: 700
                            }}
                          >
                            LinkedIn
                          </a>
                        )}

                        {a.twitter && (
                          <a
                            href={a.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Twitter / X"
                            style={{
                              textDecoration: 'none',
                              background: '#f8fafc',
                              color: '#0f172a',
                              padding: '4px 7px',
                              borderRadius: 5,
                              fontSize: 11,
                              fontWeight: 700
                            }}
                          >
                            X
                          </a>
                        )}

                        {a.facebook && (
                          <a
                            href={a.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Facebook"
                            style={{
                              textDecoration: 'none',
                              background: '#eff6ff',
                              color: '#2563eb',
                              padding: '4px 7px',
                              borderRadius: 5,
                              fontSize: 11,
                              fontWeight: 700
                            }}
                          >
                            FB
                          </a>
                        )}

                        {a.instagram && (
                          <a
                            href={a.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Instagram"
                            style={{
                              textDecoration: 'none',
                              background: '#fdf2f8',
                              color: '#db2777',
                              padding: '4px 7px',
                              borderRadius: 5,
                              fontSize: 11,
                              fontWeight: 700
                            }}
                          >
                            IG
                          </a>
                        )}

                        {a.youtube && (
                          <a
                            href={a.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="YouTube"
                            style={{
                              textDecoration: 'none',
                              background: '#fef2f2',
                              color: '#dc2626',
                              padding: '4px 7px',
                              borderRadius: 5,
                              fontSize: 11,
                              fontWeight: 700
                            }}
                          >
                            YT
                          </a>
                        )}

                        {a.github && (
                          <a
                            href={a.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="GitHub"
                            style={{
                              textDecoration: 'none',
                              background: '#f8fafc',
                              color: '#334155',
                              padding: '4px 7px',
                              borderRadius: 5,
                              fontSize: 11,
                              fontWeight: 700
                            }}
                          >
                            GitHub
                          </a>
                        )}

                        {!a.website &&
                          !a.portfolio &&
                          !a.linkedin &&
                          !a.twitter &&
                          !a.facebook &&
                          !a.instagram &&
                          !a.youtube &&
                          !a.github && (
                            <span
                              style={{
                                color: '#94a3b8',
                                fontSize: 12
                              }}
                            >
                              No links
                            </span>
                          )}
                      </div>
                    </td>

                    {/* STORIES */}

                    <td
                      style={{
                        padding: '14px 16px',
                        fontWeight: 700,
                        color: '#0369a1',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {a.story_count || 0} stories
                    </td>

                    {/* ACTIONS */}

                    <td style={{ padding: '14px 16px' }}>
                      {can('manage_authors') && (
                        <div
                          style={{
                            display: 'flex',
                            gap: 6,
                            flexWrap: 'wrap'
                          }}
                        >
                          <button
                            onClick={() => openEdit(a)}
                            style={{
                              padding: '6px 12px',
                              background: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                              borderRadius: 6,
                              cursor: 'pointer',
                              fontSize: 12,
                              fontWeight: 700,
                              fontFamily: 'inherit'
                            }}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            onClick={() => handleDelete(a.id)}
                            style={{
                              padding: '6px 12px',
                              background: '#fef2f2',
                              color: '#ef4444',
                              border: '1px solid #fca5a5',
                              borderRadius: 6,
                              cursor: 'pointer',
                              fontSize: 12,
                              fontWeight: 700,
                              fontFamily: 'inherit'
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {authors.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: 50,
                        textAlign: 'center',
                        color: '#94a3b8'
                      }}
                    >
                      No authors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {/* ───────────────── EDIT AUTHOR MODAL ───────────────── */}

      {editingAuthor && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setEditingAuthor(null);
            }
          }}
        >
          <div
            className="author-modal"
            style={{
              background: '#fff',
              borderRadius: 18,
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,.25)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* MODAL HEADER */}

            <div
              style={{
                padding: '18px 20px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                flexShrink: 0
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 800,
                    color: '#0f172a'
                  }}
                >
                  Edit Author
                </h2>

                <div
                  style={{
                    marginTop: 4,
                    color: '#64748b',
                    fontSize: 12
                  }}
                >
                  Update author profile and online presence.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingAuthor(null)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  fontSize: 18,
                  color: '#475569'
                }}
              >
                ×
              </button>
            </div>

            {/* MODAL BODY */}

            <div
              style={{
                padding: 20,
                overflowY: 'auto'
              }}
            >
              <form onSubmit={handleUpdate}>
                <AuthorFields
                  data={editForm}
                  onChange={handleEditFormChange}
                  imageRef={editFileRef}
                  currentImage={editingAuthor.profile_image}
                  editMode
                />

                {/* MODAL ACTIONS */}

                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    marginTop: 10,
                    paddingTop: 15,
                    borderTop: '1px solid #e2e8f0'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setEditingAuthor(null)}
                    disabled={editing}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      background: '#fff',
                      color: '#475569',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={editing}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 10,
                      border: 'none',
                      background: editing ? '#94a3b8' : '#1a472a',
                      color: '#fff',
                      fontWeight: 800,
                      cursor: editing ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    {editing ? 'Saving…' : 'Save Changes'}
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

// ─── COMMENTS ────────────────────────────────────────────────────────────────

export function Comments() {
  const [comments, setComments] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const { can } = useAuth();

  const load = async () => {
    setLoading(true);

    try {
      const r = await commentsAPI.getAll({
        status,
        limit: 30
      });

      setComments(r.data.comments || []);
      setTotal(r.data.total || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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
          gap: 12
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
        {['pending', 'approved', 'spam'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            style={{
              padding: '8px 18px',
              background: status === s ? '#1a472a' : '#fff',
              color: status === s ? '#fff' : '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 13,
              textTransform: 'capitalize',
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
              borderCollapse: 'separate',
              borderSpacing: 0
            }}
          >
            <thead>
              <tr>
                {['Author', 'Story', 'Comment', 'Date', 'Actions'].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: '14px 16px',
                        background: '#f8fafc',
                        color: '#64748b',
                        fontSize: 11,
                        textTransform: 'uppercase',
                        fontWeight: 800,
                        borderBottom: '1px solid #e2e8f0',
                        textAlign: 'left'
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {comments.map((c) => (
                <tr
                  key={c.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9'
                  }}
                >
                  <td style={{ padding: '14px 16px' }}>
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
                        color: '#94a3b8'
                      }}
                    >
                      {c.email}
                    </div>
                  </td>

                  <td
                    style={{
                      padding: '14px 16px',
                      fontSize: 13,
                      color: '#475569',
                      maxWidth: 160
                    }}
                  >
                    <div
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {c.story_title}
                    </div>
                  </td>

                  <td
                    style={{
                      padding: '14px 16px',
                      fontSize: 14,
                      maxWidth: 300
                    }}
                  >
                    <div
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {c.comment}
                    </div>
                  </td>

                  <td
                    style={{
                      padding: '14px 16px',
                      fontSize: 12,
                      color: '#94a3b8',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div
                      style={{
                        display: 'flex',
                        gap: 6
                      }}
                    >
                      {status === 'pending' &&
                        can('approve_comments') && (
                          <button
                            onClick={async () => {
                              await commentsAPI.approve(c.id);
                              load();
                            }}
                            style={{
                              padding: '5px 10px',
                              background: '#dcfce7',
                              color: '#166534',
                              border: '1px solid #86efac',
                              borderRadius: 6,
                              cursor: 'pointer',
                              fontSize: 12,
                              fontFamily: 'inherit',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            ✓ Approve
                          </button>
                        )}

                      {can('delete_content') && (
                        <button
                          onClick={async () => {
                            if (window.confirm('Delete?')) {
                              await commentsAPI.delete(c.id);
                              load();
                            }
                          }}
                          style={{
                            padding: '5px 10px',
                            background: '#fef2f2',
                            color: '#ef4444',
                            border: '1px solid #fca5a5',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: 12,
                            fontFamily: 'inherit',
                            whiteSpace: 'nowrap'
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
                      textAlign: 'center',
                      color: '#94a3b8'
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

// ─── VIDEOS ──────────────────────────────────────────────────────────────────

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
      .then((r) => setVideos(r.data || []));

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const fd = new FormData();

      Object.entries(form).forEach(([k, v]) => {
        fd.append(k, v);
      });

      if (fileRef.current?.files[0]) {
        fd.append('thumbnail', fileRef.current.files[0]);
      }

      await videosAPI.create(fd);

      setForm({
        title: '',
        youtube_url: '',
        category: 'Sport'
      });

      if (fileRef.current) {
        fileRef.current.value = '';
      }

      load();
    } catch (error) {
      console.error(error);
      alert(
        error?.response?.data?.message ||
          'Failed to add video.'
      );
    } finally {
      setSaving(false);
    }
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
            <label style={labelStyle}>Title *</label>

            <input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  title: e.target.value
                }))
              }
              required
              placeholder="Video title…"
              style={inputStyle}
            />

            <label style={labelStyle}>YouTube URL *</label>

            <input
              value={form.youtube_url}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  youtube_url: e.target.value
                }))
              }
              required
              placeholder="https://youtube.com/watch?v=…"
              style={inputStyle}
            />

            <label style={labelStyle}>Category</label>

            <select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  category: e.target.value
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
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <label style={labelStyle}>Thumbnail</label>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{
                ...inputStyle,
                padding: '8px 12px'
              }}
            />

            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%',
                background: '#1a472a',
                color: '#fff',
                border: 'none',
                padding: '12px',
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              {saving ? 'Saving…' : 'Add Video'}
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
              borderCollapse: 'separate',
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
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '14px 16px',
                      background: '#f8fafc',
                      color: '#64748b',
                      fontSize: 11,
                      textTransform: 'uppercase',
                      fontWeight: 800,
                      borderBottom: '1px solid #e2e8f0',
                      textAlign: 'left'
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {videos.map((v) => (
                <tr
                  key={v.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9'
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    {v.thumbnail ? (
                      <img
                        src={getImgUrl(v.thumbnail)}
                        alt=""
                        style={{
                          width: 80,
                          height: 50,
                          objectFit: 'cover',
                          borderRadius: 6
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 80,
                          height: 50,
                          background: '#f1f5f9',
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 20
                        }}
                      >
                        🎬
                      </div>
                    )}
                  </td>

                  <td
                    style={{
                      padding: '12px 16px',
                      fontWeight: 600,
                      fontSize: 14
                    }}
                  >
                    {v.title}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        background: '#f1f5f9',
                        padding: '3px 10px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700
                      }}
                    >
                      {v.category}
                    </span>
                  </td>

                  <td
                    style={{
                      padding: '12px 16px',
                      fontSize: 12,
                      color: '#94a3b8'
                    }}
                  >
                    {new Date(
                      v.created_at
                    ).toLocaleDateString()}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={async () => {
                        if (window.confirm('Delete?')) {
                          await videosAPI.delete(v.id);
                          load();
                        }
                      }}
                      style={{
                        padding: '5px 10px',
                        background: '#fef2f2',
                        color: '#ef4444',
                        border: '1px solid #fca5a5',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 12,
                        fontFamily: 'inherit'
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

// ─── ADS ─────────────────────────────────────────────────────────────────────

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
    adsAPI.getAll().then((r) => setAds(r.data || []));

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const fd = new FormData();

      Object.entries(form).forEach(([k, v]) => {
        fd.append(k, v);
      });

      if (fileRef.current?.files[0]) {
        fd.append('file', fileRef.current.files[0]);
      }

      await adsAPI.create(fd);

      setForm({
        type: 'image',
        link: '',
        position: 'sidebar',
        text: ''
      });

      if (fileRef.current) {
        fileRef.current.value = '';
      }

      load();
    } catch (error) {
      console.error(error);
      alert(
        error?.response?.data?.message ||
          'Failed to upload advertisement.'
      );
    } finally {
      setSaving(false);
    }
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
            <label style={labelStyle}>Type</label>

            <select
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  type: e.target.value
                }))
              }
              style={inputStyle}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>

            <label style={labelStyle}>Position</label>

            <select
              value={form.position}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  position: e.target.value
                }))
              }
              style={inputStyle}
            >
              <option value="sidebar">Sidebar</option>
              <option value="inline">
                Inline / Center
              </option>
              <option value="top">Top Banner</option>
              <option value="popup">Popup</option>
            </select>

            <label style={labelStyle}>Link URL</label>

            <input
              value={form.link}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  link: e.target.value
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
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  text: e.target.value
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
                padding: '8px 12px'
              }}
            />

            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%',
                background: '#1a472a',
                color: '#fff',
                border: 'none',
                padding: '12px',
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              {saving ? 'Uploading…' : 'Add Ad'}
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
              borderCollapse: 'separate',
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
                ].map((h) => (
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
              {ads.map((ad) => (
                <tr
                  key={ad.id}
                  style={{
                    borderBottom:
                      '1px solid #f1f5f9'
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    {ad.type === 'video' ? (
                      <video
                        src={getImgUrl(ad.file)}
                        style={{
                          width: 100,
                          height: 60,
                          objectFit: 'cover',
                          borderRadius: 6
                        }}
                        muted
                      />
                    ) : (
                      <img
                        src={getImgUrl(ad.file)}
                        alt=""
                        style={{
                          width: 100,
                          height: 60,
                          objectFit: 'cover',
                          borderRadius: 6
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display =
                            'none';
                        }}
                      />
                    )}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        background: '#e0f2fe',
                        color: '#0369a1',
                        padding: '3px 10px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700
                      }}
                    >
                      {ad.type}
                    </span>
                  </td>

                  <td
                    style={{
                      padding: '12px 16px',
                      fontSize: 13
                    }}
                  >
                    {ad.position}
                  </td>

                  <td
                    style={{
                      padding: '12px 16px',
                      fontSize: 12,
                      color: '#0369a1'
                    }}
                  >
                    {ad.link ? (
                      <a
                        href={ad.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#0369a1'
                        }}
                      >
                        {ad.link.substring(0, 30)}…
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={async () => {
                        if (
                          window.confirm(
                            'Delete ad?'
                          )
                        ) {
                          await adsAPI.delete(ad.id);
                          load();
                        }
                      }}
                      style={{
                        padding: '5px 10px',
                        background: '#fef2f2',
                        color: '#ef4444',
                        border: '1px solid #fca5a5',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 12,
                        fontFamily: 'inherit'
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

// ─── SUBSCRIBERS ─────────────────────────────────────────────────────────────

export function Subscribers() {
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    subscribeAPI
      .getAll()
      .then((r) => setSubs(r.data || []))
      .catch((error) =>
        console.error('Subscribers error:', error)
      );
  }, []);

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
          gap: 12
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
            background: '#dcfce7',
            color: '#166534',
            padding: '6px 16px',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 14,
            whiteSpace: 'nowrap'
          }}
        >
          {
            subs.filter(
              (s) => s.status === 'active'
            ).length
          }{' '}
          active
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
            borderCollapse: 'separate',
            borderSpacing: 0
          }}
        >
          <thead>
            <tr>
              {['Email', 'Name', 'Joined', 'Status'].map(
                (h) => (
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
                )
              )}
            </tr>
          </thead>

          <tbody>
            {subs.map((s) => (
              <tr
                key={s.id}
                style={{
                  borderBottom:
                    '1px solid #f1f5f9'
                }}
              >
                <td
                  style={{
                    padding: '14px 16px',
                    fontWeight: 600,
                    fontSize: 14
                  }}
                >
                  {s.email}
                </td>

                <td
                  style={{
                    padding: '14px 16px',
                    fontSize: 13,
                    color: '#475569'
                  }}
                >
                  {s.name || '—'}
                </td>

                <td
                  style={{
                    padding: '14px 16px',
                    fontSize: 12,
                    color: '#94a3b8'
                  }}
                >
                  {new Date(
                    s.subscribed_at
                  ).toLocaleDateString()}
                </td>

                <td style={{ padding: '14px 16px' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      background:
                        s.status === 'active'
                          ? '#dcfce7'
                          : '#f1f5f9',
                      color:
                        s.status === 'active'
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

// ─── AUDIT LOGS ──────────────────────────────────────────────────────────────

export function AuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    analyticsAPI
      .getAuditLogs()
      .then((r) => setLogs(r.data || []))
      .catch((error) =>
        console.error('Audit logs error:', error)
      );
  }, []);

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
            borderCollapse: 'separate',
            borderSpacing: 0
          }}
        >
          <thead>
            <tr>
              {['User', 'Action', 'IP', 'Timestamp'].map(
                (h) => (
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
                )
              )}
            </tr>
          </thead>

          <tbody>
            {logs.map((l) => (
              <tr
                key={l.id}
                style={{
                  borderBottom:
                    '1px solid #f1f5f9'
                }}
              >
                <td
                  style={{
                    padding: '14px 16px',
                    fontWeight: 700,
                    fontSize: 14
                  }}
                >
                  {l.username}
                </td>

                <td
                  style={{
                    padding: '14px 16px',
                    fontSize: 14
                  }}
                >
                  {l.action}
                </td>

                <td
                  style={{
                    padding: '14px 16px',
                    fontSize: 12,
                    color: '#94a3b8'
                  }}
                >
                  {l.ip_address || '—'}
                </td>

                <td
                  style={{
                    padding: '14px 16px',
                    fontSize: 12,
                    color: '#94a3b8',
                    whiteSpace: 'nowrap'
                  }}
                >
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