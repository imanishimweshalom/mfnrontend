import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { PopularItem, AdBanner, SectionLabel, NewsletterWidget, WhatsAppCTA, Spinner, EmptyState, imgUrl, timeAgo } from '../../components/ui';
import { storiesAPI, commentsAPI, adsAPI } from '../../utils/api';

// Fix: Define a centralized placeholder image to prevent 404 errors
const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://mahokofridaynewsbackend.onrender.com';
const PLACEHOLDER = `${API_BASE}/uploads/placeholder.jpg`;

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

  /* ── NEW STATE (added on top, no existing state touched) ── */
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [refreshingComments, setRefreshingComments] = useState(false);

  /* ── FLOATING AD STATE MACHINE ── */
  const [floatVisible, setFloatVisible] = useState(false);
  const [floatClosing, setFloatClosing] = useState(false);
  const [floatIndex, setFloatIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

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
        
        // Safely parse ads API response
        const adsData = aRes.data;
        const adsArray = Array.isArray(adsData) ? adsData : (adsData?.ads || adsData?.data || adsData?.items || []);
        setAds(adsArray);

        // Related
        const relRes = await storiesAPI.getAll({ category: s.category, limit: 5, status: 'published' });
        setRelated((relRes.data.stories || []).filter(r => (r._id || r.id).toString() !== id).slice(0, 4));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  /* ── Process active ads safely (Ignore position, use ALL active ads) ── */
  const activeAds = useMemo(() => {
    return (ads || []).filter(a => 
      a && (a.is_active !== false && a.status !== 'inactive' && a.status !== 'paused' && a.status !== 'draft')
    );
  }, [ads]);

  const leftAds = useMemo(() => activeAds, [activeAds]); // All ads go to left sidebar
  const floatAds = useMemo(() => activeAds, [activeAds]); // All ads used for floating rotation

  /* ── Initial trigger for floating ad ── */
  useEffect(() => {
    if (floatAds.length > 0 && !hasStarted) {
      const timer = setTimeout(() => {
        setFloatVisible(true);
        setHasStarted(true);
      }, 2500); // Wait 2.5s initially before first appearance
      return () => clearTimeout(timer);
    }
  }, [floatAds, hasStarted]);

  /* ── Core Floating Ad Cycle Logic (8s visible, 5s hidden, restart) ── */
  useEffect(() => {
    if (!hasStarted || floatAds.length === 0) return;

    let timer;
    if (floatVisible) {
      // Ad is currently visible
      timer = setTimeout(() => {
        if (floatIndex === floatAds.length - 1) {
          // Last ad in the cycle reached -> Close smoothly
          setFloatClosing(true);
          timer = setTimeout(() => {
            setFloatVisible(false);
            setFloatClosing(false);
          }, 400); // Wait for slide-down animation
        } else {
          // Move to next ad
          setFloatIndex(prev => prev + 1);
        }
      }, 8000); // Stay on each ad for 8 seconds
    } else if (hasStarted) {
      // Ad is hidden, wait 5 seconds then restart from beginning
      timer = setTimeout(() => {
        setFloatIndex(0);
        setFloatVisible(true);
      }, 5000); 
    }

    return () => clearTimeout(timer);
  }, [hasStarted, floatVisible, floatIndex, floatAds]);

  /* ── Stop covering the footer when it enters the viewport ── */
  useEffect(() => {
    if (!floatVisible) return;
    const footer = document.querySelector('footer') || document.querySelector('[data-footer]');
    let observer;
    if (footer) {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setFloatClosing(true);
            setTimeout(() => {
              setFloatVisible(false);
              setFloatClosing(false);
            }, 400);
          }
        });
      }, { threshold: 0.05 });
      observer.observe(footer);
    }
    return () => {
      if (observer) observer.disconnect();
    };
  }, [floatVisible]);

  /* ── lock body scroll when comment modal open ── */
  useEffect(() => {
    document.body.style.overflow = showCommentModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showCommentModal]);

  /* ── ESC key closes modal ── */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setShowCommentModal(false); };
    if (showCommentModal) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showCommentModal]);

  const handleReact = async (type) => {
    try {
      const res = await storiesAPI.react(id, type);
      setReactions(res.data);
    } catch (e) { console.error(e); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setCommentMsg('');
    try {
      await commentsAPI.create({ story_id: id, ...form });
      setCommentMsg('✅ Comment submitted for review!');
      setForm({ name: '', email: '', comment: '' });
      // refresh comments silently inside modal
      setRefreshingComments(true);
      try {
        const cRes = await commentsAPI.getByStory(id);
        setComments(cRes.data || []);
      } catch (_) {}
      finally { setRefreshingComments(false); }
      setTimeout(() => setCommentMsg(''), 4000);
    } catch { setCommentMsg('❌ Error submitting. Please try again.'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <PublicLayout><Spinner /></PublicLayout>;
  if (!story) return <PublicLayout><EmptyState icon="📰" title="Story not found" message="This story may have been removed." /></PublicLayout>;

  const authorAvatar = story.author_avatar || story.author_image;

  return (
    <PublicLayout>
      {/* ── Injected animations + mobile-first responsive tweaks ── */}
      <style>{`
        @keyframes mhkFloatUp { from { transform: translate(-50%, 120%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        @keyframes mhkFloatDown { from { transform: translate(-50%, 0); opacity: 1; } to { transform: translate(-50%, 120%); opacity: 0; } }
        @keyframes mhkFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes mhkPop { from { transform: translateY(40px) scale(.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
        @keyframes mhkSpin { to { transform: rotate(360deg); } }
        
        .mhk-float-container { animation: mhkFloatUp .5s cubic-bezier(.2,.8,.2,1) forwards; }
        .mhk-float-container.closing { animation: mhkFloatDown .4s ease-in forwards; }
        .mhk-modal-bg { animation: mhkFade .25s ease-out forwards; }
        .mhk-modal-card { animation: mhkPop .3s cubic-bezier(.2,.8,.2,1) forwards; }
        .mhk-spin { display:inline-block; width:14px; height:14px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation: mhkSpin .6s linear infinite; }
        
        .mhk-react-btn { transition: all .2s ease; }
        .mhk-react-btn:hover { background:#e8e4d8 !important; transform: translateY(-1px); }
        .mhk-share-btn { transition: all .2s ease; }
        .mhk-share-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 14px rgba(0,0,0,.18); }
        .mhk-related-card { transition: transform .25s ease, box-shadow .25s ease; }
        .mhk-related-card:hover { transform: translateY(-4px); box-shadow: 0 10px 24px rgba(0,0,0,.09); }
        .mhk-related-card .mhk-related-img { transition: transform .4s ease; }
        .mhk-related-card:hover .mhk-related-img { transform: scale(1.06); }
        .mhk-comment-row { transition: background .2s; }
        .mhk-comment-row:hover { background: rgba(240,236,224,.45); }
        .mhk-story-img { transition: transform .4s ease; }
        .mhk-story-img:hover { transform: scale(1.015); }
        
        /* Ad Card Animation */
        .mhk-ad-card { transition: transform .3s ease, box-shadow .3s ease; border: 1px solid #e8e4d8; border-radius: 6px; overflow: hidden; display: block; }
        .mhk-ad-card:hover { transform: translateY(-3px); box-shadow: 0 8px 18px rgba(0,0,0,.12); }
        .mhk-ad-card img { transition: transform .4s ease; }
        .mhk-ad-card:hover img { transform: scale(1.04); }
        
        /* Floating Ad Carousel Track */
        .mhk-float-track { display: flex; flex-direction: column; transition: transform 0.5s cubic-bezier(.2,.8,.2,1); }
        .mhk-float-slide { flex-shrink: 0; width: 100%; height: 160px; }
        
        /* Base Mobile-First Styles */
        .mhk-layout-grid {
          display: grid;
          grid-template-columns: 1fr; /* 1 column on mobile */
          gap: 20px;
        }
        .mhk-left-col, .mhk-right-col { width: 100%; }
        .mhk-left-col { display: none; } /* Hide left ads by default on mobile to save space */
        
        .mhk-comment-form-grid { 
          display: grid; 
          grid-template-columns: 1fr; /* 1 column on mobile */
          gap: 11px; 
        }
        .mhk-float-container { width: calc(100vw - 24px) !important; }
        .mhk-modal-wrap { padding: 12px !important; }

        /* Tablet Styles (768px and up) */
        @media (min-width: 768px) {
          .mhk-layout-grid {
            grid-template-columns: 1fr 240px; /* Content + Right Sidebar */
            gap: 24px;
          }
          .mhk-right-col { width: 240px; position: sticky; top: 72px; align-self: start; max-height: calc(100vh - 90px); overflow-y: auto; }
          .mhk-left-col { display: none; } /* Still hide left ads on tablet */
          .mhk-comment-form-grid { 
            grid-template-columns: 1fr 1fr; /* 2 columns for form inputs on tablet */
          }
        }
        
        /* Desktop Styles (1024px and up) */
        @media (min-width: 1024px) {
          .mhk-layout-grid {
            grid-template-columns: 220px 1fr 280px; /* Left Sidebar + Content + Right Sidebar */
            gap: 32px;
          }
          .mhk-left-col { display: flex; flex-direction: column; gap: 12px; position: sticky; top: 72px; align-self: start; max-height: calc(100vh - 90px); overflow-y: auto; padding-right: 4px; }
          .mhk-right-col { width: 280px; }
          /* Custom scrollbar for sidebars */
          .mhk-left-col::-webkit-scrollbar, .mhk-right-col::-webkit-scrollbar { width: 4px; }
          .mhk-left-col::-webkit-scrollbar-thumb, .mhk-right-col::-webkit-scrollbar-thumb { background: #ccc; border-radius: 2px; }
        }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 16px 32px' }}>

        <div className="mhk-layout-grid">

          {/* ── LEFT ADVERTISEMENT SIDEBAR (Displays ALL Ads) ── */}
          {leftAds.length > 0 && (
            <aside className="mhk-left-col">
              {leftAds.map((ad, i) => (
                <AdCard key={ad._id || ad.id || i} ad={ad} height={220} />
              ))}
            </aside>
          )}

          {/* ── ARTICLE ──────────────────────────────────────── */}
          <article className="mhk-center-col">
            {/* Breadcrumb */}
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#bbb', display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap:'wrap' }}>
              <Link to="/" style={{ color: '#bbb', textDecoration: 'none' }}>Home</Link>
              <span>›</span>
              <Link to={`/category/${story.category}`} style={{ color: '#c0392b', textDecoration: 'none' }}>{story.category}</Link>
            </div>

            <div style={{ marginBottom: 10 }}>
              <Link to={`/category/${story.category}`} style={{ background: '#c0392b', color: '#fff', padding: '3px 10px', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', textDecoration: 'none', borderRadius: 2 }}>{story.category}</Link>
            </div>

            <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(1.45rem, 3.5vw, 2.4rem)', fontWeight: 900, lineHeight: 1.15, margin: '12px 0 10px' }}>{story.title}</h1>

            <div style={{ display: 'flex', gap: 10, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, color: '#5a5a5a', marginBottom: 18, flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid #e8e4d8', paddingBottom: 12 }}>
              {authorAvatar && (
                <img src={imgUrl(authorAvatar)} alt="" loading="lazy" onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
                  style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e8e4d8' }} />
              )}
              <Link to={`/author/${encodeURIComponent(story.author)}`} style={{ fontWeight: 700, textDecoration: 'none', color: '#0d0d0d' }}>{story.author}</Link>
              <span style={{ color: '#ddd' }}>·</span>
              <span>{timeAgo(story.created_at || story.createdAt)}</span>
              <span style={{ color: '#ddd' }}>·</span>
              <span>👁 {Number(story.views || 0).toLocaleString()} views</span>
              {story.tags && story.tags.split(',').slice(0, 3).map(t => (
                <Link key={t} to={`/search?q=${encodeURIComponent(t.trim())}`} style={{ background: '#f0ece0', padding: '2px 7px', fontSize: 9, letterSpacing: 1, color: '#5a5a5a', textDecoration: 'none', border: '1px solid #e8e4d8', borderRadius: 2 }}>#{t.trim()}</Link>
              ))}
            </div>

            <img className="mhk-story-img"
              src={imgUrl(story.image)}
              alt={story.title}
              loading="eager"
              onError={e => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
              style={{
                width: '100%',
                maxWidth: 720,
                height: 'auto',
                maxHeight: 520,
                minHeight: 260,
                aspectRatio: '16/9',
                objectFit: 'cover',
                borderRadius: 6,
                marginBottom: 22,
                display: 'block',
                marginInline: 'auto'
              }}
            />

            <div style={{ fontSize: '1.02rem', lineHeight: 1.78, fontFamily: "'Source Serif 4',Georgia,serif", marginBottom: 22 }}
              dangerouslySetInnerHTML={{ __html: story.description }} />

            {/* All tags */}
            {story.tags && (
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 22 }}>
                {story.tags.split(',').map(t => (
                  <Link key={t} to={`/search?q=${encodeURIComponent(t.trim())}`}
                    style={{ background: '#f0ece0', padding: '4px 10px', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, border: '1px solid #e8e4d8', textDecoration: 'none', color: '#0d0d0d', borderRadius: 2 }}>#{t.trim()}</Link>
                ))}
              </div>
            )}

            {/* Reactions + Share */}
            <div style={{ display: 'flex', gap: 8, padding: '14px 0', borderTop: '1px solid #e8e4d8', borderBottom: '1px solid #e8e4d8', marginBottom: 22, flexWrap: 'wrap' }}>
              <button className="mhk-react-btn" onClick={() => handleReact('likes')} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', background: '#f0ece0', border: '1px solid #e8e4d8', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer', borderRadius: 3 }}>
                👍 {reactions.likes}
              </button>
              <button className="mhk-react-btn" onClick={() => handleReact('dislikes')} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', background: '#f0ece0', border: '1px solid #e8e4d8', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer', borderRadius: 3 }}>
                👎 {reactions.dislikes}
              </button>
              <div style={{ flex: 1 }} />
              <a className="mhk-share-btn" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer"
                style={{ padding: '7px 12px', background: '#1877f2', color: '#fff', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, textDecoration: 'none', letterSpacing: 1, borderRadius: 3 }}>Share</a>
              <a className="mhk-share-btn" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(story.title)}`} target="_blank" rel="noopener noreferrer"
                style={{ padding: '7px 12px', background: '#0d0d0d', color: '#fff', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, textDecoration: 'none', letterSpacing: 1, borderRadius: 3 }}>Tweet</a>
              <a className="mhk-share-btn" href={`https://wa.me/?text=${encodeURIComponent(story.title + ' ' + window.location.href)}`} target="_blank" rel="noopener noreferrer"
                style={{ padding: '7px 12px', background: '#25d366', color: '#fff', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, textDecoration: 'none', letterSpacing: 1, borderRadius: 3 }}>WhatsApp</a>
            </div>

            {/* Author box */}
            <div style={{ background: '#f0ece0', padding: '18px', display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 24, border: '1px solid #e8e4d8', borderRadius: 4 }}>
              {authorAvatar && (
                <img src={imgUrl(authorAvatar)} alt="" loading="lazy" onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
                  style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #e8e4d8' }} />
              )}
              <div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#c0392b', marginBottom: 3 }}>About the Author</div>
                <Link to={`/author/${encodeURIComponent(story.author)}`} style={{ fontFamily: "'Playfair Display',serif", fontSize: '1rem', fontWeight: 700, textDecoration: 'none', color: '#0d0d0d' }}>{story.author}</Link>
                <p style={{ fontSize: 12, color: '#5a5a5a', fontStyle: 'italic', marginTop: 5, lineHeight: 1.55 }}>
                  {story.author_bio_full || story.author_bio || 'Staff writer at Mahoko Friday News, covering the stories that matter most to Rwanda\'s youth.'}
                </p>
              </div>
            </div>

            {/* EXISTING AdBanner kept intact (do NOT remove) */}
            <AdBanner ads={ads.slice(0, 2)} height={90} />

            {/* Related stories */}
            {related.length > 0 && (
              <section style={{ marginBottom: 28 }}>
                <SectionLabel>Related Stories</SectionLabel>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 16 }}>
                  {related.map(s => (
                    <Link key={s._id || s.id} to={`/story/${s._id || s.id}`} className="mhk-related-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block', borderRadius: 6 }}>
                      <img className="mhk-related-img" src={imgUrl(s.image)} alt="" loading="lazy" onError={e => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
                        style={{ width:'100%', aspectRatio:'16/10', height:'auto', objectFit:'cover', marginBottom:6, borderRadius:6, display:'block' }} />
                      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, color: '#c0392b', fontWeight: 800, letterSpacing: 2, marginBottom: 3 }}>{s.category}</div>
                      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '.82rem', fontWeight: 700, lineHeight: 1.3 }}>{(s.title || '').substring(0, 65)}</div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ── Comments section replaced by a button that opens a modal ── */}
            <section>
              <SectionLabel>Discussion ({comments.length})</SectionLabel>
              <div style={{ background: '#f0ece0', padding: '26px 20px', border: '1px solid #e8e4d8', borderRadius: 6, textAlign: 'center' }}>
                <div style={{ fontSize: 34, marginBottom: 8 }}>💬</div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.15rem', fontWeight: 700, marginBottom: 6 }}>
                  {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                </h3>
                <p style={{ color: '#5a5a5a', fontSize: 12.5, marginBottom: 16, fontStyle: 'italic' }}>
                  {comments.length > 0 ? 'Join the conversation and share your thoughts.' : 'Be the first to comment on this story.'}
                </p>
                <button
                  onClick={() => setShowCommentModal(true)}
                  style={{
                    background: '#0d0d0d', color: '#fff', border: 'none', padding: '11px 26px',
                    fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 12,
                    letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', borderRadius: 3,
                    transition: 'all .2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#c0392b'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#0d0d0d'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {comments.length > 0 ? `💬 View Comments (${comments.length})` : '💬 Add a Comment'}
                </button>
              </div>
            </section>
          </article>

          {/* ── RIGHT SIDEBAR (NO ADS, Only Existing Widgets) ── */}
          <aside className="mhk-right-col">
            <div>
              <div style={{ background: '#fff', border: '1px solid #e8e4d8', padding: 16, marginBottom: 18, borderTop: '3px solid #0d0d0d', borderRadius: 2 }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', borderBottom: '3px solid #0d0d0d', paddingBottom: 8, marginBottom: 12 }}>🔥 Most Read</div>
                {popular.map((p, i) => <PopularItem key={p._id || p.id} story={p} rank={i + 1} />)}
              </div>

              <NewsletterWidget />

              {/* EXISTING AdBanner kept intact (do NOT remove) */}
              <AdBanner ads={ads.slice(2, 5)} height={200} />

              <WhatsAppCTA />
            </div>
          </aside>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────
          FLOATING BOTTOM AD CAROUSEL 
          (Cycles all ads every 8s, disappears for 5s, then restarts)
      ─────────────────────────────────────────────────────────────── */}
      {floatVisible && floatAds.length > 0 && (
        <div
          className={`mhk-float-container ${floatClosing ? 'closing' : ''}`}
          style={{
            position: 'fixed',
            bottom: 15,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9000,
            maxWidth: 'calc(100vw - 24px)',
            pointerEvents: 'auto'
          }}
        >
          <div
            style={{
              position: 'relative',
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 10px 36px rgba(0,0,0,.28)',
              overflow: 'hidden',
              border: '1px solid #e8e4d8'
            }}
          >
            <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
              <div 
                className="mhk-float-track" 
                style={{ transform: `translateY(-${floatIndex * 160}px)` }}
              >
                {floatAds.map((ad, i) => (
                  <div key={ad._id || ad.id || i} className="mhk-float-slide">
                    <AdCard ad={ad} fluid />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Carousel Dots Indicator */}
            {floatAds.length > 1 && (
              <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5, zIndex: 3 }}>
                {floatAds.map((_, i) => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', 
                    background: i === floatIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                    transition: 'background 0.3s'
                  }} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────
          COMMENT MODAL  (smooth, mobile responsive, scrollable,
          loading indicators, error handling, ESC to close)
      ─────────────────────────────────────────────────────────────── */}
      {showCommentModal && (
        <div
          className="mhk-modal-bg"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCommentModal(false); }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.62)',
            zIndex: 10000, display: 'flex', alignItems: 'flex-start',
            justifyContent: 'center', padding: '24px 16px', overflowY: 'auto',
            backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)'
          }}
        >
          <div className="mhk-modal-card mhk-modal-wrap" style={{
            background: '#fff', width: '100%', maxWidth: 640, borderRadius: 8,
            boxShadow: '0 24px 64px rgba(0,0,0,.35)', overflow: 'hidden',
            marginTop: 24, marginBottom: 24
          }}>
            {/* Modal header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px', borderBottom: '2px solid #0d0d0d',
              background: '#0d0d0d', color: '#fff', position: 'sticky', top: 0, zIndex: 2
            }}>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#c0392b', fontWeight: 800 }}>Discussion</div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                  Comments ({comments.length})
                  {refreshingComments && <span className="mhk-spin" style={{ marginLeft: 10, borderColor:'#fff', borderTopColor:'transparent' }} />}
                </h3>
              </div>
              <button
                onClick={() => setShowCommentModal(false)} aria-label="Close"
                style={{
                  width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.15)',
                  color: '#fff', border: 'none', cursor: 'pointer', fontSize: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                  transition: 'background .2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#c0392b'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.15)'}
              >×</button>
            </div>

            {/* Scrollable comment list */}
            <div style={{ maxHeight: '52vh', overflowY: 'auto' }}>
              {comments.length > 0 ? (
                <div style={{ padding: '8px 18px' }}>
                  {comments.map(c => (
                    <div key={c._id || c.id} className="mhk-comment-row" style={{ padding: '12px 0', borderBottom: '1px solid #f0ece0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <div style={{ width: 34, height: 34, background: '#f0ece0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 14, color: '#c0392b', flexShrink: 0 }}>
                          {(c.name || 'B').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700 }}>{c.name}</div>
                          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, color: '#bbb' }}>{timeAgo(c.created_at || c.createdAt)}</div>
                        </div>
                      </div>
                      <p style={{ fontSize: 13, lineHeight: 1.65, paddingLeft: 44, margin: 0 }}>{c.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '28px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 30, marginBottom: 8 }}>💬</div>
                  <p style={{ color: '#5a5a5a', fontStyle: 'italic', fontSize: 13 }}>Be the first to comment on this story.</p>
                </div>
              )}
            </div>

            {/* Comment form (existing handleComment preserved) */}
            <div style={{ background: '#f0ece0', padding: '18px', borderTop: '2px solid #e8e4d8' }}>
              <h4 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.02rem', fontWeight: 700, marginBottom: 12 }}>Leave a Comment</h4>
              <form onSubmit={handleComment} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                <div className="mhk-comment-form-grid">
                  <div>
                    <label style={{ display: 'block', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 5, color: '#5a5a5a' }}>Name (blank = BANYA)</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name…"
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4d8', background: '#fff', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', borderRadius: 3 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 5, color: '#5a5a5a' }}>Email (optional)</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com"
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4d8', background: '#fff', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', borderRadius: 3 }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 5, color: '#5a5a5a' }}>Comment *</label>
                  <textarea value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} rows={4} required placeholder="Share your thoughts…"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4d8', background: '#fff', fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box', borderRadius: 3 }} />
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button type="submit" disabled={submitting}
                    style={{
                      background: '#0d0d0d', color: '#fff', border: 'none', padding: '11px 22px',
                      fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 11,
                      letterSpacing: 2, textTransform: 'uppercase', cursor: submitting ? 'not-allowed' : 'pointer',
                      opacity: submitting ? .7 : 1, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 8,
                      transition: 'background .2s'
                    }}
                    onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = '#c0392b'; }}
                    onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = '#0d0d0d'; }}
                  >
                    {submitting ? (<><span className="mhk-spin" /> Submitting…</>) : 'Post Comment'}
                  </button>
                  {commentMsg && (
                    <p style={{
                      color: commentMsg.startsWith('✅') ? '#166534' : '#c0392b',
                      fontSize: 12, margin: 0, padding: '4px 10px', borderRadius: 3,
                      background: commentMsg.startsWith('✅') ? 'rgba(22,101,52,.08)' : 'rgba(192,57,43,.08)'
                    }}>{commentMsg}</p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}

/* ── Robust AdCard component that checks all possible image property names from API ── */
const AdCard = React.memo(function AdCard({ ad, height = 180, fluid = false }) {
  if (!ad) return null;
  
  // Check all common API property names for the image
  const rawImg = ad.image_url || ad.imageUrl || ad.image || ad.banner || ad.bannerUrl || ad.img || ad.file_url || ad.photo || ad.file;
  
  // Use the project's imgUrl utility, fallback to null if empty
  const img = rawImg ? imgUrl(rawImg) : null;
  const link = ad.link || ad.url || ad.click_url || ad.target_url || '#';
  const title = ad.title || ad.name || 'Sponsored Ad';
  
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="mhk-ad-card"
      style={{
        display: 'flex', flexDirection: 'column', width: '100%', height: fluid ? '100%' : 'auto',
        textDecoration: 'none', background: '#fff',
        marginBottom: fluid ? 0 : 12
      }}
    >
      {img ? (
        <img
          src={img}
          alt={title}
          loading="lazy"
          onError={e => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
          style={{ width: '100%', height: fluid ? '100%' : height, objectFit: 'cover', display: 'block', flex: 1 }}
        />
      ) : (
        <div style={{ 
          width: '100%', height: fluid ? '100%' : height, 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
          color: '#bbb', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, 
          flex: 1, background: '#f8f9fa', padding: '10px', textAlign: 'center' 
        }}>
          <span style={{ fontWeight: 700, marginBottom: 4 }}>{title}</span>
          <small style={{ fontSize: 10, opacity: 0.7 }}>Ad Space Available</small>
        </div>
      )}
      <div style={{ padding: '4px 10px', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase', color: '#bbb', background: '#f0ece0' }}>
        Advertisement
      </div>
    </a>
  );
});
