import React, { useEffect, useRef, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import {
  authorsAPI,
  commentsAPI,
  videosAPI,
  adsAPI,
  subscribeAPI,
  analyticsAPI,
} from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

/* ============================================================
   API / IMAGE HELPERS
============================================================ */

const API_BASE = 'https://mahokofridaynewsbackend.onrender.com';

const PLACEHOLDER = `${API_BASE}/uploads/placeholder.jpg`;

const getImgUrl = (path) => {
  if (!path || typeof path !== 'string') {
    return PLACEHOLDER;
  }

  const value = path.trim();

  if (!value) {
    return PLACEHOLDER;
  }

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:')
  ) {
    return value;
  }

  if (value.includes('..')) {
    return PLACEHOLDER;
  }

  const cleanPath = value
    .replace(/^uploads[\\/]/i, '')
    .replace(/^\/+/, '');

  return `${API_BASE}/uploads/${cleanPath}`;
};

/* ============================================================
   COMMON STYLES
============================================================ */

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
  background: '#fff',
  color: '#0f172a',
};

const labelStyle = {
  display: 'block',
  marginBottom: 6,
  fontWeight: 700,
  fontSize: 13,
  color: '#334155',
};

const primaryButtonStyle = {
  width: '100%',
  background: '#1a472a',
  color: '#fff',
  border: 'none',
  padding: 12,
  borderRadius: 10,
  fontWeight: 800,
  fontSize: 14,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const dangerButtonStyle = {
  padding: '6px 11px',
  background: '#fef2f2',
  color: '#dc2626',
  border: '1px solid #fca5a5',
  borderRadius: 7,
  cursor: 'pointer',
  fontSize: 12,
  fontFamily: 'inherit',
  fontWeight: 700,
};

const editButtonStyle = {
  padding: '6px 11px',
  background: '#eff6ff',
  color: '#2563eb',
  border: '1px solid #93c5fd',
  borderRadius: 7,
  cursor: 'pointer',
  fontSize: 12,
  fontFamily: 'inherit',
  fontWeight: 700,
};

function Card({ children, style, className = '' }) {
  return (
    <div
      className={`admin-card-base ${className}`}
      style={{
        background: '#fff',
        padding: 24,
        borderRadius: 20,
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 15px rgba(0,0,0,.03)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ============================================================
   RESPONSIVE CSS
============================================================ */

const responsiveCSS = `
  * {
    box-sizing: border-box;
  }

  .admin-form-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .admin-table-scroll {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch;
  }

  .admin-table-scroll table {
    min-width: 680px;
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
    background: rgba(15, 23, 42, .68);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 9999;
    overflow-y: auto;
  }

  .author-modal {
    width: 100%;
    max-width: 700px;
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

  .admin-message {
    padding: 14px 16px;
    border-radius: 10px;
    margin-bottom: 16px;
    font-size: 13px;
    font-weight: 600;
  }

  .admin-error {
    background: #fef2f2;
    color: #b91c1c;
    border: 1px solid #fecaca;
  }

  .admin-success {
    background: #f0fdf4;
    color: #166534;
    border: 1px solid #bbf7d0;
  }

  .admin-empty {
    padding: 40px 20px;
    text-align: center;
    color: #94a3b8;
    font-size: 14px;
  }

  .admin-stat {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px 16px;
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

/* ============================================================
   SMALL HELPERS
============================================================ */

const getErrorMessage = (
  error,
  fallback = 'Something went wrong.'
) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

const formatDate = (date) => {
  if (!date) return '—';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }

  return parsed.toLocaleDateString();
};

const formatDateTime = (date) => {
  if (!date) return '—';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }

  return parsed.toLocaleString();
};

/* ============================================================
   PAGINATION
============================================================ */

const ITEMS_PER_PAGE = 10;

function Pagination({
  currentPage,
  totalItems,
  itemsPerPage = ITEMS_PER_PAGE,
  onPageChange,
}) {
  const totalPages = Math.ceil(
    totalItems / itemsPerPage
  );

  if (totalPages <= 1) {
    return null;
  }

  const pages = [];

  for (let i = 1; i <= totalPages; i += 1) {
    pages.push(i);
  }

  const firstItem =
    totalItems === 0
      ? 0
      : (currentPage - 1) * itemsPerPage + 1;

  const lastItem = Math.min(
    currentPage * itemsPerPage,
    totalItems
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
        padding: 16,
        borderTop: '1px solid #e2e8f0',
        background: '#fff',
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: '#64748b',
          fontWeight: 600,
        }}
      >
        Showing {firstItem} - {lastItem} of {totalItems}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{
            padding: '7px 11px',
            border: '1px solid #e2e8f0',
            borderRadius: 7,
            background:
              currentPage === 1
                ? '#f8fafc'
                : '#fff',
            color:
              currentPage === 1
                ? '#cbd5e1'
                : '#334155',
            cursor:
              currentPage === 1
                ? 'not-allowed'
                : 'pointer',
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          ← Previous
        </button>

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            style={{
              minWidth: 34,
              height: 34,
              padding: '0 9px',
              border:
                currentPage === page
                  ? '1px solid #1a472a'
                  : '1px solid #e2e8f0',
              borderRadius: 7,
              background:
                currentPage === page
                  ? '#1a472a'
                  : '#fff',
              color:
                currentPage === page
                  ? '#fff'
                  : '#475569',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: 12,
            }}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          style={{
            padding: '7px 11px',
            border: '1px solid #e2e8f0',
            borderRadius: 7,
            background:
              currentPage === totalPages
                ? '#f8fafc'
                : '#fff',
            color:
              currentPage === totalPages
                ? '#cbd5e1'
                : '#334155',
            cursor:
              currentPage === totalPages
                ? 'not-allowed'
                : 'pointer',
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   AUTHORS
============================================================ */

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
  achievements: '',
};

function AuthorForm({
  data,
  setData,
  imageRef,
  openSection,
  setOpenSection,
}) {
  const toggleSection = (section) => {
    setOpenSection(
      openSection === section ? '' : section
    );
  };

  const FormSection = ({
    title,
    id,
    children,
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

  const update = (field, value) => {
    setData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <>
      <FormSection
        title="👤 Basic Information"
        id="basic"
      >
        <label style={labelStyle}>
          Full Name *
        </label>

        <input
          value={data.name}
          onChange={(e) =>
            update('name', e.target.value)
          }
          required
          placeholder="Author name..."
          style={inputStyle}
        />

        <label style={labelStyle}>
          Email
        </label>

        <input
          type="email"
          value={data.email}
          onChange={(e) =>
            update('email', e.target.value)
          }
          placeholder="author@mfn.com"
          style={inputStyle}
        />

        <label style={labelStyle}>
          Phone
        </label>

        <input
          value={data.phone}
          onChange={(e) =>
            update('phone', e.target.value)
          }
          placeholder="+250..."
          style={inputStyle}
        />

        <label style={labelStyle}>
          Location
        </label>

        <input
          value={data.location}
          onChange={(e) =>
            update('location', e.target.value)
          }
          placeholder="Kigali, Rwanda"
          style={inputStyle}
        />

        <label style={labelStyle}>
          Bio
        </label>

        <textarea
          value={data.bio}
          onChange={(e) =>
            update('bio', e.target.value)
          }
          rows={4}
          placeholder="Short biography..."
          style={{
            ...inputStyle,
            resize: 'vertical',
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
            padding: '8px 12px',
          }}
        />
      </FormSection>

      <FormSection
        title="🌐 Social Media & Website"
        id="social"
      >
        <div className="author-social-grid">
          <div>
            <label style={labelStyle}>
              Portfolio Website
            </label>

            <input
              value={data.portfolio}
              onChange={(e) =>
                update(
                  'portfolio',
                  e.target.value
                )
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
                update(
                  'linkedin',
                  e.target.value
                )
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
                update(
                  'facebook',
                  e.target.value
                )
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
                update(
                  'instagram',
                  e.target.value
                )
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
                update(
                  'twitter',
                  e.target.value
                )
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
                update(
                  'youtube',
                  e.target.value
                )
              }
              placeholder="YouTube channel URL"
              style={inputStyle}
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="⭐ Professional Information"
        id="professional"
      >
        <label style={labelStyle}>
          Expertise / Skills
        </label>

        <textarea
          value={data.expertise}
          onChange={(e) =>
            update(
              'expertise',
              e.target.value
            )
          }
          rows={3}
          placeholder="Sports journalism, politics, technology..."
          style={{
            ...inputStyle,
            resize: 'vertical',
          }}
        />

        <label style={labelStyle}>
          Awards / Achievements
        </label>

        <textarea
          value={data.achievements}
          onChange={(e) =>
            update(
              'achievements',
              e.target.value
            )
          }
          rows={3}
          placeholder="Awards, certificates, major achievements..."
          style={{
            ...inputStyle,
            resize: 'vertical',
          }}
        />
      </FormSection>
    </>
  );
}

export function Authors() {
  const [authors, setAuthors] = useState([]);
  const [form, setForm] = useState(emptyAuthor);
  const [editForm, setEditForm] =
    useState(emptyAuthor);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [editAuthor, setEditAuthor] =
    useState(null);

  const [openSection, setOpenSection] =
    useState('basic');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [currentPage, setCurrentPage] =
    useState(1);

  const fileRef = useRef(null);
  const editFileRef = useRef(null);

  const { can } = useAuth();

  const load = async () => {
    try {
      setLoading(true);
      setError('');

      const response =
        await authorsAPI.getAll();

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.authors || [];

      setAuthors(data);
      setCurrentPage(1);
    } catch (err) {
      console.error(
        'Failed to load authors:',
        err
      );

      setError(
        getErrorMessage(
          err,
          'Failed to load authors.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const paginatedAuthors =
    authors.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError(
        'Author name is required.'
      );
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const fd = new FormData();

      Object.entries(form).forEach(
        ([key, value]) => {
          fd.append(key, value || '');
        }
      );

      if (fileRef.current?.files?.[0]) {
        fd.append(
          'profile_image',
          fileRef.current.files[0]
        );
      }

      await authorsAPI.create(fd);

      setForm(emptyAuthor);

      if (fileRef.current) {
        fileRef.current.value = '';
      }

      setSuccess(
        'Author created successfully.'
      );

      await load();
    } catch (err) {
      console.error(
        'Create author error:',
        err
      );

      setError(
        getErrorMessage(
          err,
          'Failed to create author.'
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (author) => {
    setEditAuthor(author);

    setEditForm({
      name: author.name || '',
      bio: author.bio || '',
      email: author.email || '',
      twitter: author.twitter || '',
      portfolio:
        author.portfolio || '',
      linkedin:
        author.linkedin || '',
      facebook:
        author.facebook || '',
      instagram:
        author.instagram || '',
      youtube:
        author.youtube || '',
      phone: author.phone || '',
      location:
        author.location || '',
      expertise:
        author.expertise || '',
      achievements:
        author.achievements || '',
    });

    setOpenSection('basic');
    setEditing(true);
    setError('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editAuthor) return;

    if (!editForm.name.trim()) {
      setError(
        'Author name is required.'
      );
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const fd = new FormData();

      Object.entries(editForm).forEach(
        ([key, value]) => {
          fd.append(key, value || '');
        }
      );

      if (editFileRef.current?.files?.[0]) {
        fd.append(
          'profile_image',
          editFileRef.current.files[0]
        );
      }

      await authorsAPI.update(
        editAuthor.id,
        fd
      );

      setEditing(false);
      setEditAuthor(null);

      if (editFileRef.current) {
        editFileRef.current.value = '';
      }

      setSuccess(
        'Author updated successfully.'
      );

      await load();
    } catch (err) {
      console.error(
        'Update author error:',
        err
      );

      setError(
        getErrorMessage(
          err,
          'Failed to update author.'
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this author?'
      )
    ) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      await authorsAPI.delete(id);

      setSuccess(
        'Author deleted successfully.'
      );

      await load();
    } catch (err) {
      console.error(
        'Delete author error:',
        err
      );

      setError(
        getErrorMessage(
          err,
          'Failed to delete author.'
        )
      );
    }
  };

  const closeEdit = () => {
    if (saving) return;

    setEditing(false);
    setEditAuthor(null);
  };

  return (
    <AdminLayout>
      <style>{responsiveCSS}</style>

      <h1
        style={{
          fontWeight: 800,
          fontSize: '1.6rem',
          margin: '0 0 24px',
          letterSpacing: '-0.03em',
        }}
      >
        Author Profiles
      </h1>

      {error && (
        <div className="admin-message admin-error">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-message admin-success">
          {success}
        </div>
      )}

      <div className="admin-form-grid">
        <Card>
          <h3
            style={{
              fontWeight: 800,
              margin: '0 0 20px',
              fontSize: '1rem',
            }}
          >
            Add New Author
          </h3>

          <form onSubmit={handleSubmit}>
            <AuthorForm
              data={form}
              setData={setForm}
              imageRef={fileRef}
              openSection={openSection}
              setOpenSection={setOpenSection}
            />

            <button
              type="submit"
              disabled={saving}
              style={{
                ...primaryButtonStyle,
                background: saving
                  ? '#64748b'
                  : '#1a472a',
                cursor: saving
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              {saving
                ? 'Creating...'
                : 'Create Author'}
            </button>
          </form>
        </Card>

        <Card
          className="admin-table-scroll"
          style={{
            padding: 0,
            overflow: 'hidden',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse:
                'separate',
              borderSpacing: 0,
            }}
          >
            <thead>
              <tr>
                {[
                  'Photo',
                  'Name',
                  'Email',
                  'Stories',
                  'Actions',
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      padding:
                        '14px 16px',
                      background:
                        '#f8fafc',
                      color: '#64748b',
                      fontSize: 11,
                      textTransform:
                        'uppercase',
                      fontWeight: 800,
                      borderBottom:
                        '1px solid #e2e8f0',
                      textAlign: 'left',
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="admin-empty"
                  >
                    Loading authors...
                  </td>
                </tr>
              ) : (
                <>
                  {paginatedAuthors.map(
                    (author) => (
                      <tr
                        key={author.id}
                        style={{
                          borderBottom:
                            '1px solid #f1f5f9',
                        }}
                      >
                        <td
                          style={{
                            padding:
                              '14px 16px',
                          }}
                        >
                          <img
                            src={getImgUrl(
                              author.profile_image
                            )}
                            alt={
                              author.name ||
                              'Author'
                            }
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius:
                                '50%',
                              objectFit:
                                'cover',
                            }}
                            onError={(e) => {
                              e.currentTarget.onerror =
                                null;

                              e.currentTarget.src =
                                PLACEHOLDER;
                            }}
                          />
                        </td>

                        <td
                          style={{
                            padding:
                              '14px 16px',
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 14,
                            }}
                          >
                            {author.name}
                          </div>

                          <div
                            style={{
                              fontSize: 12,
                              color:
                                '#94a3b8',
                              maxWidth: 220,
                            }}
                          >
                            {author.bio
                              ? author.bio.substring(
                                  0,
                                  70
                                )
                              : ''}

                            {author.bio
                              ?.length > 70
                              ? '...'
                              : ''}
                          </div>
                        </td>

                        <td
                          style={{
                            padding:
                              '14px 16px',
                            fontSize: 13,
                            color:
                              '#475569',
                          }}
                        >
                          {author.email ||
                            '—'}
                        </td>

                        <td
                          style={{
                            padding:
                              '14px 16px',
                            fontWeight: 700,
                            color:
                              '#0369a1',
                          }}
                        >
                          {author.story_count ||
                            0}
                        </td>

                        <td
                          style={{
                            padding:
                              '14px 16px',
                          }}
                        >
                          <div className="author-action-buttons">
                            {can(
                              'manage_authors'
                            ) && (
                              <button
                                type="button"
                                onClick={() =>
                                  openEdit(
                                    author
                                  )
                                }
                                style={
                                  editButtonStyle
                                }
                              >
                                ✏️ Edit
                              </button>
                            )}

                            {can(
                              'manage_authors'
                            ) && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    author.id
                                  )
                                }
                                style={
                                  dangerButtonStyle
                                }
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  )}

                  {authors.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="admin-empty"
                      >
                        No authors found.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalItems={authors.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </Card>
      </div>

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
                    color: '#0f172a',
                  }}
                >
                  Edit Author
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: '#94a3b8',
                    marginTop: 3,
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
                  cursor: saving
                    ? 'not-allowed'
                    : 'pointer',
                  fontSize: 20,
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
                  openSection={openSection}
                  setOpenSection={
                    setOpenSection
                  }
                />

                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    marginTop: 8,
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
                      cursor: saving
                        ? 'not-allowed'
                        : 'pointer',
                      fontFamily:
                        'inherit',
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
                        'inherit',
                    }}
                  >
                    {saving
                      ? 'Saving...'
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

/* ============================================================
   COMMENTS
============================================================ */

export function Comments() {
  const [comments, setComments] =
    useState([]);

  const [total, setTotal] =
    useState(0);

  const [status, setStatus] =
    useState('pending');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [currentPage, setCurrentPage] =
    useState(1);

  const { can } = useAuth();

  const load = async () => {
    try {
      setLoading(true);
      setError('');

      const response =
        await commentsAPI.getAll({
          status,
          limit: 1000,
        });

      const data =
        response.data?.comments || [];

      setComments(data);

      setTotal(
        response.data?.total ??
          data.length
      );

      setCurrentPage(1);
    } catch (err) {
      console.error(
        'Comments loading error:',
        err
      );

      setError(
        getErrorMessage(
          err,
          'Failed to load comments.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  const paginatedComments =
    comments.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );

  const approveComment = async (id) => {
    try {
      await commentsAPI.approve(id);
      await load();
    } catch (err) {
      alert(
        getErrorMessage(
          err,
          'Failed to approve comment.'
        )
      );
    }
  };

  const deleteComment = async (id) => {
    if (
      !window.confirm(
        'Delete this comment?'
      )
    ) {
      return;
    }

    try {
      await commentsAPI.delete(id);
      await load();
    } catch (err) {
      alert(
        getErrorMessage(
          err,
          'Failed to delete comment.'
        )
      );
    }
  };

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
          gap: 12,
        }}
      >
        <h1
          style={{
            fontWeight: 800,
            fontSize: '1.6rem',
            margin: 0,
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
            whiteSpace: 'nowrap',
          }}
        >
          {total} {status}
        </span>
      </div>

      {error && (
        <div className="admin-message admin-error">
          {error}
        </div>
      )}

      <div
        className="admin-flex-wrap"
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 20,
        }}
      >
        {[
          'pending',
          'approved',
          'spam',
        ].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() =>
              setStatus(item)
            }
            style={{
              padding: '8px 18px',
              background:
                status === item
                  ? '#1a472a'
                  : '#fff',
              color:
                status === item
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
              fontFamily: 'inherit',
            }}
          >
            {item}
          </button>
        ))}
      </div>

      <Card
        className="admin-table-scroll"
        style={{
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div className="admin-empty">
            Loading comments...
          </div>
        ) : (
          <>
            <table
              style={{
                width: '100%',
                borderCollapse:
                  'separate',
                borderSpacing: 0,
              }}
            >
              <thead>
                <tr>
                  {[
                    'Author',
                    'Story',
                    'Comment',
                    'Date',
                    'Actions',
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding:
                          '14px 16px',
                        background:
                          '#f8fafc',
                        color: '#64748b',
                        fontSize: 11,
                        textTransform:
                          'uppercase',
                        fontWeight: 800,
                        borderBottom:
                          '1px solid #e2e8f0',
                        textAlign: 'left',
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {paginatedComments.map(
                  (comment) => (
                    <tr
                      key={comment.id}
                      style={{
                        borderBottom:
                          '1px solid #f1f5f9',
                      }}
                    >
                      <td
                        style={{
                          padding:
                            '14px 16px',
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 14,
                          }}
                        >
                          {comment.name}
                        </div>

                        <div
                          style={{
                            fontSize: 12,
                            color:
                              '#94a3b8',
                          }}
                        >
                          {comment.email}
                        </div>
                      </td>

                      <td
                        style={{
                          padding:
                            '14px 16px',
                          fontSize: 13,
                          color:
                            '#475569',
                          maxWidth: 180,
                        }}
                      >
                        <div
                          style={{
                            overflow:
                              'hidden',
                            textOverflow:
                              'ellipsis',
                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          {
                            comment.story_title
                          }
                        </div>
                      </td>

                      <td
                        style={{
                          padding:
                            '14px 16px',
                          fontSize: 14,
                          maxWidth: 300,
                        }}
                      >
                        <div
                          style={{
                            overflow:
                              'hidden',
                            textOverflow:
                              'ellipsis',
                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          {
                            comment.comment
                          }
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
                            'nowrap',
                        }}
                      >
                        {formatDate(
                          comment.created_at
                        )}
                      </td>

                      <td
                        style={{
                          padding:
                            '14px 16px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            gap: 6,
                            flexWrap:
                              'wrap',
                          }}
                        >
                          {status ===
                            'pending' &&
                            can(
                              'approve_comments'
                            ) && (
                              <button
                                type="button"
                                onClick={() =>
                                  approveComment(
                                    comment.id
                                  )
                                }
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
                                    'nowrap',
                                }}
                              >
                                ✓ Approve
                              </button>
                            )}

                          {can(
                            'delete_content'
                          ) && (
                            <button
                              type="button"
                              onClick={() =>
                                deleteComment(
                                  comment.id
                                )
                              }
                              style={
                                dangerButtonStyle
                              }
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )}

                {comments.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="admin-empty"
                    >
                      No {status} comments.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <Pagination
              currentPage={currentPage}
              totalItems={comments.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </Card>
    </AdminLayout>
  );
}

/* ============================================================
   VIDEOS
============================================================ */

export function Videos() {
  const [videos, setVideos] =
    useState([]);

  const [form, setForm] = useState({
    title: '',
    youtube_url: '',
    category: 'Sport',
  });

  const [saving, setSaving] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  const [currentPage, setCurrentPage] =
    useState(1);

  const fileRef = useRef(null);

  const load = async () => {
    try {
      setLoading(true);
      setError('');

      const response =
        await videosAPI.getAll({
          limit: 1000,
        });

      const data = Array.isArray(
        response.data
      )
        ? response.data
        : response.data?.videos || [];

      setVideos(data);
      setCurrentPage(1);
    } catch (err) {
      console.error(
        'Videos loading error:',
        err
      );

      setError(
        getErrorMessage(
          err,
          'Failed to load videos.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const paginatedVideos =
    videos.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError(
        'Video title is required.'
      );
      return;
    }

    if (!form.youtube_url.trim()) {
      setError(
        'YouTube URL is required.'
      );
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const fd = new FormData();

      Object.entries(form).forEach(
        ([key, value]) => {
          fd.append(key, value);
        }
      );

      if (fileRef.current?.files?.[0]) {
        fd.append(
          'thumbnail',
          fileRef.current.files[0]
        );
      }

      await videosAPI.create(fd);

      setForm({
        title: '',
        youtube_url: '',
        category: 'Sport',
      });

      if (fileRef.current) {
        fileRef.current.value = '';
      }

      setSuccess(
        'Video added successfully.'
      );

      await load();
    } catch (err) {
      console.error(
        'Create video error:',
        err
      );

      setError(
        getErrorMessage(
          err,
          'Failed to add video.'
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteVideo = async (id) => {
    if (
      !window.confirm(
        'Delete this video?'
      )
    ) {
      return;
    }

    try {
      await videosAPI.delete(id);
      await load();
    } catch (err) {
      alert(
        getErrorMessage(
          err,
          'Failed to delete video.'
        )
      );
    }
  };

  return (
    <AdminLayout>
      <style>{responsiveCSS}</style>

      <h1
        style={{
          fontWeight: 800,
          fontSize: '1.6rem',
          margin: '0 0 24px',
        }}
      >
        Videos
      </h1>

      {error && (
        <div className="admin-message admin-error">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-message admin-success">
          {success}
        </div>
      )}

      <div className="admin-form-grid">
        <Card>
          <h3
            style={{
              fontWeight: 800,
              margin: '0 0 20px',
              fontSize: '1rem',
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
                setForm((current) => ({
                  ...current,
                  title: e.target.value,
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
                setForm((current) => ({
                  ...current,
                  youtube_url:
                    e.target.value,
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
                setForm((current) => ({
                  ...current,
                  category:
                    e.target.value,
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
                'Entertainment',
              ].map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
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
                padding: '8px 12px',
              }}
            />

            <button
              type="submit"
              disabled={saving}
              style={{
                ...primaryButtonStyle,
                background: saving
                  ? '#64748b'
                  : '#1a472a',
                cursor: saving
                  ? 'not-allowed'
                  : 'pointer',
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
            overflow: 'hidden',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse:
                'separate',
              borderSpacing: 0,
            }}
          >
            <thead>
              <tr>
                {[
                  'Thumb',
                  'Title',
                  'Category',
                  'Date',
                  'Action',
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      padding:
                        '14px 16px',
                      background:
                        '#f8fafc',
                      color: '#64748b',
                      fontSize: 11,
                      textTransform:
                        'uppercase',
                      fontWeight: 800,
                      borderBottom:
                        '1px solid #e2e8f0',
                      textAlign: 'left',
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="admin-empty"
                  >
                    Loading videos...
                  </td>
                </tr>
              ) : (
                <>
                  {paginatedVideos.map(
                    (video) => (
                      <tr
                        key={video.id}
                        style={{
                          borderBottom:
                            '1px solid #f1f5f9',
                        }}
                      >
                        <td
                          style={{
                            padding:
                              '12px 16px',
                          }}
                        >
                          {video.thumbnail ? (
                            <img
                              src={getImgUrl(
                                video.thumbnail
                              )}
                              alt={
                                video.title ||
                                'Video'
                              }
                              style={{
                                width: 80,
                                height: 50,
                                objectFit:
                                  'cover',
                                borderRadius: 6,
                              }}
                              onError={(e) => {
                                e.currentTarget.onerror =
                                  null;

                                e.currentTarget.src =
                                  PLACEHOLDER;
                              }}
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
                                fontSize: 20,
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
                            fontSize: 14,
                          }}
                        >
                          {video.title}
                        </td>

                        <td
                          style={{
                            padding:
                              '12px 16px',
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
                              fontWeight: 700,
                            }}
                          >
                            {video.category}
                          </span>
                        </td>

                        <td
                          style={{
                            padding:
                              '12px 16px',
                            fontSize: 12,
                            color:
                              '#94a3b8',
                          }}
                        >
                          {formatDate(
                            video.created_at
                          )}
                        </td>

                        <td
                          style={{
                            padding:
                              '12px 16px',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              deleteVideo(
                                video.id
                              )
                            }
                            style={
                              dangerButtonStyle
                            }
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  )}

                  {videos.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="admin-empty"
                      >
                        No videos found.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalItems={videos.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </Card>
      </div>
    </AdminLayout>
  );
}

/* ============================================================
   ADS
============================================================ */

export function Ads() {
  const [ads, setAds] =
    useState([]);

  const [form, setForm] = useState({
    type: 'image',
    link: '',
    position: 'sidebar',
    text: '',
  });

  const [saving, setSaving] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  const [currentPage, setCurrentPage] =
    useState(1);

  const fileRef = useRef(null);

  const load = async () => {
    try {
      setLoading(true);
      setError('');

      const response =
        await adsAPI.getAll();

      const data = Array.isArray(
        response.data
      )
        ? response.data
        : response.data?.ads || [];

      setAds(data);
      setCurrentPage(1);
    } catch (err) {
      console.error(
        'Ads loading error:',
        err
      );

      setError(
        getErrorMessage(
          err,
          'Failed to load advertisements.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const paginatedAds =
    ads.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !fileRef.current?.files?.[0]
    ) {
      setError(
        'Please select an advertisement media file.'
      );
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const fd = new FormData();

      Object.entries(form).forEach(
        ([key, value]) => {
          fd.append(
            key,
            value || ''
          );
        }
      );

      fd.append(
        'file',
        fileRef.current.files[0]
      );

      await adsAPI.create(fd);

      setForm({
        type: 'image',
        link: '',
        position: 'sidebar',
        text: '',
      });

      if (fileRef.current) {
        fileRef.current.value = '';
      }

      setSuccess(
        'Advertisement uploaded successfully.'
      );

      await load();
    } catch (err) {
      console.error(
        'Create ad error:',
        err
      );

      setError(
        getErrorMessage(
          err,
          'Failed to upload advertisement.'
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteAd = async (id) => {
    if (
      !window.confirm(
        'Delete this advertisement?'
      )
    ) {
      return;
    }

    try {
      await adsAPI.delete(id);
      await load();
    } catch (err) {
      alert(
        getErrorMessage(
          err,
          'Failed to delete advertisement.'
        )
      );
    }
  };

  return (
    <AdminLayout>
      <style>{responsiveCSS}</style>

      <h1
        style={{
          fontWeight: 800,
          fontSize: '1.6rem',
          margin: '0 0 24px',
        }}
      >
        Advertisements
      </h1>

      {error && (
        <div className="admin-message admin-error">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-message admin-success">
          {success}
        </div>
      )}

      <div className="admin-form-grid">
        <Card>
          <h3
            style={{
              fontWeight: 800,
              margin: '0 0 20px',
              fontSize: '1rem',
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
                setForm((current) => ({
                  ...current,
                  type: e.target.value,
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
                setForm((current) => ({
                  ...current,
                  position:
                    e.target.value,
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
              type="url"
              value={form.link}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  link: e.target.value,
                }))
              }
              placeholder="https://example.com"
              style={inputStyle}
            />

            <label style={labelStyle}>
              Caption
            </label>

            <input
              value={form.text}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  text: e.target.value,
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
              accept={
                form.type === 'video'
                  ? 'video/*'
                  : 'image/*'
              }
              required
              style={{
                ...inputStyle,
                padding: '8px 12px',
              }}
            />

            <button
              type="submit"
              disabled={saving}
              style={{
                ...primaryButtonStyle,
                background: saving
                  ? '#64748b'
                  : '#1a472a',
                cursor: saving
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              {saving
                ? 'Uploading...'
                : 'Add Advertisement'}
            </button>
          </form>
        </Card>

        <Card
          className="admin-table-scroll"
          style={{
            padding: 0,
            overflow: 'hidden',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse:
                'separate',
              borderSpacing: 0,
            }}
          >
            <thead>
              <tr>
                {[
                  'Preview',
                  'Type',
                  'Position',
                  'Link',
                  'Actions',
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      padding:
                        '14px 16px',
                      background:
                        '#f8fafc',
                      color: '#64748b',
                      fontSize: 11,
                      textTransform:
                        'uppercase',
                      fontWeight: 800,
                      borderBottom:
                        '1px solid #e2e8f0',
                      textAlign: 'left',
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="admin-empty"
                  >
                    Loading advertisements...
                  </td>
                </tr>
              ) : (
                <>
                  {paginatedAds.map(
                    (ad) => (
                      <tr
                        key={ad.id}
                        style={{
                          borderBottom:
                            '1px solid #f1f5f9',
                        }}
                      >
                        <td
                          style={{
                            padding:
                              '12px 16px',
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
                                borderRadius: 6,
                                background:
                                  '#f1f5f9',
                              }}
                              muted
                              controls
                              preload="metadata"
                            />
                          ) : (
                            <img
                              src={getImgUrl(
                                ad.file
                              )}
                              alt={
                                ad.text ||
                                'Advertisement'
                              }
                              style={{
                                width: 100,
                                height: 60,
                                objectFit:
                                  'cover',
                                borderRadius: 6,
                              }}
                              onError={(e) => {
                                e.currentTarget.onerror =
                                  null;

                                e.currentTarget.src =
                                  PLACEHOLDER;
                              }}
                            />
                          )}
                        </td>

                        <td
                          style={{
                            padding:
                              '12px 16px',
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
                              fontWeight: 700,
                            }}
                          >
                            {ad.type}
                          </span>
                        </td>

                        <td
                          style={{
                            padding:
                              '12px 16px',
                            fontSize: 13,
                          }}
                        >
                          {ad.position}
                        </td>

                        <td
                          style={{
                            padding:
                              '12px 16px',
                            fontSize: 12,
                            color:
                              '#0369a1',
                            maxWidth: 220,
                          }}
                        >
                          {ad.link ? (
                            <a
                              href={ad.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color:
                                  '#0369a1',
                                textDecoration:
                                  'none',
                              }}
                            >
                              {ad.link.length >
                              35
                                ? `${ad.link.substring(
                                    0,
                                    35
                                  )}...`
                                : ad.link}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>

                        <td
                          style={{
                            padding:
                              '12px 16px',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              deleteAd(
                                ad.id
                              )
                            }
                            style={
                              dangerButtonStyle
                            }
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  )}

                  {ads.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="admin-empty"
                      >
                        No advertisements found.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalItems={ads.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </Card>
      </div>
    </AdminLayout>
  );
}

/* ============================================================
   SUBSCRIBERS
============================================================ */

export function Subscribers() {
  const [subs, setSubs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [currentPage, setCurrentPage] =
    useState(1);

  const load = async () => {
    try {
      setLoading(true);
      setError('');

      const response =
        await subscribeAPI.getAll();

      const data = Array.isArray(
        response.data
      )
        ? response.data
        : response.data?.subscribers || [];

      setSubs(data);
      setCurrentPage(1);
    } catch (err) {
      console.error(
        'Subscribers loading error:',
        err
      );

      setError(
        getErrorMessage(
          err,
          'Failed to load subscribers.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const paginatedSubs =
    subs.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );

  const activeCount =
    subs.filter(
      (subscriber) =>
        subscriber.status === 'active'
    ).length;

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
          gap: 12,
        }}
      >
        <h1
          style={{
            fontWeight: 800,
            fontSize: '1.6rem',
            margin: 0,
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
            whiteSpace: 'nowrap',
          }}
        >
          {activeCount} active
        </span>
      </div>

      {error && (
        <div className="admin-message admin-error">
          {error}
        </div>
      )}

      <Card
        className="admin-table-scroll"
        style={{
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse:
              'separate',
            borderSpacing: 0,
          }}
        >
          <thead>
            <tr>
              {[
                'Email',
                'Name',
                'Joined',
                'Status',
              ].map((heading) => (
                <th
                  key={heading}
                  style={{
                    padding:
                      '14px 16px',
                    background:
                      '#f8fafc',
                    color: '#64748b',
                    fontSize: 11,
                    textTransform:
                      'uppercase',
                    fontWeight: 800,
                    borderBottom:
                      '1px solid #e2e8f0',
                    textAlign: 'left',
                  }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="admin-empty"
                >
                  Loading subscribers...
                </td>
              </tr>
            ) : (
              <>
                {paginatedSubs.map(
                  (subscriber) => (
                    <tr
                      key={subscriber.id}
                      style={{
                        borderBottom:
                          '1px solid #f1f5f9',
                      }}
                    >
                      <td
                        style={{
                          padding:
                            '14px 16px',
                          fontWeight: 600,
                          fontSize: 14,
                        }}
                      >
                        {subscriber.email}
                      </td>

                      <td
                        style={{
                          padding:
                            '14px 16px',
                          fontSize: 13,
                          color:
                            '#475569',
                        }}
                      >
                        {subscriber.name ||
                          '—'}
                      </td>

                      <td
                        style={{
                          padding:
                            '14px 16px',
                          fontSize: 12,
                          color:
                            '#94a3b8',
                        }}
                      >
                        {formatDate(
                          subscriber.subscribed_at
                        )}
                      </td>

                      <td
                        style={{
                          padding:
                            '14px 16px',
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
                              subscriber.status ===
                              'active'
                                ? '#dcfce7'
                                : '#f1f5f9',
                            color:
                              subscriber.status ===
                              'active'
                                ? '#166534'
                                : '#475569',
                          }}
                        >
                          {subscriber.status ||
                            'unknown'}
                        </span>
                      </td>
                    </tr>
                  )
                )}

                {subs.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="admin-empty"
                    >
                      No subscribers found.
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>

        <Pagination
          currentPage={currentPage}
          totalItems={subs.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </Card>
    </AdminLayout>
  );
}

/* ============================================================
   AUDIT LOGS
============================================================ */

export function AuditLogs() {
  const [logs, setLogs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [currentPage, setCurrentPage] =
    useState(1);

  const load = async () => {
    try {
      setLoading(true);
      setError('');

      const response =
        await analyticsAPI.getAuditLogs();

      const data = Array.isArray(
        response.data
      )
        ? response.data
        : response.data?.logs || [];

      setLogs(data);
      setCurrentPage(1);
    } catch (err) {
      console.error(
        'Audit logs loading error:',
        err
      );

      setError(
        getErrorMessage(
          err,
          'Failed to load audit logs.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const paginatedLogs =
    logs.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );

  return (
    <AdminLayout>
      <style>{responsiveCSS}</style>

      <h1
        style={{
          fontWeight: 800,
          fontSize: '1.6rem',
          margin: '0 0 24px',
        }}
      >
        Security Audit Logs
      </h1>

      {error && (
        <div className="admin-message admin-error">
          {error}
        </div>
      )}

      <Card
        className="admin-table-scroll"
        style={{
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse:
              'separate',
            borderSpacing: 0,
          }}
        >
          <thead>
            <tr>
              {[
                'User',
                'Action',
                'IP',
                'Timestamp',
              ].map((heading) => (
                <th
                  key={heading}
                  style={{
                    padding:
                      '14px 16px',
                    background:
                      '#f8fafc',
                    color: '#64748b',
                    fontSize: 11,
                    textTransform:
                      'uppercase',
                    fontWeight: 800,
                    borderBottom:
                      '1px solid #e2e8f0',
                    textAlign: 'left',
                  }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="admin-empty"
                >
                  Loading audit logs...
                </td>
              </tr>
            ) : (
              <>
                {paginatedLogs.map(
                  (log) => (
                    <tr
                      key={log.id}
                      style={{
                        borderBottom:
                          '1px solid #f1f5f9',
                      }}
                    >
                      <td
                        style={{
                          padding:
                            '14px 16px',
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        {log.username ||
                          log.user_name ||
                          '—'}
                      </td>

                      <td
                        style={{
                          padding:
                            '14px 16px',
                          fontSize: 14,
                        }}
                      >
                        {log.action || '—'}
                      </td>

                      <td
                        style={{
                          padding:
                            '14px 16px',
                          fontSize: 12,
                          color:
                            '#94a3b8',
                        }}
                      >
                        {log.ip_address ||
                          '—'}
                      </td>

                      <td
                        style={{
                          padding:
                            '14px 16px',
                          fontSize: 12,
                          color:
                            '#94a3b8',
                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        {formatDateTime(
                          log.created_at
                        )}
                      </td>
                    </tr>
                  )
                )}

                {logs.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="admin-empty"
                    >
                      No audit logs found.
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>

        <Pagination
          currentPage={currentPage}
          totalItems={logs.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </Card>
    </AdminLayout>
  );
}

/* ============================================================
   DEFAULT EXPORT
============================================================ */

export default Authors;
