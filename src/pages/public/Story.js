import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';

import {
  PopularItem,
  AdBanner,
  SectionLabel,
  NewsletterWidget,
  WhatsAppCTA,
  Spinner,
  EmptyState,
  imgUrl,
  timeAgo
} from '../../components/ui';

import {
  storiesAPI,
  commentsAPI,
  adsAPI
} from '../../utils/api';

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Crect width='800' height='450' fill='%23f0ece0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%23bbb'%3ENo Image%3C/text%3E%3C/svg%3E";

const AD_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='250'%3E%3Crect width='300' height='250' fill='%23f7f5ef'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='11' fill='%23ccc'%3ESponsored%3C/text%3E%3Ctext x='50%25' y='58%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='9' fill='%23ddd'%3EAdvertisement%3C/text%3E%3C/svg%3E";

/* =============================================================
   AD CARD — renders a single ad from the database
============================================================= */
function AdCard({ ad, style, className, imgStyle }) {
  if (!ad) return null;

  const image = ad.image || ad.banner_image || ad.ad_image;
  const link = ad.link || ad.url || ad.ad_url || '#';
  const title = ad.title || ad.ad_title || '';
  const description = ad.description || ad.ad_description || '';

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        border: '1px solid #e8e4d8',
        borderRadius: 6,
        overflow: 'hidden',
        background: '#fff',
        transition: 'transform .25s ease, box-shadow .25s ease',
        ...style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {image ? (
        <div style={{ overflow: 'hidden' }}>
          <img
            src={imgUrl(image)}
            alt={title || 'Ad'}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = AD_PLACEHOLDER;
            }}
            style={{
              width: '100%',
              display: 'block',
              objectFit: 'cover',
              ...imgStyle
            }}
          />
        </div>
      ) : (
        <div
          style={{
            background: '#f7f5ef',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 80,
            ...imgStyle
          }}
        >
          <span style={{ fontSize: 10, color: '#ccc', letterSpacing: 1, textTransform: 'uppercase' }}>
            Sponsored
          </span>
        </div>
      )}

      {(title || description) && (
        <div style={{ padding: '8px 10px', borderTop: '1px solid #f0ece0' }}>
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 8,
              fontWeight: 800,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: '#c0392b',
              marginBottom: 2
            }}
          >
            Sponsored
          </div>
          {title && (
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: '#0d0d0d',
                lineHeight: 1.3
              }}
            >
              {title}
            </div>
          )}
          {description && (
            <div
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontSize: 11,
                color: '#666',
                marginTop: 3,
                lineHeight: 1.45
              }}
            >
              {description.length > 60 ? description.substring(0, 60) + '...' : description}
            </div>
          )}
        </div>
      )}
    </a>
  );
}

/* =============================================================
   STORY PAGE
============================================================= */
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
  const [refreshingComments, setRefreshingComments] = useState(false);

  const [reactions, setReactions] = useState({
    likes: 0, dislikes: 0, love: 0, laugh: 0,
    wow: 0, sad: 0, angry: 0, celebrate: 0
  });

  const [userReaction, setUserReaction] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [adRotatorIndex, setAdRotatorIndex] = useState(0);

  /* ----------------------------------------------------------
     LOAD ALL DATA
  ---------------------------------------------------------- */
  useEffect(() => {
    window.scrollTo(0, 0);

    const load = async () => {
      setLoading(true);
      try {
        const [sRes, cRes, pRes, aRes] = await Promise.all([
          storiesAPI.getOne(id),
          commentsAPI.getByStory(id),
          storiesAPI.getPopular({ limit: 5 }),
          adsAPI.getAll()
        ]);

        const s = sRes.data;
        setStory(s);
        setReactions({
          likes: Number(s.likes || 0),
          dislikes: Number(s.dislikes || 0),
          love: Number(s.love || s.loves || 0),
          laugh: Number(s.laugh || s.laughs || 0),
          wow: Number(s.wow || 0),
          sad: Number(s.sad || 0),
          angry: Number(s.angry || 0),
          celebrate: Number(s.celebrate || 0)
        });

        /* — approved comments — */
        const rawComments = Array.isArray(cRes.data)
          ? cRes.data
          : (cRes.data?.comments || cRes.data?.data || []);
        setComments(
          rawComments.filter((c) => {
            const st = String(c.status || c.approval_status || c.comment_status || '').toLowerCase();
            return st === 'approved' || c.is_approved || c.approved || c.approved_by_admin;
          })
        );

        /* — popular — */
        setPopular(
          Array.isArray(pRes.data) ? pRes.data : (pRes.data?.stories || pRes.data?.data || [])
        );

        /* — ads — */
        const rawAds = aRes.data;
        setAds(
          Array.isArray(rawAds) ? rawAds : (rawAds?.ads || rawAds?.data || rawAds?.items || [])
        );

        /* — related — */
        const relRes = await storiesAPI.getAll({
          category: s.category, limit: 5, status: 'published'
        });
        const relArr = Array.isArray(relRes.data)
          ? relRes.data
          : (relRes.data?.stories || relRes.data?.data || []);
        setRelated(relArr.filter((r) => String(r._id || r.id) !== String(id)).slice(0, 4));
      } catch (err) {
        console.error('Error loading story:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  /* ----------------------------------------------------------
     ADS — split into zones by position field or index
  ---------------------------------------------------------- */
  const activeAds = useMemo(() => {
    return (ads || []).filter((ad) => {
      if (!ad) return false;
      const st = String(ad.status || '').toLowerCase();
      return st !== 'inactive' && st !== 'paused' && st !== 'draft' && ad.is_active !== false;
    });
  }, [ads]);

  const heroAd = useMemo(() => {
    return activeAds.find((a) => String(a.position || '').toLowerCase() === 'hero')
      || activeAds.find((a) => String(a.placement || '').toLowerCase() === 'hero')
      || null;
  }, [activeAds]);

  const leftSidebarAds = useMemo(() => {
    const positioned = activeAds.filter((a) => String(a.position || a.placement || '').toLowerCase() === 'left');
    if (positioned.length > 0) return positioned.slice(0, 4);
    return activeAds.slice(0, 4);
  }, [activeAds]);

  const rightSidebarAds = useMemo(() => {
    const positioned = activeAds.filter((a) => String(a.position || a.placement || '').toLowerCase() === 'right');
    if (positioned.length > 0) return positioned.slice(0, 4);
    return activeAds.slice(4, 8).length > 0 ? activeAds.slice(4, 8) : activeAds.slice(0, 3);
  }, [activeAds]);

  const inlineAds = useMemo(() => {
    const positioned = activeAds.filter((a) => String(a.position || a.placement || '').toLowerCase() === 'inline');
    if (positioned.length > 0) return positioned.slice(0, 3);
    return activeAds.slice(2, 5);
  }, [activeAds]);

  const bottomAds = useMemo(() => {
    const positioned = activeAds.filter((a) => String(a.position || a.placement || '').toLowerCase() === 'bottom');
    if (positioned.length > 0) return positioned.slice(0, 4);
    return activeAds.slice(0, 4);
  }, [activeAds]);

  /* — rotator for bottom — */
  useEffect(() => {
    if (bottomAds.length <= 1) return;
    const timer = setInterval(() => {
      setAdRotatorIndex((prev) => (prev + 1) % bottomAds.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [bottomAds]);

  /* ----------------------------------------------------------
     MODALS & KEYBOARD
  ---------------------------------------------------------- */
  useEffect(() => {
    document.body.style.overflow = showCommentModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showCommentModal]);

  useEffect(() => {
    if (!showCommentModal && !showShareMenu) return;
    const handler = (e) => {
      if (e.key === 'Escape') { setShowCommentModal(false); setShowShareMenu(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showCommentModal, showShareMenu]);

  /* ----------------------------------------------------------
     HANDLERS
  ---------------------------------------------------------- */
  const handleReact = async (type) => {
    try {
      const res = await storiesAPI.react(id, type);
      if (res?.data) setReactions((p) => ({ ...p, ...res.data }));
      setUserReaction(type);
    } catch (e) { console.error('Reaction error:', e); }
  };

  const refreshComments = async () => {
    setRefreshingComments(true);
    try {
      const res = await commentsAPI.getByStory(id);
      const raw = Array.isArray(res.data) ? res.data : (res.data?.comments || res.data?.data || []);
      setComments(raw.filter((c) => {
        const st = String(c.status || c.approval_status || '').toLowerCase();
        return st === 'approved' || c.is_approved || c.approved || c.approved_by_admin;
      }));
    } catch (e) { console.error(e); }
    finally { setRefreshingComments(false); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!form.comment.trim()) return;
    setSubmitting(true);
    setCommentMsg('');
    try {
      await commentsAPI.create({ story_id: id, ...form });
      setCommentMsg('✅ Comment submitted. It will appear after admin approval.');
      setForm({ name: '', email: '', comment: '' });
      await refreshComments();
      setTimeout(() => setCommentMsg(''), 5000);
    } catch (e) {
      setCommentMsg('❌ Error submitting comment. Please try again.');
    } finally { setSubmitting(false); }
  };

  const currentUrl = window.location.href;
  const shareTitle = story?.title || 'Mahoko Friday News';
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(shareTitle);

  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, text: shareTitle, url: currentUrl });
        setShowShareMenu(false);
        return;
      }
      await navigator.clipboard.writeText(currentUrl);
      setCommentMsg('🔗 Story link copied!');
      setTimeout(() => setCommentMsg(''), 3000);
    } catch (e) { console.log('Share cancelled:', e); }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setShowShareMenu(false);
      setCommentMsg('🔗 Link copied!');
      setTimeout(() => setCommentMsg(''), 3000);
    } catch (e) { console.error(e); }
  };

  /* ----------------------------------------------------------
     LOADING / EMPTY
  ---------------------------------------------------------- */
  if (loading) {
    return (
      <PublicLayout>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner />
        </div>
      </PublicLayout>
    );
  }

  if (!story) {
    return (
      <PublicLayout>
        <EmptyState />
      </PublicLayout>
    );
  }

  const authorAvatar = story.author_avatar || story.author_image;

  const reactionButtons = [
    { type: 'likes', emoji: '👍', label: 'Like' },
    { type: 'love', emoji: '❤️', label: 'Love' },
    { type: 'laugh', emoji: '😂', label: 'Haha' },
    { type: 'wow', emoji: '😮', label: 'Wow' },
    { type: 'sad', emoji: '😢', label: 'Sad' },
    { type: 'angry', emoji: '😡', label: 'Angry' },
    { type: 'celebrate', emoji: '👏', label: 'Celebrate' }
  ];

  /* ===========================================================
     RENDER
  =========================================================== */
  return (
    <PublicLayout>

      <style>{`
        /* ---------- Animations ---------- */
        @keyframes storyFadeIn { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes modalBgIn { from { opacity:0 } to { opacity:1 } }
        @keyframes modalCardIn { from { opacity:0; transform:translateY(30px) scale(.97) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes spin { to { transform:rotate(360deg) } }
        @keyframes adSlideIn { from { opacity:0; transform:translateX(8px) } to { opacity:1; transform:translateX(0) } }

        .story-fade { animation: storyFadeIn .45s ease-out both }
        .story-fade-d1 { animation-delay: .06s }
        .story-fade-d2 { animation-delay: .12s }
        .story-fade-d3 { animation-delay: .18s }
        .story-fade-d4 { animation-delay: .24s }
        .modal-bg { animation: modalBgIn .2s ease-out both }
        .modal-card { animation: modalCardIn .3s cubic-bezier(.2,.8,.2,1) both }
        .ad-slide { animation: adSlideIn .4s ease-out both }
        .ad-slide-d1 { animation-delay: .1s }
        .ad-slide-d2 { animation-delay: .2s }
        .ad-slide-d3 { animation-delay: .3s }
        .spinner-sm { display:inline-block; width:14px; height:14px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spin .6s linear infinite }

        /* ---------- Layout Grid ---------- */
        .story-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }

        .story-left { display: none; }

        .story-main { min-width: 0; }

        .story-right { display: none; }

        /* ---------- Reaction Buttons ---------- */
        .react-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 7px 11px;
          background: #f5f3ec;
          border: 1px solid #e8e4d8;
          border-radius: 20px;
          cursor: pointer;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 12px;
          color: #333;
          transition: all .2s ease;
          white-space: nowrap;
        }
        .react-btn:hover { background: #e8e4d8; transform: translateY(-1px) }
        .react-btn.active { background: #fdf0ee; border-color: #c0392b; color: #c0392b }

        /* ---------- Share Menu ---------- */
        .share-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 6px);
          width: 210px;
          background: #fff;
          border: 1px solid #e8e4d8;
          border-radius: 8px;
          box-shadow: 0 12px 36px rgba(0,0,0,.15);
          z-index: 1000;
          padding: 6px;
          overflow: hidden;
        }
        .share-opt {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border: none;
          background: transparent;
          cursor: pointer;
          text-decoration: none;
          color: #0d0d0d;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 12px;
          font-weight: 600;
          text-align: left;
          border-radius: 5px;
          transition: background .15s;
        }
        .share-opt:hover { background: #f5f3ec }

        /* ---------- Related Cards ---------- */
        .related-card {
          display: block;
          text-decoration: none;
          color: inherit;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e8e4d8;
          transition: transform .25s ease, box-shadow .25s ease;
          background: #fff;
        }
        .related-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,.08) }
        .related-card img { transition: transform .4s ease }
        .related-card:hover img { transform: scale(1.05) }

        /* ---------- Comment Row ---------- */
        .comment-row { transition: background .15s }
        .comment-row:hover { background: rgba(240,236,224,.4) }

        /* ---------- Sidebar Ad ---------- */
        .sidebar-ad {
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e8e4d8;
          transition: transform .25s ease, box-shadow .25s ease;
        }
        .sidebar-ad:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,.08) }

        /* ---------- Bottom Ad Carousel ---------- */
        .bottom-ad-track {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 8px;
        }
        .bottom-ad-track::-webkit-scrollbar { height: 4px }
        .bottom-ad-track::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px }
        .bottom-ad-item { scroll-snap-align: start; flex-shrink: 0; width: 280px }

        /* ---------- Inline Ad Banner ---------- */
        .inline-ad-banner {
          border: 1px solid #e8e4d8;
          border-radius: 8px;
          overflow: hidden;
          background: #faf9f5;
        }

        /* ---------- Comment Form Grid ---------- */
        .comment-form-grid { display: grid; grid-template-columns: 1fr; gap: 10px }

        /* ---------- Responsive ---------- */
        @media (min-width: 768px) {
          .story-grid { grid-template-columns: 1fr 260px; padding: 0 24px; gap: 32px }
          .story-right { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 76px; align-self: start; max-height: calc(100vh - 92px); overflow-y: auto }
          .comment-form-grid { grid-template-columns: 1fr 1fr }
          .bottom-ad-item { width: 320px }
        }

        @media (min-width: 1080px) {
          .story-grid { grid-template-columns: 200px 1fr 280px; gap: 36px; padding: 0 32px }
          .story-left { display: flex; flex-direction: column; gap: 14px; position: sticky; top: 76px; align-self: start; max-height: calc(100vh - 92px); overflow-y: auto; padding-right: 4px }
          .story-right { width: 280px }
          .story-left::-webkit-scrollbar,
          .story-right::-webkit-scrollbar { width: 3px }
          .story-left::-webkit-scrollbar-thumb,
          .story-right::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px }
          .bottom-ad-item { width: 280px }
        }

        @media (max-width: 600px) {
          .share-menu { position: fixed; left: 12px; right: 12px; bottom: 12px; top: auto; width: auto; border-radius: 10px }
        }
      `}</style>

      <div style={{ paddingTop: 20, paddingBottom: 48 }}>

        {/* ===================================================
            HERO AD — full width above the story
        =================================================== */}
        {heroAd && (
          <div className="story-fade" style={{ maxWidth: 1200, margin: '0 auto 24px', padding: '0 16px' }}>
            <AdCard
              ad={heroAd}
              imgStyle={{ width: '100%', height: 120, objectFit: 'cover' }}
            />
          </div>
        )}

        <div className="story-grid">

          {/* ===================================================
              LEFT SIDEBAR — Ads only
          =================================================== */}
          {leftSidebarAds.length > 0 && (
            <aside className="story-left">
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 8,
                fontWeight: 800,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: '#bbb',
                marginBottom: 10,
                textAlign: 'center'
              }}>
                Sponsors
              </div>
              {leftSidebarAds.map((ad, i) => (
                <div key={ad._id || ad.id || i} className={`sidebar-ad ad-slide ad-slide-d${Math.min(i + 1, 3)}`}>
                  <AdCard ad={ad} imgStyle={{ width: '100%', height: 180, objectFit: 'cover' }} />
                </div>
              ))}
            </aside>
          )}

          {/* ===================================================
              MAIN ARTICLE
          =================================================== */}
          <main className="story-main">

            {/* — Breadcrumb — */}
            <nav
              className="story-fade"
              style={{
                display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap',
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 2,
                textTransform: 'uppercase', color: '#bbb', marginBottom: 14
              }}
            >
              <Link to="/" style={{ color: '#bbb', textDecoration: 'none' }}>Home</Link>
              <span>›</span>
              <Link to={`/category/${story.category}`} style={{ color: '#c0392b', textDecoration: 'none' }}>
                {story.category}
              </Link>
            </nav>

            {/* — Category Badge — */}
            <div className="story-fade story-fade-d1" style={{ marginBottom: 12 }}>
              <Link
                to={`/category/${story.category}`}
                style={{
                  display: 'inline-block', background: '#c0392b', color: '#fff',
                  padding: '3px 12px', fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800, fontSize: 9, letterSpacing: 2.5,
                  textTransform: 'uppercase', textDecoration: 'none', borderRadius: 3
                }}
              >
                {story.category}
              </Link>
            </div>

            {/* — Title — */}
            <h1
              className="story-fade story-fade-d1"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(1.5rem, 3.8vw, 2.5rem)',
                fontWeight: 900, lineHeight: 1.15, margin: '0 0 14px', color: '#0d0d0d'
              }}
            >
              {story.title}
            </h1>

            {/* — Meta Bar — */}
            <div
              className="story-fade story-fade-d2"
              style={{
                display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: '#666',
                borderBottom: '2px solid #e8e4d8', paddingBottom: 14, marginBottom: 20
              }}
            >
              {authorAvatar && (
                <img
                  src={imgUrl(authorAvatar)} alt=""
                  loading="lazy"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER; }}
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e8e4d8' }}
                />
              )}
              <Link
                to={`/author/${encodeURIComponent(story.author)}`}
                style={{ fontWeight: 700, textDecoration: 'none', color: '#0d0d0d' }}
              >
                {story.author}
              </Link>
              <span style={{ color: '#ddd' }}>·</span>
              <span>{timeAgo(story.created_at || story.createdAt)}</span>
              <span style={{ color: '#ddd' }}>·</span>
              <span>👁 {Number(story.views || 0).toLocaleString()} views</span>
            </div>

            {/* — Hero Image — */}
            <div className="story-fade story-fade-d2" style={{ marginBottom: 24 }}>
              <img
                src={imgUrl(story.image)}
                alt={story.title}
                loading="eager"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER; }}
                style={{
                  width: '100%', maxHeight: 500, minHeight: 240,
                  aspectRatio: '16/9', objectFit: 'cover',
                  borderRadius: 8, display: 'block'
                }}
              />
            </div>

            {/* — First Inline Ad (after hero image) — */}
            {inlineAds[0] && (
              <div className="story-fade story-fade-d3" style={{ marginBottom: 24 }}>
                <AdCard ad={inlineAds[0]} className="inline-ad-banner" imgStyle={{ width: '100%', height: 100, objectFit: 'cover' }} />
              </div>
            )}

            {/* — Story Body — */}
            <div
              className="story-fade story-fade-d3"
              style={{
                fontSize: '1.05rem', lineHeight: 1.82,
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: '#1a1a1a', marginBottom: 12
              }}
              dangerouslySetInnerHTML={{ __html: story.description }}
            />

            {/* — Second Inline Ad (mid-article) — */}
            {inlineAds[1] && (
              <div style={{ margin: '24px 0' }}>
                <AdCard ad={inlineAds[1]} className="inline-ad-banner" imgStyle={{ width: '100%', height: 100, objectFit: 'cover' }} />
              </div>
            )}

            {/* — Tags — */}
            {story.tags && (
              <div className="story-fade story-fade-d4" style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 24 }}>
                {story.tags.split(',').map((tag) => (
                  <Link
                    key={tag}
                    to={`/search?q=${encodeURIComponent(tag.trim())}`}
                    style={{
                      background: '#f5f3ec', padding: '4px 11px',
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 10, fontWeight: 700, border: '1px solid #e8e4d8',
                      textDecoration: 'none', color: '#444', borderRadius: 20
                    }}
                  >
                    #{tag.trim()}
                  </Link>
                ))}
              </div>
            )}

            {/* — Third Inline Ad (after tags) — */}
            {inlineAds[2] && (
              <div style={{ marginBottom: 24 }}>
                <AdCard ad={inlineAds[2]} className="inline-ad-banner" imgStyle={{ width: '100%', height: 100, objectFit: 'cover' }} />
              </div>
            )}

            {/* ===================================================
                REACTIONS BAR
            =================================================== */}
            <div
              style={{
                display: 'flex', gap: 6, padding: '14px 0', flexWrap: 'wrap', alignItems: 'center',
                borderTop: '2px solid #e8e4d8', borderBottom: '2px solid #e8e4d8', marginBottom: 24
              }}
            >
              {reactionButtons.map((r) => (
                <button
                  key={r.type}
                  type="button"
                  className={`react-btn ${userReaction === r.type ? 'active' : ''}`}
                  onClick={() => handleReact(r.type)}
                  title={r.label}
                >
                  <span style={{ fontSize: 15 }}>{r.emoji}</span>
                  <span>{Number(reactions[r.type] || 0)}</span>
                </button>
              ))}

              <div style={{ flex: 1 }} />

              {/* Share Button */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setShowShareMenu((p) => !p)}
                  style={{
                    padding: '8px 16px', background: '#0d0d0d', color: '#fff',
                    border: 'none', borderRadius: 20, cursor: 'pointer',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700, fontSize: 11, letterSpacing: 1,
                    transition: 'all .2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#c0392b'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#0d0d0d'; }}
                >
                  🔗 Share
                </button>

                {showShareMenu && (
                  <div className="share-menu">
                    <button type="button" className="share-opt" onClick={handleNativeShare}>📱 Share via apps</button>
                    <a className="share-opt" href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer">🔵 Facebook</a>
                    <a className="share-opt" href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer">⚫ X / Twitter</a>
                    <a className="share-opt" href={`https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${currentUrl}`)}`} target="_blank" rel="noopener noreferrer">🟢 WhatsApp</a>
                    <a className="share-opt" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer">🔷 LinkedIn</a>
                    <a className="share-opt" href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer">✈️ Telegram</a>
                    <a className="share-opt" href={`mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`${shareTitle}\n\n${currentUrl}`)}`}>✉️ Email</a>
                    <button type="button" className="share-opt" onClick={copyLink}>🔗 Copy Link</button>
                  </div>
                )}
              </div>
            </div>

            {/* — Toast message — */}
            {commentMsg && (
              <div style={{
                marginBottom: 20, padding: '10px 16px', borderRadius: 6, fontSize: 13,
                background: commentMsg.startsWith('❌') ? 'rgba(192,57,43,.07)' : 'rgba(22,101,52,.07)',
                color: commentMsg.startsWith('❌') ? '#c0392b' : '#166534',
                border: `1px solid ${commentMsg.startsWith('❌') ? 'rgba(192,57,43,.15)' : 'rgba(22,101,52,.15)'}`
              }}>
                {commentMsg}
              </div>
            )}

            {/* ===================================================
                AUTHOR BOX
            =================================================== */}
            <div
              style={{
                background: 'linear-gradient(135deg, #f5f3ec 0%, #eee9dc 100%)',
                padding: 22, display: 'flex', gap: 16, alignItems: 'flex-start',
                borderRadius: 10, border: '1px solid #e8e4d8', marginBottom: 28
              }}
            >
              {authorAvatar && (
                <img
                  src={imgUrl(authorAvatar)} alt=""
                  loading="lazy"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER; }}
                  style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '3px solid #e8e4d8' }}
                />
              )}
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 8, letterSpacing: 2.5, textTransform: 'uppercase', color: '#c0392b', marginBottom: 4 }}>
                  About the Author
                </div>
                <Link
                  to={`/author/${encodeURIComponent(story.author)}`}
                  style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', fontWeight: 700, textDecoration: 'none', color: '#0d0d0d' }}
                >
                  {story.author}
                </Link>
                <p style={{ fontSize: 12.5, color: '#555', fontStyle: 'italic', marginTop: 5, lineHeight: 1.6 }}>
                  {story.author_bio_full || story.author_bio || "Staff writer at Mahoko Friday News, covering the stories that matter most to Rwanda's youth."}
                </p>
              </div>
            </div>

            {/* ===================================================
                RELATED STORIES
            =================================================== */}
            {related.length > 0 && (
              <section style={{ marginBottom: 32 }}>
                <SectionLabel>Related Stories</SectionLabel>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16 }}>
                  {related.map((rs) => (
                    <Link
                      key={rs._id || rs.id}
                      to={`/story/${rs._id || rs.id}`}
                      className="related-card"
                    >
                      <div style={{ overflow: 'hidden' }}>
                        <img
                          src={imgUrl(rs.image)} alt="" loading="lazy"
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER; }}
                          style={{ width: '100%', aspectRatio: '16/10', height: 'auto', objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                      <div style={{ padding: '10px 12px 12px' }}>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 8, color: '#c0392b', fontWeight: 800, letterSpacing: 2, marginBottom: 4 }}>
                          {rs.category}
                        </div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '.85rem', fontWeight: 700, lineHeight: 1.3 }}>
                          {(rs.title || '').substring(0, 70)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ===================================================
                DISCUSSION SECTION
            =================================================== */}
            <section style={{ marginBottom: 24 }}>
              <SectionLabel>Discussion ({comments.length})</SectionLabel>

              <div
                style={{
                  background: 'linear-gradient(135deg, #f5f3ec 0%, #eee9dc 100%)',
                  padding: '32px 24px', border: '1px solid #e8e4d8',
                  borderRadius: 10, textAlign: 'center'
                }}
              >
                <div style={{ fontSize: 38, marginBottom: 8 }}>💬</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700, marginBottom: 6, margin: '0 0 6px' }}>
                  {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                </h3>
                <p style={{ color: '#666', fontSize: 13, marginBottom: 18, fontStyle: 'italic' }}>
                  {comments.length > 0
                    ? 'Join the conversation and share your thoughts.'
                    : 'Be the first to comment on this story.'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowCommentModal(true)}
                  style={{
                    background: '#0d0d0d', color: '#fff', border: 'none',
                    padding: '12px 30px', borderRadius: 24, cursor: 'pointer',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 800, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase',
                    transition: 'background .2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#c0392b'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#0d0d0d'; }}
                >
                  {comments.length > 0 ? `💬 View Comments (${comments.length})` : '💬 Add a Comment'}
                </button>
              </div>
            </section>

          </main>

          {/* ===================================================
              RIGHT SIDEBAR
          =================================================== */}
          <aside className="story-right">

            {/* Most Read */}
            <div
              style={{
                background: '#fff', border: '1px solid #e8e4d8', padding: 16,
                borderTop: '3px solid #0d0d0d', borderRadius: 6
              }}
            >
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 10,
                letterSpacing: 2.5, textTransform: 'uppercase', paddingBottom: 8,
                marginBottom: 12, borderBottom: '3px solid #0d0d0d'
              }}>
                🔥 Most Read
              </div>
              {popular.map((ps, i) => (
                <PopularItem key={ps._id || ps.id} story={ps} rank={i + 1} />
              ))}
            </div>

            {/* Right Sidebar Ads */}
            {rightSidebarAds.length > 0 && (
              <div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 8, fontWeight: 800,
                  letterSpacing: 2, textTransform: 'uppercase', color: '#bbb',
                  marginBottom: 8, textAlign: 'center'
                }}>
                  Sponsors
                </div>
                {rightSidebarAds.map((ad, i) => (
                  <div key={ad._id || ad.id || i} className={`sidebar-ad ad-slide ad-slide-d${Math.min(i + 1, 3)}`} style={{ marginBottom: 14 }}>
                    <AdCard ad={ad} imgStyle={{ width: '100%', height: 200, objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}

            <NewsletterWidget />
            <WhatsAppCTA />
          </aside>

        </div>

        {/* ===================================================
            BOTTOM AD CAROUSEL
        =================================================== */}
        {bottomAds.length > 0 && (
          <div style={{ maxWidth: 1200, margin: '36px auto 0', padding: '0 16px' }}>
            <SectionLabel>Our Sponsors</SectionLabel>
            <div className="bottom-ad-track">
              {bottomAds.map((ad, i) => (
                <div key={ad._id || ad.id || i} className="bottom-ad-item">
                  <AdCard
                    ad={bottomAds[(adRotatorIndex + i) % bottomAds.length]}
                    imgStyle={{ width: '100%', height: 180, objectFit: 'cover' }}
                  />
                </div>
              ))}
              {/* Duplicate first few for infinite scroll feel */}
              {bottomAds.slice(0, 2).map((ad, i) => (
                <div key={`dup-${i}`} className="bottom-ad-item">
                  <AdCard
                    ad={ad}
                    imgStyle={{ width: '100%', height: 180, objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===================================================
          COMMENT MODAL
      =================================================== */}
      {showCommentModal && (
        <div
          className="modal-bg"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCommentModal(false); }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12
          }}
        >
          <div
            className="modal-card"
            style={{
              background: '#fff', borderRadius: 12, maxWidth: 560, width: '100%',
              maxHeight: '85vh', overflowY: 'auto', border: '1px solid #e8e4d8',
              boxShadow: '0 24px 64px rgba(0,0,0,.2)'
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px', borderBottom: '1px solid #e8e4d8', position: 'sticky', top: 0, background: '#fff', zIndex: 1, borderRadius: '12px 12px 0 0'
            }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                💬 Comments ({comments.length})
              </h3>
              <button
                type="button"
                onClick={() => setShowCommentModal(false)}
                style={{
                  background: '#f5f3ec', border: '1px solid #e8e4d8', width: 34, height: 34,
                  borderRadius: 8, cursor: 'pointer', fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333',
                  transition: 'background .15s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e8e4d8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f5f3ec'; }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '18px 20px' }}>

              {/* Refresh */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <button
                  type="button"
                  onClick={refreshComments}
                  disabled={refreshingComments}
                  style={{
                    background: '#f5f3ec', border: '1px solid #e8e4d8', padding: '5px 14px',
                    borderRadius: 16, cursor: refreshingComments ? 'not-allowed' : 'pointer',
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 10,
                    letterSpacing: 1, textTransform: 'uppercase', opacity: refreshingComments ? .5 : 1,
                    display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s'
                  }}
                >
                  {refreshingComments && <span className="spinner-sm" />}
                  {refreshingComments ? 'Refreshing...' : '↻ Refresh'}
                </button>
              </div>

              {/* Comments List */}
              {comments.length > 0 ? (
                <div style={{ marginBottom: 22, maxHeight: 280, overflowY: 'auto', border: '1px solid #e8e4d8', borderRadius: 8 }}>
                  {comments.map((c, i) => (
                    <div
                      key={c._id || c.id || i}
                      className="comment-row"
                      style={{
                        padding: '14px 16px',
                        borderBottom: i < comments.length - 1 ? '1px solid #f0ece0' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, color: '#0d0d0d' }}>
                          {c.name || 'Anonymous'}
                        </div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: '#bbb', letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap', marginLeft: 10 }}>
                          {timeAgo(c.created_at || c.createdAt)}
                        </div>
                      </div>
                      <div style={{ fontSize: 13.5, lineHeight: 1.65, color: '#333' }}>
                        {c.comment || c.text || c.body}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 16px', marginBottom: 22, background: '#f5f3ec', borderRadius: 8, border: '1px solid #e8e4d8' }}>
                  <div style={{ fontSize: 32, marginBottom: 6 }}>💭</div>
                  <p style={{ color: '#666', fontSize: 13, margin: 0, fontStyle: 'italic' }}>
                    No comments yet. Be the first to share your thoughts!
                  </p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleComment}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#0d0d0d', marginBottom: 10 }}>
                  Add a Comment
                </div>

                <div className="comment-form-grid">
                  <input
                    type="text" placeholder="Your name *" required
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    style={{
                      padding: '10px 14px', border: '1px solid #e8e4d8', borderRadius: 8,
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 600,
                      background: '#faf9f5', outline: 'none', boxSizing: 'border-box',
                      transition: 'border-color .15s'
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#c0392b'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e8e4d8'; }}
                  />
                  <input
                    type="email" placeholder="Your email *" required
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    style={{
                      padding: '10px 14px', border: '1px solid #e8e4d8', borderRadius: 8,
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 600,
                      background: '#faf9f5', outline: 'none', boxSizing: 'border-box',
                      transition: 'border-color .15s'
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#c0392b'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e8e4d8'; }}
                  />
                </div>

                <textarea
                  placeholder="Write your comment..." required rows={4}
                  value={form.comment}
                  onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
                  style={{
                    width: '100%', padding: '10px 14px', border: '1px solid #e8e4d8', borderRadius: 8,
                    fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 13, lineHeight: 1.6,
                    background: '#faf9f5', outline: 'none', resize: 'vertical',
                    marginTop: 10, marginBottom: 14, boxSizing: 'border-box',
                    transition: 'border-color .15s'
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#c0392b'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e8e4d8'; }}
                />

                {commentMsg && (
                  <div style={{
                    marginBottom: 12, padding: '9px 14px', borderRadius: 8, fontSize: 12.5,
                    background: commentMsg.startsWith('❌') ? 'rgba(192,57,43,.07)' : 'rgba(22,101,52,.07)',
                    color: commentMsg.startsWith('❌') ? '#c0392b' : '#166534',
                    border: `1px solid ${commentMsg.startsWith('❌') ? 'rgba(192,57,43,.15)' : 'rgba(22,101,52,.15)'}`
                  }}>
                    {commentMsg}
                  </div>
                )}

                <button
                  type="submit" disabled={submitting}
                  style={{
                    background: submitting ? '#999' : '#0d0d0d', color: '#fff',
                    border: 'none', padding: '11px 28px', borderRadius: 24, cursor: submitting ? 'not-allowed' : 'pointer',
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 11,
                    letterSpacing: 2, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8,
                    transition: 'background .2s'
                  }}
                  onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = '#c0392b'; }}
                  onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = '#0d0d0d'; }}
                >
                  {submitting && <span className="spinner-sm" />}
                  {submitting ? 'Submitting...' : '📤 Submit Comment'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </PublicLayout>
  );
}
