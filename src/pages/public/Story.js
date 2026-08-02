import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { PopularItem, AdBanner, SectionLabel, NewsletterWidget, WhatsAppCTA, Spinner, EmptyState, imgUrl, timeAgo } from '../../components/ui';
import { storiesAPI, commentsAPI, adsAPI } from '../../utils/api';

export default function StoryPage() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [related, setRelated] = useState([]);
  const [comments, setComments] = useState([]);
  const [popular, setPopular] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [commentMsg, setCommentMsg] = useState('');
  const [reactions, setReactions] = useState({ likes: 0, dislikes: 0 });

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      setLoading(true);
      try {
        const [sRes, cRes, pRes, aRes] = await Promise.all([
          storiesAPI.getOne(id),
          commentsAPI.getByStory(id),
          storiesAPI.getPopular({ limit: 5 }),
          adsAPI.getAll(),
        ]);
        const s = sRes.data;
        setStory(s);
        setReactions({ likes: s.likes || 0, dislikes: s.dislikes || 0 });
        setComments(cRes.data || []);
        setPopular(pRes.data || []);
        setAds(aRes.data || []);
        // Related
        const relRes = await storiesAPI.getAll({ category: s.category, limit: 5, status: 'published' });
        setRelated((relRes.data.stories || []).filter(r => (r._id || r.id).toString() !== id).slice(0, 4));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleReact = async (type) => {
    try {
      const res = await storiesAPI.react(id, type);
      setReactions(res.data);
    } catch (e) { console.error(e); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await commentsAPI.create({ story_id: id, ...form });
      setCommentMsg('✅ Comment submitted for review!');
      setForm({ name: '', email: '', comment: '' });
    } catch { setCommentMsg('❌ Error submitting. Please try again.'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <PublicLayout><Spinner /></PublicLayout>;
  if (!story) return <PublicLayout><EmptyState icon="📰" title="Story not found" message="This story may have been removed." /></PublicLayout>;

  const authorAvatar = story.author_avatar || story.author_image;

  return (
    <PublicLayout>
      <div style={{ maxWidth: 1260, margin: '0 auto', padding: '32px 20px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 36, alignItems: 'start' }}>

          {/* ── ARTICLE ──────────────────────────────────────── */}
          <article>
            {/* Breadcrumb */}
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#bbb', display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
              <Link to="/" style={{ color: '#bbb', textDecoration: 'none' }}>Home</Link>
              <span>›</span>
              <Link to={`/category/${story.category}`} style={{ color: '#c0392b', textDecoration: 'none' }}>{story.category}</Link>
            </div>

            <div style={{ marginBottom: 12 }}>
              <Link to={`/category/${story.category}`} style={{ background: '#c0392b', color: '#fff', padding: '4px 12px', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', textDecoration: 'none' }}>{story.category}</Link>
            </div>

            <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, lineHeight: 1.1, margin: '16px 0 14px' }}>{story.title}</h1>

            <div style={{ display: 'flex', gap: 12, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, color: '#5a5a5a', marginBottom: 24, flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid #e8e4d8', paddingBottom: 16 }}>
              {authorAvatar && (
                <img src={imgUrl(authorAvatar)} alt="" onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
                  style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e8e4d8' }} />
              )}
              <Link to={`/author/${encodeURIComponent(story.author)}`} style={{ fontWeight: 700, textDecoration: 'none', color: '#0d0d0d' }}>{story.author}</Link>
              <span style={{ color: '#ddd' }}>·</span>
              <span>{timeAgo(story.created_at || story.createdAt)}</span>
              <span style={{ color: '#ddd' }}>·</span>
              <span>👁 {Number(story.views || 0).toLocaleString()} views</span>
              {story.tags && story.tags.split(',').slice(0, 3).map(t => (
                <Link key={t} to={`/search?q=${encodeURIComponent(t.trim())}`} style={{ background: '#f0ece0', padding: '2px 8px', fontSize: 10, letterSpacing: 1, color: '#5a5a5a', textDecoration: 'none', border: '1px solid #e8e4d8' }}>#{t.trim()}</Link>
              ))}
            </div>

<img 
  src={imgUrl(story.image)} 
  alt={story.title} 
  loading="eager" 
  onError={e => { 
    e.target.onerror = null; 
    e.target.src = '/placeholder.jpg'; 
  }}
  style={{ 
    width: '50%', 
    height: 'auto',
    maxHeight: '650px',
    minHeight: '350px',
    aspectRatio: '16/9',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: 28,
    display: 'block'
  }} 
/>

            <div style={{ fontSize: '1.1rem', lineHeight: 1.85, fontFamily: "'Source Serif 4',Georgia,serif", marginBottom: 28 }}
              dangerouslySetInnerHTML={{ __html: story.description }} />

            {/* All tags */}
            {story.tags && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
                {story.tags.split(',').map(t => (
                  <Link key={t} to={`/search?q=${encodeURIComponent(t.trim())}`}
                    style={{ background: '#f0ece0', padding: '5px 12px', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, border: '1px solid #e8e4d8', textDecoration: 'none', color: '#0d0d0d' }}>#{t.trim()}</Link>
                ))}
              </div>
            )}

            {/* Reactions + Share */}
            <div style={{ display: 'flex', gap: 10, padding: '20px 0', borderTop: '1px solid #e8e4d8', borderBottom: '1px solid #e8e4d8', marginBottom: 28, flexWrap: 'wrap' }}>
              <button onClick={() => handleReact('likes')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: '#f0ece0', border: '1px solid #e8e4d8', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all .2s' }}>
                👍 {reactions.likes}
              </button>
              <button onClick={() => handleReact('dislikes')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: '#f0ece0', border: '1px solid #e8e4d8', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                👎 {reactions.dislikes}
              </button>
              <div style={{ flex: 1 }} />
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer"
                style={{ padding: '9px 16px', background: '#1877f2', color: '#fff', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, textDecoration: 'none', letterSpacing: 1 }}>Share</a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(story.title)}`} target="_blank" rel="noopener noreferrer"
                style={{ padding: '9px 16px', background: '#0d0d0d', color: '#fff', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, textDecoration: 'none', letterSpacing: 1 }}>Tweet</a>
              <a href={`https://wa.me/?text=${encodeURIComponent(story.title + ' ' + window.location.href)}`} target="_blank" rel="noopener noreferrer"
                style={{ padding: '9px 16px', background: '#25d366', color: '#fff', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, textDecoration: 'none', letterSpacing: 1 }}>WhatsApp</a>
            </div>

            {/* Author box */}
            <div style={{ background: '#f0ece0', padding: '24px', display: 'flex', gap: 18, alignItems: 'flex-start', marginBottom: 32, border: '1px solid #e8e4d8' }}>
              {authorAvatar && (
                <img src={imgUrl(authorAvatar)} alt="" onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
                  style={{ width: 62, height: 62, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #e8e4d8' }} />
              )}
              <div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#c0392b', marginBottom: 4 }}>About the Author</div>
                <Link to={`/author/${encodeURIComponent(story.author)}`} style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', fontWeight: 700, textDecoration: 'none', color: '#0d0d0d' }}>{story.author}</Link>
                <p style={{ fontSize: 13, color: '#5a5a5a', fontStyle: 'italic', marginTop: 6, lineHeight: 1.6 }}>
                  {story.author_bio_full || story.author_bio || 'Staff writer at Mahoko Friday News, covering the stories that matter most to Rwanda\'s youth.'}
                </p>
              </div>
            </div>

            <AdBanner ads={ads.slice(0, 2)} height={90} />

            {/* Related stories */}
            {related.length > 0 && (
              <section style={{ marginBottom: 36 }}>
                <SectionLabel>Related Stories</SectionLabel>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 20 }}>
                  {related.map(s => (
                    <Link key={s._id || s.id} to={`/story/${s._id || s.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <img src={imgUrl(s.image)} alt="" loading="lazy" onError={e => { e.target.onerror = null; e.target.src = '/placeholder.jpg'; }}
                       style={{
 width:'100%',
 aspectRatio:'16/10',
 height:'auto',
 objectFit:'cover',
 marginBottom:8,
 borderRadius:'6px'
}} />
                      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, color: '#c0392b', fontWeight: 800, letterSpacing: 2, marginBottom: 4 }}>{s.category}</div>
                      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '.88rem', fontWeight: 700, lineHeight: 1.3 }}>{(s.title || '').substring(0, 65)}</div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Comments section */}
            <section>
              <SectionLabel>Discussion ({comments.length})</SectionLabel>
              {comments.length > 0 ? (
                <div style={{ marginBottom: 28 }}>
                  {comments.map(c => (
                    <div key={c._id || c.id} style={{ padding: '16px 0', borderBottom: '1px solid #e8e4d8' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 36, height: 36, background: '#f0ece0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 15, color: '#c0392b' }}>
                          {(c.name || 'B').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700 }}>{c.name}</div>
                          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, color: '#bbb' }}>{timeAgo(c.created_at || c.createdAt)}</div>
                        </div>
                      </div>
                      <p style={{ fontSize: 14, lineHeight: 1.7, paddingLeft: 46 }}>{c.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#bbb', fontStyle: 'italic', fontSize: 14, marginBottom: 24 }}>Be the first to comment on this story.</p>
              )}

              {/* Comment form */}
              <div style={{ background: '#f0ece0', padding: '28px 24px', border: '1px solid #e8e4d8' }}>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.2rem', fontWeight: 700, marginBottom: 20 }}>Leave a Comment</h3>
                <form onSubmit={handleComment} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6, color: '#5a5a5a' }}>Name (blank = BANYA)</label>
                      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name…"
                        style={{ width: '100%', padding: '11px 14px', border: '1px solid #e8e4d8', background: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6, color: '#5a5a5a' }}>Email (optional)</label>
                      <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com"
                        style={{ width: '100%', padding: '11px 14px', border: '1px solid #e8e4d8', background: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6, color: '#5a5a5a' }}>Comment *</label>
                    <textarea value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} rows={5} required placeholder="Share your thoughts…"
                      style={{ width: '100%', padding: '11px 14px', border: '1px solid #e8e4d8', background: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                  </div>
                  <button type="submit" disabled={submitting}
                    style={{ background: '#0d0d0d', color: '#fff', border: 'none', padding: '14px', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? .7 : 1 }}>
                    {submitting ? 'Submitting…' : 'Post Comment'}
                  </button>
                  {commentMsg && <p style={{ color: commentMsg.startsWith('✅') ? '#166534' : '#c0392b', fontSize: 13 }}>{commentMsg}</p>}
                </form>
              </div>
            </section>
          </article>

          {/* ── SIDEBAR ─────────────────────────────────────── */}
          <aside>
            <div style={{ position: 'sticky', top: 72 }}>
              <div style={{ background: '#fff', border: '1px solid #e8e4d8', padding: 20, marginBottom: 22, borderTop: '3px solid #0d0d0d' }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase', borderBottom: '3px solid #0d0d0d', paddingBottom: 10, marginBottom: 16 }}>🔥 Most Read</div>
                {popular.map((p, i) => <PopularItem key={p._id || p.id} story={p} rank={i + 1} />)}
              </div>
              <NewsletterWidget />
              <AdBanner ads={ads.slice(2, 5)} height={200} />
              <WhatsAppCTA />
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
