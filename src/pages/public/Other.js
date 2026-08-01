import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { GridCard, PopularItem, NewsletterWidget, SectionLabel, Spinner, EmptyState, Pagination, imgUrl, timeAgo } from '../../components/ui';
import { storiesAPI, authorsAPI, videosAPI } from '../../utils/api';

// ─── SEARCH PAGE ─────────────────────────────────────────────────────────────
export function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [q]);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    storiesAPI.getAll({ search: q, page, limit: 12, status: 'published' })
      .then(r => {
        setResults(r.data.stories || []);
        setTotal(r.data.total || 0);
        setTotalPages(r.data.pages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [q, page]);

  return (
    <PublicLayout>
      <div style={{ maxWidth: 1260, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#c0392b', marginBottom: 8 }}>Search</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.6rem,4vw,2.5rem)', fontWeight: 900, borderLeft: '5px solid #c0392b', paddingLeft: 16, marginBottom: 8 }}>
            {q ? `Results for "${q}"` : 'Search Stories'}
          </h1>
          {q && <p style={{ color: '#5a5a5a', fontStyle: 'italic' }}><strong>{total}</strong> result{total !== 1 ? 's' : ''} found</p>}
        </div>

        {loading ? <Spinner /> : !q ? (
          <p style={{ color: '#bbb', fontStyle: 'italic' }}>Enter a keyword in the search box above.</p>
        ) : results.length === 0 ? (
          <EmptyState icon="🔍" title="No results found" message={`No stories matched "${q}". Try different keywords.`} />
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 24, marginBottom: 12 }}>
              {results.map(s => <GridCard key={s._id || s.id} story={s} />)}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>
    </PublicLayout>
  );
}

// ─── AUTHOR PAGE ─────────────────────────────────────────────────────────────
export function AuthorPage() {
  const { name } = useParams();
  const authorName = decodeURIComponent(name);
  const [stories, setStories] = useState([]);
  const [authorInfo, setAuthorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Find author by name
        const authRes = await authorsAPI.getAll();
        const author = (authRes.data || []).find(a => a.name === authorName);
        if (author) {
          setAuthorInfo(author);
          const sRes = await authorsAPI.getStories(author._id || author.id, { page, limit: 12 });
          setStories(sRes.data.stories || []);
          setTotalPages(Math.ceil((sRes.data.total || 0) / 12));
        } else {
          // Fallback: search by author name in stories
          const sRes = await storiesAPI.getAll({ search: authorName, limit: 50, status: 'published' });
          setStories(sRes.data.stories || []);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [authorName, page]);

  const totalViews = stories.reduce((a, s) => a + (s.views || 0), 0);
  const cats = [...new Set(stories.map(s => s.category))];
  const bio = authorInfo?.bio || stories[0]?.author_bio || 'Staff writer at Mahoko Friday News.';
  const avatar = authorInfo?.profile_image || stories[0]?.author_image || '';

  return (
    <PublicLayout>
      {/* Author header */}
      <div style={{ background: '#0d0d0d', padding: '32px 0 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -20, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 160, fontWeight: 900, color: 'rgba(255,255,255,.03)', letterSpacing: -6, lineHeight: 1, pointerEvents: 'none', textTransform: 'uppercase', userSelect: 'none' }}>
          {authorName.substring(0, 8)}
        </div>
        <div style={{ maxWidth: 1260, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', display: 'flex', gap: 8, marginBottom: 20 }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <span>Author</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {avatar ? (
                <img src={imgUrl(avatar)} alt="" onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
                  style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid #c0392b' }} />
              ) : (
                <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#c0392b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display',serif", fontSize: '2.5rem', color: '#fff', fontWeight: 700, border: '3px solid #c0392b' }}>
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}
              <span style={{ position: 'absolute', bottom: 6, right: 2, width: 14, height: 14, background: '#22c55e', border: '3px solid #0d0d0d', borderRadius: '50%' }}></span>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.4rem,3vw,2.2rem)', fontWeight: 900, color: '#fff', marginBottom: 6 }}>{authorName}</div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#b8860b', fontWeight: 700, marginBottom: 12 }}>Staff Writer · Mahoko Friday News</div>
              {authorInfo?.email && <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', marginBottom: 8 }}>📧 {authorInfo.email}</div>}
              <p style={{ fontSize: '.9rem', color: 'rgba(255,255,255,.55)', lineHeight: 1.6, fontStyle: 'italic', maxWidth: 600, marginBottom: 14 }}>{bio}</p>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[['Stories', stories.length], ['Views', totalViews.toLocaleString()], ['Topics', cats.length]].map(([l, v]) => (
                  <div key={l} style={{ padding: '10px 20px', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: '1.4rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{v}</div>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Category filter tabs */}
          <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,.08)' }}>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#fff', padding: '12px 18px', background: 'rgba(255,255,255,.1)', borderRight: '1px solid rgba(255,255,255,.06)' }}>All ({stories.length})</span>
            {cats.map(cat => (
              <span key={cat} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', padding: '12px 18px', borderRight: '1px solid rgba(255,255,255,.06)', cursor: 'pointer' }}>{cat}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1260, margin: '0 auto', padding: '32px 20px 40px' }}>
        {loading ? <Spinner /> : stories.length === 0 ? (
          <EmptyState icon="📝" title="No stories yet" message="This author hasn't published any stories yet." />
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 24 }}>
              {stories.map(s => <GridCard key={s._id || s.id} story={s} />)}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>
    </PublicLayout>
  );
}

// ─── VIDEOS PAGE ─────────────────────────────────────────────────────────────
export function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(null);
  const [playingTitle, setPlayingTitle] = useState('');

  useEffect(() => {
    videosAPI.getAll({ limit: 24 })
      .then(r => setVideos(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      {/* Header */}
      <div style={{ background: '#0d0d0d', borderBottom: '3px solid #c0392b', padding: '24px 0' }}>
        <div style={{ maxWidth: 1260, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: '2.2rem' }}>▶</span>
          <div>
            <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(1.6rem,4vw,2.8rem)', letterSpacing: 4, textTransform: 'uppercase', color: '#fff', lineHeight: 1 }}>Video</h1>
            <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', marginTop: 4 }}>MFN Video Library</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1260, margin: '0 auto', padding: '32px 20px 40px' }}>
        {/* Active player */}
        {playing && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.3rem', fontWeight: 700, marginBottom: 12 }}>{playingTitle}</h2>
            <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
              <iframe src={playing} title="MFN Video" allowFullScreen
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
            </div>
            <button onClick={() => { setPlaying(null); setPlayingTitle(''); }}
              style={{ marginTop: 12, padding: '8px 18px', background: '#0d0d0d', color: '#fff', border: 'none', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}>
              ✕ Close Player
            </button>
          </div>
        )}

        {loading ? <Spinner /> : videos.length === 0 ? (
          <EmptyState icon="🎬" title="No videos yet" message="Video content coming soon. Subscribe to our YouTube channel." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 24 }}>
            {videos.map(v => (
              <div key={v._id || v.id} onClick={() => { setPlaying(v.youtube_url); setPlayingTitle(v.title); }}
                style={{ cursor: 'pointer', background: '#fff', border: '1px solid #e8e4d8', overflow: 'hidden', transition: 'all .2s' }}>
                <div style={{ position: 'relative', aspectRatio: '16/9', background: '#0d0d0d', overflow: 'hidden' }}>
                  {v.thumbnail ? (
                    <img src={imgUrl(v.thumbnail)} alt="" loading="lazy" onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .8 }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '3rem', opacity: .3 }}>🎬</span>
                    </div>
                  )}
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.25)', transition: 'background .2s' }}>
                    <div style={{ width: 56, height: 56, background: '#c0392b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, boxShadow: '0 4px 20px rgba(0,0,0,.4)' }}>▶</div>
                  </div>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#c0392b', marginBottom: 4 }}>{v.category || 'Video'}</div>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '.95rem', fontWeight: 700, lineHeight: 1.3, marginBottom: 6 }}>{v.title}</h3>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, color: '#bbb' }}>{timeAgo(v.created_at || v.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* YouTube CTA */}
        <div style={{ background: '#c0392b', padding: '40px 32px', textAlign: 'center', marginTop: 48 }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: 12 }}>Watch More on YouTube</h3>
          <p style={{ color: 'rgba(255,255,255,.7)', fontStyle: 'italic', marginBottom: 24 }}>Subscribe to the MFN YouTube channel for breaking news, interviews, and live coverage.</p>
          <a href="https://youtube.com/@mahokofridaynews-n3p" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-block', background: '#fff', color: '#c0392b', padding: '14px 32px', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', textDecoration: 'none' }}>
            Subscribe to MFN TV →
          </a>
        </div>
      </div>
    </PublicLayout>
  );
}
