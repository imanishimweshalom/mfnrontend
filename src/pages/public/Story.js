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
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Crect width='800' height='450' fill='%23e8e4d8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%23bbb'%3ENo Image%3C/text%3E%3C/svg%3E";

/* =============================================================
   AdCard — supports BOTH Video and Image ads from database
============================================================= */
const AdCard = React.memo(function AdCard({
  ad,
  height = 180,
  fluid = false,
  className = ''
}) {
  if (!ad) return null;

  const rawMedia =
    ad.image_url ||
    ad.imageUrl ||
    ad.image ||
    ad.banner ||
    ad.bannerUrl ||
    ad.img ||
    ad.file_url ||
    ad.photo ||
    ad.file ||
    ad.banner_image ||
    ad.ad_image;

  const media = rawMedia ? imgUrl(rawMedia) : null;
  const isVideo =
    ad.type === 'video' ||
    (rawMedia && /\.(mp4|webm|ogg|mov)$/i.test(rawMedia));

  const link = ad.link || ad.url || ad.click_url || ad.target_url || ad.ad_url || '#';
  const title = ad.title || ad.name || ad.ad_title || 'Sponsored Ad';
  const description = ad.description || ad.ad_description || '';

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`mhk-ad-card ${className}`}
      style={{
        width: '100%',
        height: fluid ? '100%' : height,
        textDecoration: 'none',
        background: '#fff',
        marginBottom: fluid ? 0 : 12,
        flex: fluid ? 1 : 'unset'
      }}
    >
      {media ? (
        isVideo ? (
          <video
            src={media}
            autoPlay
            muted
            loop
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              flex: 1
            }}
          />
        ) : (
          <img
            src={media}
            alt={title}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = PLACEHOLDER;
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              flex: 1
            }}
          />
        )
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#bbb',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 14,
            flex: 1,
            background: '#f8f9fa',
            padding: 10,
            textAlign: 'center'
          }}
        >
          <span style={{ fontWeight: 700, marginBottom: 4 }}>{title}</span>
          <small style={{ fontSize: 10, opacity: 0.7 }}>
            Ad Space Available
          </small>
        </div>
      )}

      <div
        style={{
          padding: '4px 10px',
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 8,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: '#bbb',
          background: '#f0ece0',
          borderTop: '1px solid #e8e4d8'
        }}
      >
        Advertisement
        {title && title !== 'Sponsored Ad' && (
          <span style={{ color: '#555', marginLeft: 6, fontSize: 9, fontWeight: 700 }}>
            — {title}
          </span>
        )}
      </div>
    </a>
  );
});

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

  const [showCommentModal, setShowCommentModal] = useState(false);
  const [adIndex, setAdIndex] = useState(0);

  /* ---- All 8 reaction types with counts ---- */
  const [reactions, setReactions] = useState({
    likes: 0,
    dislikes: 0,
    love: 0,
    laugh: 0,
    wow: 0,
    sad: 0,
    angry: 0,
    celebrate: 0
  });

  /* Track which reaction the user clicked last */
  const [userReaction, setUserReaction] = useState(null);

  /* =========================================================
     LOAD DATA
  ========================================================= */
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

        /* ---- Set ALL reaction counts from the story ---- */
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

        /* ---- Comments ---- */
        const rawC = cRes.data;
        const cArr = Array.isArray(rawC)
          ? rawC
          : (rawC?.comments || rawC?.data || []);
        setComments(cArr);

        /* ---- Popular ---- */
        const rawP = pRes.data;
        setPopular(
          Array.isArray(rawP) ? rawP : (rawP?.stories || rawP?.data || [])
        );

        /* ---- Ads ---- */
        const rawA = aRes.data;
        const adsArr = Array.isArray(rawA)
          ? rawA
          : (rawA?.ads || rawA?.data || rawA?.items || []);
        setAds(adsArr);

        /* ---- Related ---- */
        const relRes = await storiesAPI.getAll({
          category: s.category,
          limit: 5,
          status: 'published'
        });
        const relArr = Array.isArray(relRes.data)
          ? relRes.data
          : (relRes.data?.stories || relRes.data?.data || []);
        setRelated(
          relArr
            .filter((r) => String(r._id || r.id) !== String(id))
            .slice(0, 4)
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  /* =========================================================
     ACTIVE ADS — filter out inactive/paused/draft
  ========================================================= */
  const activeAds = useMemo(() => {
    return (ads || []).filter(
      (a) =>
        a &&
        a.is_active !== false &&
        a.status !== 'inactive' &&
        a.status !== 'paused' &&
        a.status !== 'draft'
    );
  }, [ads]);

  /* ---- Split ads into zones by position field or fallback index ---- */
  const heroAd = useMemo(() => {
    return (
      activeAds.find(
        (a) =>
          String(a.position || a.placement || '').toLowerCase() === 'hero'
      ) || null
    );
  }, [activeAds]);

  const leftAds = useMemo(() => {
    const pos = activeAds.filter(
      (a) =>
        String(a.position || a.placement || '').toLowerCase() === 'left'
    );
    return pos.length > 0 ? pos.slice(0, 3) : activeAds.slice(0, 3);
  }, [activeAds]);

  const rightAds = useMemo(() => {
    const pos = activeAds.filter(
      (a) =>
        String(a.position || a.placement || '').toLowerCase() === 'right'
    );
    if (pos.length > 0) return pos.slice(0, 3);
    return activeAds.slice(3, 6).length > 0
      ? activeAds.slice(3, 6)
      : activeAds.slice(0, 3);
  }, [activeAds]);

  const inlineAds = useMemo(() => {
    const pos = activeAds.filter(
      (a) =>
        String(a.position || a.placement || '').toLowerCase() === 'inline'
    );
    return pos.length > 0 ? pos.slice(0, 3) : activeAds.slice(2, 5);
  }, [activeAds]);

  const floatAds = useMemo(() => {
    const pos = activeAds.filter(
      (a) =>
        String(a.position || a.placement || '').toLowerCase() === 'bottom'
    );
    return pos.length > 0 ? pos.slice(0, 3) : activeAds.slice(0, 3);
  }, [activeAds]);

  /* ---- Bottom carousel rotation every 8s ---- */
  useEffect(() => {
    if (floatAds.length === 0) return;
    const timer = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % floatAds.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [floatAds]);

  /* ---- Lock body scroll when modal open ---- */
  useEffect(() => {
    document.body.style.overflow = showCommentModal ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showCommentModal]);

  /* ---- Escape key closes modal ---- */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setShowCommentModal(false);
    };
    if (showCommentModal) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showCommentModal]);

  /* =========================================================
     HANDLE REACTION — works for ALL 8 emoji types
  ========================================================= */
  const handleReact = async (type) => {
    try {
      const res = await storiesAPI.react(id, type);
      if (res?.data) {
        setReactions((prev) => ({
          ...prev,
          ...res.data
        }));
      }
      setUserReaction(type);
    } catch (e) {
      console.error('Reaction error:', e);
    }
  };

  /* =========================================================
     HANDLE COMMENT
  ========================================================= */
  const handleComment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setCommentMsg('');
    try {
      await commentsAPI.create({ story_id: id, ...form });
      setCommentMsg('✅ Comment submitted for review!');
      setForm({ name: '', email: '', comment: '' });
      setRefreshingComments(true);
      try {
        const cRes = await commentsAPI.getByStory(id);
        const raw = cRes.data;
        setComments(
          Array.isArray(raw) ? raw : (raw?.comments || raw?.data || [])
        );
      } catch (_) {}
      finally {
        setRefreshingComments(false);
      }
      setTimeout(() => setCommentMsg(''), 4000);
    } catch {
      setCommentMsg('❌ Error submitting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     LOADING / NOT FOUND
  ========================================================= */
  if (loading) {
    return (
      <PublicLayout>
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
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

  /* ---- All 8 reaction buttons config ---- */
  const reactionButtons = [
    { type: 'likes', emoji: '👍', label: 'Like' },
    { type: 'love', emoji: '❤️', label: 'Love' },
    { type: 'laugh', emoji: '😂', label: 'Haha' },
    { type: 'wow', emoji: '😮', label: 'Wow' },
    { type: 'sad', emoji: '😢', label: 'Sad' },
    { type: 'angry', emoji: '😡', label: 'Angry' },
    { type: 'celebrate', emoji: '👏', label: 'Celebrate' },
    { type: 'dislikes', emoji: '👎', label: 'Dislike' }
  ];

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <PublicLayout>
      <style>{`
        @keyframes mhkFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes mhkPop { from { transform: translateY(40px) scale(.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
        @keyframes mhkSpin { to { transform: rotate(360deg); } }
        @keyframes mhkAdFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes mhkBounce { 0%,100% { transform: scale(1); } 50% { transform: scale(1.35); } }

.mhk-modal-bg { animation: mhkFade .25s ease-out forwards; }
.mhk-modal-card { animation: mhkPop .3s cubic-bezier(.2,.8,.2,1) forwards; }
.mhk-spin { display:inline-block; width:14px; height:14px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation: mhkSpin .6s linear infinite; }

.mhk-react-btn {
transition: all .2s ease;
position: relative;
user-select: none;
}
.mhk-react-btn:hover { background:#e8e4d8 !important; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,.1); }
.mhk-react-btn.active {
background: #fdf0ee !important;
border-color: #c0392b !important;
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(192,57,43,.15);
}
.mhk-react-btn.active .mhk-react-emoji {
animation: mhkBounce .35s ease;
}

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

.mhk-ad-card { transition: transform .3s ease, box-shadow .3s ease; border: 1px solid #e8e4d8; border-radius: 6px; overflow: hidden; display: flex; flex-direction: column; }
.mhk-ad-card:hover { transform: translateY(-3px); box-shadow: 0 8px 18px rgba(0,0,0,.12); }
.mhk-ad-card img, .mhk-ad-card video { transition: transform .4s ease; }
.mhk-ad-card:hover img, .mhk-ad-card:hover video { transform: scale(1.04); }

.mhk-float-fade { animation: mhkAdFade .5s ease; display: flex; gap: 16px; width: 100%; align-items: stretch; }
.mhk-float-extra { display: none; flex: 1; }

.mhk-layout-grid {
display: grid;
grid-template-columns: 1fr;
gap: 20px;
}
.mhk-left-col, .mhk-right-col { width: 100%; }
.mhk-left-col { display: none; }

.mhk-comment-form-grid {
display: grid;
grid-template-columns: 1fr;
gap: 11px;
}
.mhk-modal-wrap { padding: 12px !important; }

.mhk-hero-ad {
margin-bottom: 20px;
border-radius: 8px;
overflow: hidden;
border: 1px solid #e8e4d8;
}
.mhk-hero-ad .mhk-ad-card {
border: none;
border-radius: 0;
}
.mhk-hero-ad .mhk-ad-card:hover {
transform: none;
box-shadow: none;
}
.mhk-hero-ad .mhk-ad-card:hover img,
.mhk-hero-ad .mhk-ad-card:hover video {
transform: none;
}

.mhk-inline-ad {
margin: 24px 0;
border-radius: 8px;
overflow: hidden;
}

@media (min-width: 768px) {
.mhk-layout-grid {
grid-template-columns: 1fr 240px;
gap: 24px;
}
.mhk-right-col { width: 240px; position: sticky; top: 72px; align-self: start; max-height: calc(100vh - 90px); overflow-y: auto; }
.mhk-left-col { display: none; }
.mhk-comment-form-grid {
grid-template-columns: 1fr 1fr;
}
.mhk-float-extra { display: flex; }
}

@media (min-width: 1024px) {
.mhk-layout-grid {
grid-template-columns: 220px 1fr 280px;
gap: 32px;
}
.mhk-left-col { display: flex; flex-direction: column; gap: 12px; position: sticky; top: 72px; align-self: start; max-height: calc(100vh - 90px); overflow-y: auto; padding-right: 4px; }
.mhk-right-col { width: 280px; }
.mhk-left-col::-webkit-scrollbar, .mhk-right-col::-webkit-scrollbar { width: 4px; }
.mhk-left-col::-webkit-scrollbar-thumb, .mhk-right-col::-webkit-scrollbar-thumb { background: #ccc; border-radius: 2px; }
}
`}</style>

{/* ===================================================
HERO AD — full width above everything
=================================================== */}
{heroAd && (
<div className="mhk-hero-ad" style={{ maxWidth: 1200, margin: '0 auto 20px', padding: '0 16px' }}>
<AdCard ad={heroAd} height={120} />
</div>
)}

<div className="mhk-layout-grid">

{/* ── LEFT ADVERTISEMENT SIDEBAR ── */}
{leftAds.length > 0 && (
<aside className="mhk-left-col">
<div style={{
fontFamily: "'Barlow Condensed', sans-serif",
fontSize: 8, fontWeight: 800, letterSpacing: 2,
textTransform: 'uppercase', color: '#bbb',
marginBottom: 8, textAlign: 'center'
}}>
Sponsors
</div>
{leftAds.map((ad, i) => (
<AdCard key={ad._id || ad.id || i} ad={ad} height={220} />
))}
</aside>
)}

{/* ── ARTICLE ── */}
<article className="mhk-center-col">

{/* Breadcrumb */}
<div style={{
fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10,
letterSpacing: 2, textTransform: 'uppercase', color: '#bbb',
display: 'flex', gap: 8, alignItems: 'center',
marginBottom: 12, flexWrap: 'wrap'
}}>
<Link to="/" style={{ color: '#bbb', textDecoration: 'none' }}>Home</Link>
<span>›</span>
<Link to={`/category/${story.category}`} style={{ color: '#c0392b', textDecoration: 'none' }}>
{story.category}
</Link>
</div>

{/* Category Badge */}
<div style={{ marginBottom: 10 }}>
<Link
to={`/category/${story.category}`}
style={{
background: '#c0392b', color: '#fff', padding: '3px 10px',
fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
fontSize: 9, letterSpacing: 2, textTransform: 'uppercase',
textDecoration: 'none', borderRadius: 2
}}
>
{story.category}
</Link>
</div>

{/* Title */}
<h1 style={{
fontFamily: "'Playfair Display', Georgia, serif",
fontSize: 'clamp(1.45rem, 3.5vw, 2.4rem)',
fontWeight: 900, lineHeight: 1.15, margin: '12px 0 10px'
}}>
{story.title}
</h1>

{/* Meta Bar */}
<div style={{
display: 'flex', gap: 10,
fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11,
color: '#5a5a5a', marginBottom: 18, flexWrap: 'wrap',
alignItems: 'center', borderBottom: '1px solid #e8e4d8', paddingBottom: 12
}}>
{authorAvatar && (
<img
src={imgUrl(authorAvatar)} alt="" loading="lazy"
onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e8e4d8' }}
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
{story.tags && story.tags.split(',').slice(0, 3).map((t) => (
<Link
key={t}
to={`/search?q=${encodeURIComponent(t.trim())}`}
style={{
background: '#f0ece0', padding: '2px 7px', fontSize: 9,
letterSpacing: 1, color: '#5a5a5a', textDecoration: 'none',
border: '1px solid #e8e4d8', borderRadius: 2
}}
>
#{t.trim()}
</Link>
))}
</div>

{/* Hero Image */}
<img
className="mhk-story-img"
src={imgUrl(story.image)}
alt={story.title}
loading="eager"
onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
style={{
width: '100%', maxWidth: 720, height: 'auto',
maxHeight: 520, minHeight: 260, aspectRatio: '16/9',
objectFit: 'cover', borderRadius: 6, marginBottom: 22,
display: 'block', marginInline: 'auto'
}}
/>

{/* First Inline Ad */}
{inlineAds[0] && (
<div className="mhk-inline-ad">
<AdCard ad={inlineAds[0]} height={90} />
</div>
)}

{/* Story Body */}
<div
style={{
fontSize: '1.02rem', lineHeight: 1.78,
fontFamily: "'Source Serif 4', Georgia, serif", marginBottom: 22
}}
dangerouslySetInnerHTML={{ __html: story.description }}
/>

{/* Second Inline Ad */}
{inlineAds[1] && (
<div className="mhk-inline-ad">
<AdCard ad={inlineAds[1]} height={90} />
</div>
)}

{/* Tags */}
{story.tags && (
<div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 22 }}>
{story.tags.split(',').map((t) => (
<Link
key={t}
to={`/search?q=${encodeURIComponent(t.trim())}`}
style={{
background: '#f0ece0', padding: '4px 10px',
fontFamily: "'Barlow Condensed', sans-serif",
fontSize: 10, fontWeight: 700, border: '1px solid #e8e4d8',
textDecoration: 'none', color: '#0d0d0d', borderRadius: 2
}}
>
#{t.trim()}
</Link>
))}
</div>
)}

{/* Third Inline Ad */}
{inlineAds[2] && (
<div className="mhk-inline-ad">
<AdCard ad={inlineAds[2]} height={90} />
</div>
)}

{/* ===================================================
ALL 8 EMOJI REACTIONS — each clickable with count
=================================================== */}
<div style={{
display: 'flex', gap: 6, padding: '14px 0',
borderTop: '1px solid #e8e4d8',
borderBottom: '1px solid #e8e4d8',
marginBottom: 22, flexWrap: 'wrap', alignItems: 'center'
}}>
{reactionButtons.map((r) => {
const isActive = userReaction === r.type;
return (
<button
key={r.type}
type="button"
className={`mhk-react-btn ${isActive ? 'active' : ''}`}
onClick={() => handleReact(r.type)}
title={r.label}
style={{
display: 'flex', alignItems: 'center', gap: 5,
padding: '7px 12px', background: '#f0ece0',
border: '1px solid #e8e4d8',
fontFamily: "'Barlow Condensed', sans-serif",
fontWeight: 700, fontSize: 12, cursor: 'pointer',
borderRadius: 20,
color: isActive ? '#c0392b' : '#333'
}}
>
<span className="mhk-react-emoji" style={{ fontSize: 16, lineHeight: 1 }}>
{r.emoji}
</span>
<span>{Number(reactions[r.type] || 0)}</span>
</button>
);
})}

<div style={{ flex: 1 }} />

{/* Share Buttons */}
<a
className="mhk-share-btn"
href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
target="_blank"
rel="noopener noreferrer"
style={{
padding: '7px 12px', background: '#1877f2', color: '#fff',
fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
fontSize: 11, textDecoration: 'none', letterSpacing: 1,
borderRadius: 3
}}
>
Share
</a>
<a
className="mhk-share-btn"
href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(story.title)}`}
target="_blank"
rel="noopener noreferrer"
style={{
padding: '7px 12px', background: '#0d0d0d', color: '#fff',
fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
fontSize: 11, textDecoration: 'none', letterSpacing: 1,
borderRadius: 3
}}
>
Tweet
</a>
<a
className="mhk-share-btn"
href={`https://wa.me/?text=${encodeURIComponent(story.title + ' ' + window.location.href)}`}
target="_blank"
rel="noopener noreferrer"
style={{
padding: '7px 12px', background: '#25d366', color: '#fff',
fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
fontSize: 11, textDecoration: 'none', letterSpacing: 1,
borderRadius: 3
}}
>
WhatsApp
</a>
</div>

{/* Author Box */}
<div style={{
background: '#f0ece0', padding: '18px', display: 'flex',
gap: 14, alignItems: 'flex-start', marginBottom: 24,
border: '1px solid #e8e4d8', borderRadius: 4
}}>
{authorAvatar && (
<img
src={imgUrl(authorAvatar)} alt="" loading="lazy"
onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
style={{
width: 54, height: 54, borderRadius: '50%', objectFit: 'cover',
flexShrink: 0, border: '2px solid #e8e4d8'
}}
/>
)}
<div>
<div style={{
fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9,
letterSpacing: 2, textTransform: 'uppercase',
color: '#c0392b', marginBottom: 3
}}>
About the Author
</div>
<Link
to={`/author/${encodeURIComponent(story.author)}`}
style={{
fontFamily: "'Playfair Display', serif", fontSize: '1rem',
fontWeight: 700, textDecoration: 'none', color: '#0d0d0d'
}}
>
{story.author}
</Link>
<p style={{
fontSize: 12, color: '#5a5a5a', fontStyle: 'italic',
marginTop: 5, lineHeight: 1.55
}}>
{story.author_bio_full || story.author_bio || "Staff writer at Mahoko Friday News, covering the stories that matter most to Rwanda's youth."}
</p>
</div>
</div>

{/* Related Stories */}
{related.length > 0 && (
<section style={{ marginBottom: 28 }}>
<SectionLabel>Related Stories</SectionLabel>
<div style={{
display: 'grid',
gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))',
gap: 16
}}>
{related.map((s) => (
<Link
key={s._id || s.id}
to={`/story/${s._id || s.id}`}
className="mhk-related-card"
style={{
textDecoration: 'none', color: 'inherit',
display: 'block', borderRadius: 6
}}
>
<img
className="mhk-related-img"
src={imgUrl(s.image)} alt="" loading="lazy"
onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
style={{
width: '100%', aspectRatio: '16/10', height: 'auto',
objectFit: 'cover', marginBottom: 6, borderRadius: 6, display: 'block'
}}
/>
<div style={{
fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9,
color: '#c0392b', fontWeight: 800, letterSpacing: 2, marginBottom: 3
}}>
{s.category}
</div>
<div style={{
fontFamily: "'Playfair Display', serif", fontSize: '.82rem',
fontWeight: 700, lineHeight: 1.3
}}>
{(s.title || '').substring(0, 65)}
</div>
</Link>
))}
</div>
</section>
)}

{/* Discussion */}
<section>
<SectionLabel>Discussion ({comments.length})</SectionLabel>
<div style={{
background: '#f0ece0', padding: '26px 20px',
border: '1px solid #e8e4d8', borderRadius: 6, textAlign: 'center'
}}>
<div style={{ fontSize: 34, marginBottom: 8 }}>💬</div>
<h3 style={{
fontFamily: "'Playfair Display', serif", fontSize: '1.15rem',
fontWeight: 700, marginBottom: 6
}}>
{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
</h3>
<p style={{
color: '#5a5a5a', fontSize: 12.5, marginBottom: 16, fontStyle: 'italic'
}}>
{comments.length > 0
? 'Join the conversation and share your thoughts.'
: 'Be the first to comment on this story.'}
</p>
<button
type="button"
onClick={() => setShowCommentModal(true)}
style={{
background: '#0d0d0d', color: '#fff', border: 'none',
padding: '11px 26px',
fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
fontSize: 12, letterSpacing: 2, textTransform: 'uppercase',
cursor: 'pointer', borderRadius: 3, transition: 'all .2s'
}}
onMouseEnter={(e) => {
e.currentTarget.style.background = '#c0392b';
e.currentTarget.style.transform = 'translateY(-1px)';
}}
onMouseLeave={(e) => {
e.currentTarget.style.background = '#0d0d0d';
e.currentTarget.style.transform = 'translateY(0)';
}}
>
{comments.length > 0
? `💬 View Comments (${comments.length})`
: '💬 Add a Comment'}
</button>
</div>
</section>
</article>

{/* ── RIGHT SIDEBAR ── */}
<aside className="mhk-right-col">
<div>
<div style={{
background: '#fff', border: '1px solid #e8e4d8', padding: 16,
marginBottom: 18, borderTop: '3px solid #0d0d0d', borderRadius: 2
}}>
<div style={{
fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase',
borderBottom: '3px solid #0d0d0d', paddingBottom: 8, marginBottom: 12
}}>
🔥 Most Read
</div>
{popular.map((p, i) => (
<PopularItem key={p._id || p.id} story={p} rank={i + 1} />
))}
</div>

<NewsletterWidget />

{/* Right Sidebar Ads */}
{rightAds.length > 0 && (
<div style={{ marginTop: 16 }}>
<div style={{
fontFamily: "'Barlow Condensed', sans-serif", fontSize: 8,
fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase',
color: '#bbb', marginBottom: 8, textAlign: 'center'
}}>
Sponsors
</div>
{rightAds.map((ad, i) => (
<AdCard key={ad._id || ad.id || i} ad={ad} height={200} />
))}
</div>
)}

<WhatsAppCTA />
</div>
</aside>
</div>

{/* ── BOTTOM AD CAROUSEL ── */}
{floatAds.length > 0 && (
<div style={{ marginTop: 40 }}>
<SectionLabel>Our Sponsors</SectionLabel>
<div
key={adIndex}
className="mhk-float-fade"
style={{ minHeight: 180 }}
>
<AdCard ad={floatAds[adIndex % floatAds.length]} fluid />
<AdCard
ad={floatAds[(adIndex + 1) % floatAds.length]}
fluid
className="mhk-float-extra"
/>
<AdCard
ad={floatAds[(adIndex + 2) % floatAds.length]}
fluid
className="mhk-float-extra"
/>
</div>
</div>
)}

{/* ───────────────────────────────────────────────────────────────
COMMENT MODAL
──────────────────────────────────────────────────────────────── */}
{showCommentModal && (
<div
className="mhk-modal-bg"
onClick={(e) => {
if (e.target === e.currentTarget) setShowCommentModal(false);
}}
style={{
position: 'fixed', inset: 0, background: 'rgba(0,0,0,.62)',
zIndex: 10000, display: 'flex', alignItems: 'flex-start',
justifyContent: 'center', padding: '24px 16px', overflowY: 'auto',
backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)'
}}
>
<div
className="mhk-modal-card mhk-modal-wrap"
style={{
background: '#fff', width: '100%', maxWidth: 640,
borderRadius: 8, boxShadow: '0 24px 64px rgba(0,0,0,.35)',
overflow: 'hidden', marginTop: 24, marginBottom: 24
}}
>
{/* Modal Header */}
<div style={{
display: 'flex', alignItems: 'center', justifyContent: 'space-between',
padding: '14px 18px', borderBottom: '2px solid #0d0d0d',
background: '#0d0d0d', color: '#fff', position: 'sticky', top: 0, zIndex: 2
}}>
<div>
<div style={{
fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9,
letterSpacing: 2, textTransform: 'uppercase',
color: '#c0392b', fontWeight: 800
}}>
Discussion
</div>
<h3 style={{
fontFamily: "'Playfair Display', serif", fontSize: '1.15rem',
fontWeight: 700, margin: 0
}}>
Comments ({comments.length})
{refreshingComments && (
<span
className="mhk-spin"
style={{ marginLeft: 10, borderColor: '#fff', borderTopColor: 'transparent' }}
/>
)}
</h3>
</div>
<button
type="button"
onClick={() => setShowCommentModal(false)}
aria-label="Close"
style={{
width: 32, height: 32, borderRadius: '50%',
background: 'rgba(255,255,255,.15)', color: '#fff',
border: 'none', cursor: 'pointer', fontSize: 18,
display: 'flex', alignItems: 'center', justifyContent: 'center',
padding: 0, transition: 'background .2s'
}}
onMouseEnter={(e) => { e.currentTarget.style.background = '#c0392b'; }}
onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.15)'; }}
>
×
</button>
</div>

{/* Comments List */}
<div style={{ maxHeight: '52vh', overflowY: 'auto' }}>
{comments.length > 0 ? (
<div style={{ padding: '8px 18px' }}>
{comments.map((c) => (
<div
key={c._id || c.id}
className="mhk-comment-row"
style={{ padding: '12px 0', borderBottom: '1px solid #f0ece0' }}
>
<div style={{
display: 'flex', alignItems: 'center',
gap: 10, marginBottom: 6
}}>
<div style={{
width: 34, height: 34, background: '#f0ece0',
borderRadius: '50%', display: 'flex',
alignItems: 'center', justifyContent: 'center',
fontFamily: "'Playfair Display', serif", fontWeight: 700,
fontSize: 14, color: '#c0392b', flexShrink: 0
}}>
{(c.name || 'B').charAt(0).toUpperCase()}
</div>
<div>
<div style={{
fontFamily: "'Barlow Condensed', sans-serif",
fontSize: 13, fontWeight: 700
}}>
{c.name}
</div>
<div style={{
fontFamily: "'Barlow Condensed', sans-serif",
fontSize: 10, color: '#bbb'
}}>
{timeAgo(c.created_at || c.createdAt)}
</div>
</div>
</div>
<p style={{
fontSize: 13, lineHeight: 1.65,
paddingLeft: 44, margin: 0
}}>
{c.comment}
</p>
</div>
))}
</div>
) : (
<div style={{ padding: '28px 20px', textAlign: 'center' }}>
<div style={{ fontSize: 30, marginBottom: 8 }}>💬</div>
<p style={{
color: '#5a5a5a', fontStyle: 'italic', fontSize: 13
}}>
Be the first to comment on this story.
</p>
</div>
)}
</div>

{/* Comment Form */}
<div style={{
background: '#f0ece0', padding: '18px',
borderTop: '2px solid #e8e4d8'
}}>
<h4 style={{
fontFamily: "'Playfair Display', serif", fontSize: '1.02rem',
fontWeight: 700, marginBottom: 12
}}>
Leave a Comment
</h4>
<form
onSubmit={handleComment}
style={{ display: 'flex', flexDirection: 'column', gap: 11 }}
>
<div className="mhk-comment-form-grid">
<div>
<label style={{
display: 'block',
fontFamily: "'Barlow Condensed', sans-serif",
fontSize: 9, fontWeight: 800, letterSpacing: 2,
textTransform: 'uppercase', marginBottom: 5, color: '#5a5a5a'
}}>
Name (blank = BANYA)
</label>
<input
value={form.name}
onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
placeholder="Your name…"
style={{
width: '100%', padding: '10px 12px',
border: '1px solid #e8e4d8', background: '#fff',
fontSize: 13, fontFamily: 'inherit', outline: 'none',
boxSizing: 'border-box', borderRadius: 3
}}
/>
</div>
<div>
<label style={{
display: 'block',
fontFamily: "'Barlow Condensed', sans-serif",
fontSize: 9, fontWeight: 800, letterSpacing: 2,
textTransform: 'uppercase', marginBottom: 5, color: '#5a5a5a'
}}>
Email (optional)
</label>
<input
type="email"
value={form.email}
onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
placeholder="your@email.com"
style={{
width: '100%', padding: '10px 12px',
border: '1px solid #e8e4d8', background: '#fff',
fontSize: 13, fontFamily: 'inherit', outline: 'none',
boxSizing: 'border-box', borderRadius: 3
}}
/>
</div>
</div>
<div>
<label style={{
display: 'block',
fontFamily: "'Barlow Condensed', sans-serif",
fontSize: 9, fontWeight: 800, letterSpacing: 2,
textTransform: 'uppercase', marginBottom: 5, color: '#5a5a5a'
}}>
Comment *
</label>
<textarea
value={form.comment}
onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
rows={4}
required
placeholder="Share your thoughts…"
style={{
width: '100%', padding: '10px 12px',
border: '1px solid #e8e4d8', background: '#fff',
fontSize: 13, fontFamily: 'inherit', outline: 'none',
resize: 'vertical', boxSizing: 'border-box', borderRadius: 3
}}
/>
</div>
<div style={{
display: 'flex', gap: 10,
alignItems: 'center', flexWrap: 'wrap'
}}>
<button
type="submit"
disabled={submitting}
style={{
background: '#0d0d0d', color: '#fff', border: 'none',
padding: '11px 22px',
fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
cursor: submitting ? 'not-allowed' : 'pointer',
opacity: submitting ? 0.7 : 1, borderRadius: 3,
display: 'flex', alignItems: 'center', gap: 8,
transition: 'background .2s'
}}
onMouseEnter={(e) => {
if (!submitting) e.currentTarget.style.background = '#c0392b';
}}
onMouseLeave={(e) => {
if (!submitting) e.currentTarget.style.background = '#0d0d0d';
}}
>
{submitting ? (
<>
<span className="mhk-spin" /> Submitting…
</>
) : (
'Post Comment'
)}
</button>
{commentMsg && (
<p style={{
color: commentMsg.startsWith('✅') ? '#166534' : '#c0392b',
fontSize: 12, margin: 0, padding: '4px 10px', borderRadius: 3,
background: commentMsg.startsWith('✅')
? 'rgba(22,101,52,.08)'
: 'rgba(192,57,43,.08)'
}}>
{commentMsg}
</p>
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
