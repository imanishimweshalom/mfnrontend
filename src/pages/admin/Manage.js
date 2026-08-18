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

// ─────────────────────────────────────────────────────────────
// API / IMAGE HELPERS
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────

const inputStyle = {
  width: '100%',
  padding: '9px 11px',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  fontSize: 13,
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  marginBottom: 10,
  background: '#fff'
};

const labelStyle = {
  display: 'block',
  marginBottom: 4,
  fontWeight: 700,
  fontSize: 12,
  color: '#334155'
};

const socialInputStyle = {
  ...inputStyle,
  marginBottom: 8
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

// ─────────────────────────────────────────────────────────────
// RESPONSIVE CSS
// ─────────────────────────────────────────────────────────────

const responsiveCSS = `
  .admin-form-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .author-form-card {
    width: 100%;
  }

  .author-fields-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0 10px;
  }

  .social-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0 10px;
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

  .compact-form-title {
    font-size: 15px;
  }

  @media (min-width: 600px) {
    .author-fields-grid {
      grid-template-columns: 1fr 1fr;
    }

    .social-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (min-width: 768px) {
    .admin-form-grid {
      grid-template-columns: 300px minmax(0, 1fr);
      gap: 20px;
      align-items: start;
    }

    .author-form-card {
      max-width: 300px;
    }

    .admin-card-base {
      padding: 20px !important;
    }
  }

  @media (min-width: 1100px) {
    .admin-form-grid {
      grid-template-columns: 330px minmax(0, 1fr);
    }

    .author-form-card {
      max-width: 330px;
    }
  }
`;

// ─────────────────────────────────────────────────────────────
// EMPTY AUTHOR FORM
// ─────────────────────────────────────────────────────────────

const EMPTY_AUTHOR = {
  name: '',
  bio: '',
  email: '',
  twitter: '',
  website: '',
  portfolio: '',
  linkedin: '',
  facebook: '',
  instagram: '',
  github: '',
  youtube: '',
  location: '',
  phone: '',
  skills: ''
};

// ─────────────────────────────────────────────────────────────
// AUTHORS
// ─────────────────────────────────────────────────────────────

export function Authors() {
  const [authors, setAuthors] = useState([]);
  const [form, setForm] = useState(EMPTY_AUTHOR);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fileRef = useRef(null);

  const { can } = useAuth();

  // ─────────────────────────────────────────
  // LOAD AUTHORS
  // ─────────────────────────────────────────

  const load = async () => {
    try {
      setLoading(true);

      const response = await authorsAPI.getAll();

      setAuthors(response.data || []);
    } catch (error) {
      console.error('Failed to load authors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ─────────────────────────────────────────
  // HANDLE INPUT
  // ─────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // ─────────────────────────────────────────
  // EDIT AUTHOR
  // ─────────────────────────────────────────

  const handleEdit = (author) => {
    setEditingId(author.id);

    setForm({
      name: author.name || '',
      bio: author.bio || '',
      email: author.email || '',
      twitter: author.twitter || '',
      website: author.website || '',
      portfolio: author.portfolio || '',
      linkedin: author.linkedin || '',
      facebook: author.facebook || '',
      instagram: author.instagram || '',
      github: author.github || '',
      youtube: author.youtube || '',
      location: author.location || '',
      phone: author.phone || '',
      skills: author.skills || ''
    });

    // Scroll to form
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // ─────────────────────────────────────────
  // CANCEL EDIT
  // ─────────────────────────────────────────

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_AUTHOR);

    if (fileRef.current) {
      fileRef.current.value = '';
    }
  };

  // ─────────────────────────────────────────
  // SUBMIT AUTHOR
  // ─────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const fd = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        fd.append(key, value || '');
      });

      if (fileRef.current?.files?.[0]) {
        fd.append('profile_image', fileRef.current.files[0]);
      }

      if (editingId) {
        await authorsAPI.update(editingId, fd);
      } else {
        await authorsAPI.create(fd);
      }

      setForm(EMPTY_AUTHOR);
      setEditingId(null);

      if (fileRef.current) {
        fileRef.current.value = '';
      }

      await load();
    } catch (error) {
      console.error('Author save error:', error);

      alert(
        error?.response?.data?.message ||
          'Failed to save author. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────
  // DELETE AUTHOR
  // ─────────────────────────────────────────

  const handleDelete = async (id) => {
    if (!can('manage_authors')) return;

    if (!window.confirm('Are you sure you want to delete this author?')) {
      return;
    }

    try {
      await authorsAPI.delete(id);

      if (editingId === id) {
        cancelEdit();
      }

      await load();
    } catch (error) {
      console.error('Delete author error:', error);

      alert(
        error?.response?.data?.message ||
          'Failed to delete author.'
      );
    }
  };

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────

  return (
    <AdminLayout>
      <style>{responsiveCSS}</style>

      <div
        className="admin-flex-wrap"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          gap: 10
        }}
      >
        <div>
          <h1
            style={{
              fontWeight: 800,
              fontSize: '1.5rem',
              margin: 0,
              letterSpacing: '-0.03em'
            }}
          >
            Author Profiles
          </h1>

          <p
            style={{
              margin: '5px 0 0',
              color: '#94a3b8',
              fontSize: 12
            }}
          >
            Manage author profiles, portfolio and social media.
          </p>
        </div>

        <span
          style={{
            background: '#f0fdf4',
            color: '#166534',
            padding: '6px 12px',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 12
          }}
        >
          {authors.length} Authors
        </span>
      </div>

      <div className="admin-form-grid">

        {/* ─────────────────────────────────────
            AUTHOR FORM
        ───────────────────────────────────── */}

        <Card
          className="author-form-card"
          style={{
            padding: 16
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
              gap: 8
            }}
          >
            <div>
              <h3
                className="compact-form-title"
                style={{
                  fontWeight: 800,
                  margin: 0
                }}
              >
                {editingId ? 'Edit Author' : 'Add Author'}
              </h3>

              <p
                style={{
                  margin: '3px 0 0',
                  color: '#94a3b8',
                  fontSize: 11
                }}
              >
                {editingId
                  ? 'Update author information'
                  : 'Create a new author profile'}
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                style={{
                  border: 'none',
                  background: '#f1f5f9',
                  color: '#475569',
                  borderRadius: 7,
                  padding: '6px 9px',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 700
                }}
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>

            {/* BASIC INFORMATION */}

            <label style={labelStyle}>
              Full Name *
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Author name"
              style={inputStyle}
            />

            <label style={labelStyle}>
              Email
            </label>

            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="author@example.com"
              style={inputStyle}
            />

            <div className="author-fields-grid">

              <div>
                <label style={labelStyle}>
                  Phone
                </label>

                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+250..."
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Location
                </label>

                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Kigali, Rwanda"
                  style={inputStyle}
                />
              </div>

            </div>

            <label style={labelStyle}>
              Bio
            </label>

            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              placeholder="Short biography..."
              style={{
                ...inputStyle,
                resize: 'vertical'
              }}
            />

            <label style={labelStyle}>
              Skills
            </label>

            <input
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="Journalism, Sports, Politics..."
              style={inputStyle}
            />

            {/* WEBSITE / PORTFOLIO */}

            <div
              style={{
                borderTop: '1px solid #f1f5f9',
                margin: '5px 0 12px',
                paddingTop: 12
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  marginBottom: 8
                }}
              >
                Website & Portfolio
              </div>

              <label style={labelStyle}>
                Portfolio Website
              </label>

              <input
                name="portfolio"
                value={form.portfolio}
                onChange={handleChange}
                placeholder="https://myportfolio.com"
                style={socialInputStyle}
              />

              <label style={labelStyle}>
                Personal Website
              </label>

              <input
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://example.com"
                style={socialInputStyle}
              />
            </div>

            {/* SOCIAL MEDIA */}

            <div
              style={{
                borderTop: '1px solid #f1f5f9',
                margin: '5px 0 12px',
                paddingTop: 12
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  marginBottom: 8
                }}
              >
                Social Media
              </div>

              <div className="social-grid">

                <div>
                  <label style={labelStyle}>
                    Twitter / X
                  </label>

                  <input
                    name="twitter"
                    value={form.twitter}
                    onChange={handleChange}
                    placeholder="https://x.com/username"
                    style={socialInputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    LinkedIn
                  </label>

                  <input
                    name="linkedin"
                    value={form.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/..."
                    style={socialInputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Facebook
                  </label>

                  <input
                    name="facebook"
                    value={form.facebook}
                    onChange={handleChange}
                    placeholder="https://facebook.com/..."
                    style={socialInputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Instagram
                  </label>

                  <input
                    name="instagram"
                    value={form.instagram}
                    onChange={handleChange}
                    placeholder="https://instagram.com/..."
                    style={socialInputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    GitHub
                  </label>

                  <input
                    name="github"
                    value={form.github}
                    onChange={handleChange}
                    placeholder="https://github.com/..."
                    style={socialInputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    YouTube
                  </label>

                  <input
                    name="youtube"
                    value={form.youtube}
                    onChange={handleChange}
                    placeholder="https://youtube.com/..."
                    style={socialInputStyle}
                  />
                </div>

              </div>
            </div>

            {/* IMAGE */}

            <label style={labelStyle}>
              Profile Image
            </label>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{
                ...inputStyle,
                padding: '7px 9px'
              }}
            />

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%',
                background: saving
                  ? '#94a3b8'
                  : '#1a472a',
                color: '#fff',
                border: 'none',
                padding: '10px',
                borderRadius: 8,
                fontWeight: 800,
                fontSize: 13,
                cursor: saving
                  ? 'not-allowed'
                  : 'pointer',
                fontFamily: 'inherit'
              }}
            >
              {saving
                ? 'Saving...'
                : editingId
                ? 'Update Author'
                : 'Create Author'}
            </button>
          </form>
        </Card>

        {/* ─────────────────────────────────────
            AUTHORS TABLE
        ───────────────────────────────────── */}

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
              Loading authors...
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
                    'Portfolio',
                    'Social',
                    'Stories',
                    'Actions'
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '13px 14px',
                        background: '#f8fafc',
                        color: '#64748b',
                        fontSize: 10,
                        textTransform: 'uppercase',
                        fontWeight: 800,
                        borderBottom:
                          '1px solid #e2e8f0',
                        textAlign: 'left',
                        whiteSpace: 'nowrap'
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
                      borderBottom:
                        '1px solid #f1f5f9'
                    }}
                  >

                    {/* PHOTO */}

                    <td
                      style={{
                        padding: '12px 14px'
                      }}
                    >
                      <img
                        src={getImgUrl(
                          a.profile_image
                        )}
                        alt={a.name || ''}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            PLACEHOLDER;
                        }}
                      />
                    </td>

                    {/* AUTHOR */}

                    <td
                      style={{
                        padding: '12px 14px',
                        minWidth: 180
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 14
                        }}
                      >
                        {a.name}
                      </div>

                      {a.location && (
                        <div
                          style={{
                            fontSize: 11,
                            color: '#64748b',
                            marginTop: 3
                          }}
                        >
                          📍 {a.location}
                        </div>
                      )}

                      {a.skills && (
                        <div
                          style={{
                            fontSize: 11,
                            color: '#94a3b8',
                            marginTop: 3,
                            maxWidth: 180,
                            overflow: 'hidden',
                            textOverflow:
                              'ellipsis',
                            whiteSpace:
                              'nowrap'
                          }}
                        >
                          {a.skills}
                        </div>
                      )}
                    </td>

                    {/* CONTACT */}

                    <td
                      style={{
                        padding: '12px 14px',
                        fontSize: 12,
                        color: '#475569'
                      }}
                    >
                      <div>
                        {a.email || '—'}
                      </div>

                      {a.phone && (
                        <div
                          style={{
                            marginTop: 3,
                            color: '#94a3b8'
                          }}
                        >
                          {a.phone}
                        </div>
                      )}
                    </td>

                    {/* PORTFOLIO */}

                    <td
                      style={{
                        padding: '12px 14px',
                        fontSize: 12
                      }}
                    >
                      {a.portfolio ||
                      a.website ? (
                        <a
                          href={
                            a.portfolio ||
                            a.website
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#0369a1',
                            fontWeight: 700,
                            textDecoration:
                              'none'
                          }}
                        >
                          🌐 Portfolio
                        </a>
                      ) : (
                        <span
                          style={{
                            color: '#94a3b8'
                          }}
                        >
                          —
                        </span>
                      )}
                    </td>

                    {/* SOCIAL */}

                    <td
                      style={{
                        padding: '12px 14px'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 4,
                          maxWidth: 170
                        }}
                      >
                        {a.twitter && (
                          <a
                            href={a.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: 11,
                              background:
                                '#f1f5f9',
                              color: '#334155',
                              padding:
                                '3px 6px',
                              borderRadius: 5,
                              textDecoration:
                                'none'
                            }}
                          >
                            X
                          </a>
                        )}

                        {a.linkedin && (
                          <a
                            href={a.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: 11,
                              background:
                                '#eff6ff',
                              color: '#2563eb',
                              padding:
                                '3px 6px',
                              borderRadius: 5,
                              textDecoration:
                                'none'
                            }}
                          >
                            LinkedIn
                          </a>
                        )}

                        {a.facebook && (
                          <a
                            href={a.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: 11,
                              background:
                                '#eff6ff',
                              color: '#2563eb',
                              padding:
                                '3px 6px',
                              borderRadius: 5,
                              textDecoration:
                                'none'
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
                            style={{
                              fontSize: 11,
                              background:
                                '#fdf2f8',
                              color: '#be185d',
                              padding:
                                '3px 6px',
                              borderRadius: 5,
                              textDecoration:
                                'none'
                            }}
                          >
                            IG
                          </a>
                        )}

                        {a.github && (
                          <a
                            href={a.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: 11,
                              background:
                                '#f1f5f9',
                              color: '#111827',
                              padding:
                                '3px 6px',
                              borderRadius: 5,
                              textDecoration:
                                'none'
                            }}
                          >
                            GitHub
                          </a>
                        )}

                        {a.youtube && (
                          <a
                            href={a.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: 11,
                              background:
                                '#fef2f2',
                              color: '#dc2626',
                              padding:
                                '3px 6px',
                              borderRadius: 5,
                              textDecoration:
                                'none'
                            }}
                          >
                            YouTube
                          </a>
                        )}

                        {!a.twitter &&
                          !a.linkedin &&
                          !a.facebook &&
                          !a.instagram &&
                          !a.github &&
                          !a.youtube && (
                            <span
                              style={{
                                color:
                                  '#94a3b8',
                                fontSize: 12
                              }}
                            >
                              —
                            </span>
                          )}
                      </div>
                    </td>

                    {/* STORIES */}

                    <td
                      style={{
                        padding: '12px 14px',
                        fontWeight: 700,
                        color: '#0369a1',
                        whiteSpace:
                          'nowrap'
                      }}
                    >
                      {a.story_count || 0}{' '}
                      stories
                    </td>

                    {/* ACTIONS */}

                    <td
                      style={{
                        padding: '12px 14px'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          gap: 6,
                          flexWrap: 'wrap'
                        }}
                      >

                        {can(
                          'manage_authors'
                        ) && (
                          <button
                            onClick={() =>
                              handleEdit(a)
                            }
                            style={{
                              padding:
                                '5px 10px',
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
                            ✏ Edit
                          </button>
                        )}

                        {can(
                          'manage_authors'
                        ) && (
                          <button
                            onClick={() =>
                              handleDelete(
                                a.id
                              )
                            }
                            style={{
                              padding:
                                '5px 10px',
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
                                'inherit',
                              fontWeight: 700
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
                      colSpan={7}
                      style={{
                        padding: 50,
                        textAlign:
                          'center',
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
    </AdminLayout>
  );
}

// ─────────────────────────────────────────────────────────────
// COMMENTS
// ─────────────────────────────────────────────────────────────

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
            fontSize: 13
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
        {['pending', 'approved', 'spam'].map(
          (s) => (
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
          )
        )}
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
            Loading...
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
                ].map((h) => (
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
              {comments.map((c) => (
                <tr
                  key={c.id}
                  style={{
                    borderBottom:
                      '1px solid #f1f5f9'
                  }}
                >
                  <td
                    style={{
                      padding:
                        '14px 16px'
                    }}
                  >
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
                      padding:
                        '14px 16px',
                      fontSize: 13,
                      color: '#475569',
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
                      color: '#94a3b8',
                      whiteSpace:
                        'nowrap'
                    }}
                  >
                    {new Date(
                      c.created_at
                    ).toLocaleDateString()}
                  </td>

                  <td
                    style={{
                      padding:
                        '14px 16px'
                    }}
                  >
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
                              borderRadius: 6,
                              cursor:
                                'pointer',
                              fontSize: 12,
                              fontFamily:
                                'inherit'
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

              {comments.length ===
                0 && (
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
                    No {status}{' '}
                    comments
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

// ─────────────────────────────────────────────────────────────
// VIDEOS
// ─────────────────────────────────────────────────────────────

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
      .then((r) =>
        setVideos(r.data || [])
      );

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const fd = new FormData();

      Object.entries(form).forEach(
        ([k, v]) =>
          fd.append(k, v)
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

      if (fileRef.current) {
        fileRef.current.value = '';
      }

      load();
    } catch (error) {
      console.error(error);
      alert('Failed to add video.');
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
            <label style={labelStyle}>
              Title *
            </label>

            <input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  title: e.target.value
                }))
              }
              required
              placeholder="Video title..."
              style={inputStyle}
            />

            <label style={labelStyle}>
              YouTube URL *
            </label>

            <input
              value={form.youtube_url}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  youtube_url:
                    e.target.value
                }))
              }
              required
              placeholder="https://youtube.com/watch?v=..."
              style={inputStyle}
            />

            <label style={labelStyle}>
              Category
            </label>

            <select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({
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
              ].map((c) => (
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
                padding: '12px',
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily:
                  'inherit'
              }}
            >
              {saving
                ? 'Saving...'
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
                ].map((h) => (
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
              {videos.map((v) => (
                <tr
                  key={v.id}
                  style={{
                    borderBottom:
                      '1px solid #f1f5f9'
                  }}
                >
                  <td
                    style={{
                      padding:
                        '12px 16px'
                    }}
                  >
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
                        onError={(e) =>
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

                  <td
                    style={{
                      padding:
                        '12px 16px',
                      fontWeight: 600,
                      fontSize: 14
                    }}
                  >
                    {v.title}
                  </td>

                  <td
                    style={{
                      padding:
                        '12px 16px'
                    }}
                  >
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

                  <td
                    style={{
                      padding:
                        '12px 16px',
                      fontSize: 12,
                      color: '#94a3b8'
                    }}
                  >
                    {new Date(
                      v.created_at
                    ).toLocaleDateString()}
                  </td>

                  <td
                    style={{
                      padding:
                        '12px 16px'
                    }}
                  >
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

// ─────────────────────────────────────────────────────────────
// ADS
// ─────────────────────────────────────────────────────────────

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
      .then((r) =>
        setAds(r.data || [])
      );

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const fd = new FormData();

      Object.entries(form).forEach(
        ([k, v]) =>
          fd.append(k, v)
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

      if (fileRef.current) {
        fileRef.current.value = '';
      }

      load();
    } catch (error) {
      console.error(error);
      alert('Failed to upload ad.');
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

            <label style={labelStyle}>
              Type
            </label>

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
              onChange={(e) =>
                setForm((f) => ({
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
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  link: e.target.value
                }))
              }
              placeholder="https://..."
              style={inputStyle}
            />

            <label style={labelStyle}>
              Caption
            </label>

            <input
              value={form.text}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  text: e.target.value
                }))
              }
              placeholder="Ad caption..."
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
                padding: '12px',
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily:
                  'inherit'
              }}
            >
              {saving
                ? 'Uploading...'
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
                ].map((h) => (
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
              {ads.map((ad) => (
                <tr
                  key={ad.id}
                  style={{
                    borderBottom:
                      '1px solid #f1f5f9'
                  }}
                >
                  <td
                    style={{
                      padding:
                        '12px 16px'
                    }}
                  >
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
                        onError={(e) =>
                          (e.target.style.display =
                            'none')
                        }
                      />
                    )}
                  </td>

                  <td
                    style={{
                      padding:
                        '12px 16px'
                    }}
                  >
                    <span
                      style={{
                        background:
                          '#e0f2fe',
                        color:
                          '#0369a1',
                        padding:
                          '3px 10px',
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
                      padding:
                        '12px 16px',
                      fontSize: 13
                    }}
                  >
                    {ad.position}
                  </td>

                  <td
                    style={{
                      padding:
                        '12px 16px',
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
                          color:
                            '#0369a1'
                        }}
                      >
                        {ad.link.substring(
                          0,
                          30
                        )}
                        …
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td
                    style={{
                      padding:
                        '12px 16px'
                    }}
                  >
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

// ─────────────────────────────────────────────────────────────
// SUBSCRIBERS
// ─────────────────────────────────────────────────────────────

export function Subscribers() {
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    subscribeAPI
      .getAll()
      .then((r) =>
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
            fontSize: 14
          }}
        >
          {
            subs.filter(
              (s) =>
                s.status ===
                'active'
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
              ].map((h) => (
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
                    padding:
                      '14px 16px',
                    fontWeight: 600,
                    fontSize: 14
                  }}
                >
                  {s.email}
                </td>

                <td
                  style={{
                    padding:
                      '14px 16px',
                    fontSize: 13,
                    color: '#475569'
                  }}
                >
                  {s.name || '—'}
                </td>

                <td
                  style={{
                    padding:
                      '14px 16px',
                    fontSize: 12,
                    color: '#94a3b8'
                  }}
                >
                  {new Date(
                    s.subscribed_at
                  ).toLocaleDateString()}
                </td>

                <td
                  style={{
                    padding:
                      '14px 16px'
                  }}
                >
                  <span
                    style={{
                      padding:
                        '4px 10px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
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

// ─────────────────────────────────────────────────────────────
// AUDIT LOGS
// ─────────────────────────────────────────────────────────────

export function AuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    analyticsAPI
      .getAuditLogs()
      .then((r) =>
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
              ].map((h) => (
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
                    padding:
                      '14px 16px',
                    fontWeight: 700,
                    fontSize: 14
                  }}
                >
                  {l.username}
                </td>

                <td
                  style={{
                    padding:
                      '14px 16px',
                    fontSize: 14
                  }}
                >
                  {l.action}
                </td>

                <td
                  style={{
                    padding:
                      '14px 16px',
                    fontSize: 12,
                    color: '#94a3b8'
                  }}
                >
                  {l.ip_address ||
                    '—'}
                </td>

                <td
                  style={{
                    padding:
                      '14px 16px',
                    fontSize: 12,
                    color: '#94a3b8',
                    whiteSpace:
                      'nowrap'
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