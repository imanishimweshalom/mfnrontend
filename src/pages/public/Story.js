import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { PopularItem, AdBanner, SectionLabel, NewsletterWidget, WhatsAppCTA, Spinner, EmptyState, imgUrl, timeAgo } from '../../components/ui';
import { storiesAPI, commentsAPI, adsAPI } from '../../utils/api';

/* ================================================================== */
/*  Scoped responsive stylesheet                                      */
/*  (kept inline so nothing outside this file has to change; all      */
/*  selectors are prefixed with mfn- to avoid clashing with anything  */
/*  already on the page)                                              */
/* ================================================================== */
function StoryPageStyles() {
  return (
    <style>{`
      .mfn-page { --mfn-accent:#c0392b; --mfn-ink:#0d0d0d; --mfn-line:#e8e4d8; --mfn-sand:#f0ece0; --mfn-muted:#5a5a5a; }

      .mfn-container { max-width:1260px; margin:0 auto; padding:18px 14px 26px; box-sizing:border-box; }
      @media (min-width:768px)  { .mfn-container { padding:26px 20px 34px; } }
      @media (min-width:1200px) { .mfn-container { padding:32px 20px 40px; } }

      .mfn-layout { display:grid; grid-template-columns:1fr; gap:26px; align-items:start; }
      @media (min-width:1024px) { .mfn-layout { grid-template-columns:1fr 320px; gap:34px; } }

      /* ---- top-of-article ad strip (3 slots) ---- */
      .mfn-top-ads { display:grid; grid-template-columns:1fr; gap:10px; margin-bottom:18px; }
      .mfn-top-ads:empty { display:none; }
      @media (min-width:640px) { .mfn-top-ads { grid-template-columns:repeat(3,1fr); gap:12px; } }
      .mfn-top-ads .mfn-ad-slot { border:1px solid var(--mfn-line); border-radius:8px; overflow:hidden; background:var(--mfn-sand); }
      .mfn-top-ads .mfn-ad-slot img { width:100%; height:90px; object-fit:cover; display:block; }
      @media (min-width:640px) { .mfn-top-ads .mfn-ad-slot img { height:110px; } }

      /* ---- breadcrumb / meta / hero ---- */
      .mfn-breadcrumb { font-family:'Barlow Condensed',sans-serif; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#bbb; display:flex; gap:8px; align-items:center; margin-bottom:14px; flex-wrap:wrap; }
      .mfn-title { font-family:'Playfair Display',Georgia,serif; font-size:clamp(1.5rem,5vw,3rem); font-weight:900; line-height:1.12; margin:14px 0 12px; }
      .mfn-meta { display:flex; gap:10px; font-family:'Barlow Condensed',sans-serif; font-size:12px; color:var(--mfn-muted); margin-bottom:20px; flex-wrap:wrap; align-items:center; border-bottom:1px solid var(--mfn-line); padding-bottom:14px; }

      .mfn-hero-img { width:100%; height:auto; max-height:340px; min-height:180px; aspect-ratio:16/9; object-fit:cover; border-radius:8px; margin-bottom:22px; display:block; }
      @media (min-width:640px)  { .mfn-hero-img { max-height:440px; } }
      @media (min-width:1024px) { .mfn-hero-img { max-height:560px; } }

      .mfn-body { font-size:1rem; line-height:1.75; font-family:'Source Serif 4',Georgia,serif; margin-bottom:22px; }
      @media (min-width:768px) { .mfn-body { font-size:1.08rem; line-height:1.85; } }

      .mfn-tags { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:22px; }
      .mfn-tag { background:var(--mfn-sand); padding:5px 12px; font-family:'Barlow Condensed',sans-serif; font-size:11px; font-weight:700; border:1px solid var(--mfn-line); text-decoration:none; color:var(--mfn-ink); }

      /* ---- reactions / share ---- */
      .mfn-actions { display:flex; gap:8px; padding:16px 0; border-top:1px solid var(--mfn-line); border-bottom:1px solid var(--mfn-line); margin-bottom:22px; flex-wrap:wrap; }
      .mfn-react-btn { display:flex; align-items:center; gap:6px; padding:8px 14px; background:var(--mfn-sand); border:1px solid var(--mfn-line); border-radius:6px; font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:13px; cursor:pointer; transition:transform .15s ease, background .15s ease; }
      .mfn-react-btn:hover { transform:translateY(-1px); background:#e9e4d4; }
      .mfn-share-btn { padding:8px 14px; border-radius:6px; font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:12px; text-decoration:none; letter-spacing:1px; transition:opacity .15s ease; }
      .mfn-share-btn:hover { opacity:.85; }

      /* ---- author box ---- */
      .mfn-author-box { background:var(--mfn-sand); padding:18px; display:flex; gap:16px; align-items:flex-start; margin-bottom:26px; border:1px solid var(--mfn-line); border-radius:8px; }

      /* ---- related ---- */
      .mfn-related-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
      @media (min-width:640px)  { .mfn-related-grid { grid-template-columns:repeat(3,1fr); gap:18px; } }
      @media (min-width:1024px) { .mfn-related-grid { grid-template-columns:repeat(4,1fr); gap:20px; } }

      /* ---- comments trigger card (replaces the always-open form) ---- */
      .mfn-comments-trigger { display:flex; align-items:center; justify-content:space-between; gap:14px; background:var(--mfn-sand); border:1px solid var(--mfn-line); border-radius:10px; padding:18px 20px; margin-top:8px; }
      .mfn-comments-trigger__text h3 { font-family:'Playfair Display',serif; font-size:1.05rem; font-weight:700; margin:0 0 4px; }
      .mfn-comments-trigger__text p { margin:0; font-size:13px; color:var(--mfn-muted); }
      .mfn-comments-trigger__btn { flex-shrink:0; background:var(--mfn-ink); color:#fff; border:none; border-radius:6px; padding:12px 20px; font-family:'Barlow Condensed',sans-serif; font-weight:800; font-size:12px; letter-spacing:1.5px; text-transform:uppercase; cursor:pointer; transition:transform .15s ease, background .15s ease; }
      .mfn-comments-trigger__btn:hover { transform:translateY(-1px); background:var(--mfn-accent); }

      /* ---- sidebar ---- */
      .mfn-sidebar-card { background:#fff; border:1px solid var(--mfn-line); padding:18px; margin-bottom:20px; border-top:3px solid var(--mfn-ink); border-radius:2px; }
      .mfn-sidebar-card__label { font-family:'Barlow Condensed',sans-serif; font-weight:800; font-size:11px; letter-spacing:2.5px; text-transform:uppercase; border-bottom:3px solid var(--mfn-ink); padding-bottom:9px; margin-bottom:14px; }
      .mfn-sidebar-ads { display:flex; flex-direction:column; gap:12px; }

      /* ================= comment modal ================= */
      .mfn-modal-overlay { position:fixed; inset:0; background:rgba(13,13,13,.55); display:flex; align-items:flex-end; justify-content:center; z-index:1000; padding:0; animation:mfnFadeIn .2s ease; }
      @media (min-width:768px) { .mfn-modal-overlay { align-items:center; padding:20px; } }
      .mfn-modal-overlay--out { animation:mfnFadeOut .2s ease forwards; }

      .mfn-modal { background:#fff; width:100%; max-width:640px; max-height:88vh; border-radius:16px 16px 0 0; display:flex; flex-direction:column; animation:mfnSlideUp .28s ease; box-shadow:0 -8px 30px rgba(0,0,0,.2); }
      @media (min-width:768px) { .mfn-modal { border-radius:14px; max-height:82vh; box-shadow:0 20px 60px rgba(0,0,0,.3); } }
      .mfn-modal--out { animation:mfnSlideDown .22s ease forwards; }

      .mfn-modal__header { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid var(--mfn-line); flex-shrink:0; }
      .mfn-modal__header h3 { font-family:'Playfair Display',serif; font-size:1.15rem; font-weight:700; margin:0; }
      .mfn-modal__count { color:var(--mfn-muted); font-weight:400; font-size:.95rem; }
      .mfn-modal__close { background:none; border:none; font-size:18px; cursor:pointer; color:var(--mfn-muted); padding:6px; line-height:1; border-radius:50%; transition:background .15s ease; }
      .mfn-modal__close:hover { background:var(--mfn-sand); }

      .mfn-modal__body { overflow-y:auto; padding:14px 20px; flex:1 1 auto; -webkit-overflow-scrolling:touch; }
      .mfn-comment-list { display:flex; flex-direction:column; }
      .mfn-comment { display:flex; gap:12px; padding:14px 0; border-bottom:1px solid var(--mfn-line); }
      .mfn-comment:last-child { border-bottom:none; }
      .mfn-comment__avatar { width:34px; height:34px; flex-shrink:0; background:var(--mfn-sand); border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Playfair Display',serif; font-weight:700; font-size:14px; color:var(--mfn-accent); }
      .mfn-comment__meta { display:flex; gap:8px; align-items:baseline; margin-bottom:4px; }
      .mfn-comment__name { font-family:'Barlow Condensed',sans-serif; font-size:13px; font-weight:700; }
      .mfn-comment__time { font-family:'Barlow Condensed',sans-serif; font-size:10px; color:#bbb; }
      .mfn-comment__text { font-size:13.5px; line-height:1.6; margin:0; word-break:break-word; }
      .mfn-comment-empty { color:#bbb; font-style:italic; font-size:14px; padding:20px 0; text-align:center; }

      .mfn-comment-form { border-top:1px solid var(--mfn-line); background:var(--mfn-sand); padding:16px 20px; flex-shrink:0; display:flex; flex-direction:column; gap:12px; }
      .mfn-comment-form__row { display:grid; grid-template-columns:1fr; gap:12px; }
      @media (min-width:480px) { .mfn-comment-form__row { grid-template-columns:1fr 1fr; } }
      .mfn-comment-form label { display:block; font-family:'Barlow Condensed',sans-serif; font-size:10px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:5px; color:var(--mfn-muted); }
      .mfn-comment-form input, .mfn-comment-form textarea { width:100%; padding:10px 12px; border:1px solid var(--mfn-line); background:#fff; font-size:14px; font-family:inherit; outline:none; box-sizing:border-box; border-radius:4px; }
      .mfn-comment-form input:focus, .mfn-comment-form textarea:focus { border-color:var(--mfn-accent); }
      .mfn-comment-form__submit { background:var(--mfn-ink); color:#fff; border:none; padding:13px; font-family:'Barlow Condensed',sans-serif; font-weight:800; font-size:12px; letter-spacing:2px; text-transform:uppercase; cursor:pointer; border-radius:4px; transition:background .15s ease; }
      .mfn-comment-form__submit:hover:not(:disabled) { background:var(--mfn-accent); }
      .mfn-comment-form__submit:disabled { cursor:not-allowed; opacity:.7; }
      .mfn-comment-msg { font-size:13px; margin:0; }
      .mfn-comment-msg.is-success { color:#166534; }
      .mfn-comment-msg.is-error { color:var(--mfn-accent); }

      @keyframes mfnFadeIn  { from{opacity:0} to{opacity:1} }
      @keyframes mfnFadeOut { from{opacity:1} to{opacity:0} }
      @keyframes mfnSlideUp   { from{ transform:translateY(40px); opacity:0 } to{ transform:translateY(0); opacity:1 } }
      @keyframes mfnSlideDown { to{ transform:translateY(40px); opacity:0 } }

      /* ================= floating bottom ad ================= */
      .mfn-floating-ad { position:fixed; left:50%; bottom:16px; z-index:900; background:#fff; border:1px solid var(--mfn-line); border-radius:10px; box-shadow:0 10px 30px rgba(0,0,0,.18); width:calc(100% - 32px); max-width:380px; overflow:hidden; }
      .mfn-floating-ad--in  { animation:mfnFloatIn .45s cubic-bezier(.2,.8,.2,1) forwards; }
      .mfn-floating-ad--out { animation:mfnFloatOut .4s cubic-bezier(.4,0,1,1) forwards; }
      @keyframes mfnFloatIn  { from{ transform:translateX(-50%) translateY(130%); opacity:0 } to{ transform:translateX(-50%) translateY(0); opacity:1 } }
      @keyframes mfnFloatOut { from{ transform:translateX(-50%) translateY(0); opacity:1 } to{ transform:translateX(-50%) translateY(130%); opacity:0 } }
      .mfn-floating-ad__label { position:absolute; top:6px; left:8px; background:rgba(13,13,13,.7); color:#fff; font-family:'Barlow Condensed',sans-serif; font-size:9px; letter-spacing:1.5px; text-transform:uppercase; padding:2px 6px; border-radius:3px; }
      .mfn-floating-ad__link { display:block; position:relative; text-decoration:none; }
      .mfn-floating-ad__link img { width:100%; height:auto; max-height:120px; object-fit:cover; display:block; }
      .mfn-floating-ad__close { position:absolute; top:6px; right:6px; z-index:2; width:24px; height:24px; border-radius:50%; border:none; background:rgba(13,13,13,.75); color:#fff; font-size:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; }

      @media (prefers-reduced-motion: reduce) {
        .mfn-modal, .mfn-modal-overlay, .mfn-floating-ad--in, .mfn-floating-ad--out, .mfn-modal--out, .mfn-modal-overlay--out { animation:none !important; }
      }
    `}</style>
  );
}

/* ================================================================== */
/*  Floating bottom advertisement — dynamic, auto-dismissing          */
/* ================================================================== */
function FloatingAd({ ad }) {
  const [phase, setPhase] = useState('hidden'); // hidden | in | out

  useEffect(() => {
    if (!ad) return undefined;
    const showTimer = setTimeout(() => setPhase('in'), 1500);
    const hideTimer = setTimeout(() => setPhase('out'), 1500 + 120000); // visible ~2 minutes
    const removeTimer = setTimeout(() => setPhase('hidden'), 1500 + 120000 + 450);
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); clearTimeout(removeTimer); };
  }, [ad]);

  const dismiss = useCallback(() => {
    setPhase('out');
    setTimeout(() => setPhase('hidden'), 400);
  }, []);

  if (!ad || phase === 'hidden') return null;

  const src = ad.image || ad.banner || ad.img || ad.image_url;
  const href = ad.link || ad.url || ad.target_url || '#';
  const label = ad.title || ad.name || 'Advertisement';

  return (
    <div className={`mfn-floating-ad ${phase === 'in' ? 'mfn-floating-ad--in' : 'mfn-floating-ad--out'}`} role="complementary" aria-label="Advertisement">
      <button className="mfn-floating-ad__close" onClick={dismiss} aria-label="Close advertisement">✕</button>
      <a className="mfn-floating-ad__link" href={href} target="_blank" rel="noopener noreferrer sponsored">
        <span className="mfn-floating-ad__label">Sponsored</span>
        {src && (
          <img
            src={imgUrl(src)}
            alt={label}
            loading="lazy"
            onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
          />
        )}
      </a>
    </div>
  );
}

/* ================================================================== */
/*  Comments modal — reads + posts comments without leaving the page  */
/* ================================================================== */
function CommentModal({ open, onClose, comments, form, setForm, onSubmit, submitting, commentMsg }) {
  const [closing, setClosing] = useState(false);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => { setClosing(false); onClose(); }, 220);
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = e => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, handleClose]);

  if (!open) return null;

  return (
    <div
      className={`mfn-modal-overlay ${closing ? 'mfn-modal-overlay--out' : ''}`}
      onClick={handleClose}
    >
      <div
        className={`mfn-modal ${closing ? 'mfn-modal--out' : ''}`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Story comments"
      >
        <div className="mfn-modal__header">
          <h3>Discussion <span className="mfn-modal__count">({comments.length})</span></h3>
          <button className="mfn-modal__close" onClick={handleClose} aria-label="Close comments">✕</button>
        </div>

        <div className="mfn-modal__body">
          {comments.length > 0 ? (
            <div className="mfn-comment-list">
              {comments.map(c => (
                <div key={c._id || c.id} className="mfn-comment">
                  <div className="mfn-comment__avatar">{(c.name || 'B').charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="mfn-comment__meta">
                      <span className="mfn-comment__name">{c.name}</span>
                      <span className="mfn-comment__time">{timeAgo(c.created_at || c.createdAt)}</span>
                    </div>
                    <p className="mfn-comment__text">{c.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mfn-comment-empty">Be the first to comment on this story.</p>
          )}
        </div>

        <form onSubmit={onSubmit} className="mfn-comment-form">
          <div className="mfn-comment-form__row">
            <div>
              <label>Name (blank = BANYA)</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your name…"
              />
            </div>
            <div>
              <label>Email (optional)</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="your@email.com"
              />
            </div>
          </div>
          <div>
            <label>Comment *</label>
            <textarea
              value={form.comment}
              onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
              rows={4}
              required
              placeholder="Share your thoughts…"
            />
          </div>
          <button type="submit" disabled={submitting} className="mfn-comment-form__submit">
            {submitting ? 'Submitting…' : 'Post Comment'}
          </button>
          {commentMsg && (
            <p className={`mfn-comment-msg ${commentMsg.startsWith('✅') ? 'is-success' : 'is-error'}`}>
              {commentMsg}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Main page                                                          */
/* ================================================================== */
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
  const [commentModalOpen, setCommentModalOpen] = useState(false);

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
        // only ever show ads that are explicitly active/enabled where that field exists
        const allAds = (aRes.data || []).filter(a => a.active !== false && a.enabled !== false && a.status !== 'inactive');
        setAds(allAds);
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

  // Ad placement: 3 above the article, 3 in the sidebar, 1 as the floating unit.
  // Gracefully degrades — fewer ads never breaks the layout, and sections
  // simply hide themselves when there is nothing to show (see CSS :empty rule).
  const topAds = ads.slice(0, 3);
  const sidebarAds = ads.slice(3, 6);
  const floatingAd = ads[6] || ads[0] || null;

  return (
    <PublicLayout>
      <div className="mfn-page">
        <StoryPageStyles />
        <div className="mfn-container">
          <div className="mfn-layout">

            {/* ── ARTICLE ──────────────────────────────────────── */}
            <article>
              {/* Top-of-content ad strip (3 slots) */}
              {topAds.length > 0 && (
                <div className="mfn-top-ads">
                  {topAds.map((ad, i) => {
                    const src = ad.image || ad.banner || ad.img || ad.image_url;
                    const href = ad.link || ad.url || ad.target_url || '#';
                    return (
                      <a
                        key={ad._id || ad.id || i}
                        className="mfn-ad-slot"
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                      >
                        {src && (
                          <img
                            src={imgUrl(src)}
                            alt={ad.title || 'Advertisement'}
                            loading="lazy"
                            onError={e => { e.target.onerror = null; e.target.parentElement.style.display = 'none'; }}
                          />
                        )}
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Breadcrumb */}
              <div className="mfn-breadcrumb">
                <Link to="/" style={{ color: '#bbb', textDecoration: 'none' }}>Home</Link>
                <span>›</span>
                <Link to={`/category/${story.category}`} style={{ color: '#c0392b', textDecoration: 'none' }}>{story.category}</Link>
              </div>

              <div style={{ marginBottom: 10 }}>
                <Link to={`/category/${story.category}`} style={{ background: '#c0392b', color: '#fff', padding: '4px 12px', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', textDecoration: 'none' }}>{story.category}</Link>
              </div>

              <h1 className="mfn-title">{story.title}</h1>

              <div className="mfn-meta">
                {authorAvatar && (
                  <img src={imgUrl(authorAvatar)} alt="" loading="lazy" onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
                    style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e8e4d8' }} />
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
                className="mfn-hero-img"
                src={imgUrl(story.image)}
                alt={story.title}
                loading="eager"
                onError={e => { e.target.onerror = null; e.target.src = '/placeholder.jpg'; }}
              />

              <div className="mfn-body" dangerouslySetInnerHTML={{ __html: story.description }} />

              {/* All tags */}
              {story.tags && (
                <div className="mfn-tags">
                  {story.tags.split(',').map(t => (
                    <Link key={t} to={`/search?q=${encodeURIComponent(t.trim())}`} className="mfn-tag">#{t.trim()}</Link>
                  ))}
                </div>
              )}

              {/* Reactions + Share */}
              <div className="mfn-actions">
                <button onClick={() => handleReact('likes')} className="mfn-react-btn">👍 {reactions.likes}</button>
                <button onClick={() => handleReact('dislikes')} className="mfn-react-btn">👎 {reactions.dislikes}</button>
                <div style={{ flex: 1 }} />
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer"
                  className="mfn-share-btn" style={{ background: '#1877f2', color: '#fff' }}>Share</a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(story.title)}`} target="_blank" rel="noopener noreferrer"
                  className="mfn-share-btn" style={{ background: '#0d0d0d', color: '#fff' }}>Tweet</a>
                <a href={`https://wa.me/?text=${encodeURIComponent(story.title + ' ' + window.location.href)}`} target="_blank" rel="noopener noreferrer"
                  className="mfn-share-btn" style={{ background: '#25d366', color: '#fff' }}>WhatsApp</a>
              </div>

              {/* Author box */}
              <div className="mfn-author-box">
                {authorAvatar && (
                  <img src={imgUrl(authorAvatar)} alt="" loading="lazy" onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
                    style={{ width: 58, height: 58, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #e8e4d8' }} />
                )}
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#c0392b', marginBottom: 4 }}>About the Author</div>
                  <Link to={`/author/${encodeURIComponent(story.author)}`} style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.05rem', fontWeight: 700, textDecoration: 'none', color: '#0d0d0d' }}>{story.author}</Link>
                  <p style={{ fontSize: 13, color: '#5a5a5a', fontStyle: 'italic', marginTop: 6, lineHeight: 1.6 }}>
                    {story.author_bio_full || story.author_bio || 'Staff writer at Mahoko Friday News, covering the stories that matter most to Rwanda\'s youth.'}
                  </p>
                </div>
              </div>

              {/* Related stories */}
              {related.length > 0 && (
                <section style={{ marginBottom: 30 }}>
                  <SectionLabel>Related Stories</SectionLabel>
                  <div className="mfn-related-grid">
                    {related.map(s => (
                      <Link key={s._id || s.id} to={`/story/${s._id || s.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <img src={imgUrl(s.image)} alt="" loading="lazy" onError={e => { e.target.onerror = null; e.target.src = '/placeholder.jpg'; }}
                          style={{ width: '100%', aspectRatio: '16/10', height: 'auto', objectFit: 'cover', marginBottom: 8, borderRadius: '6px' }} />
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, color: '#c0392b', fontWeight: 800, letterSpacing: 2, marginBottom: 4 }}>{s.category}</div>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '.88rem', fontWeight: 700, lineHeight: 1.3 }}>{(s.title || '').substring(0, 65)}</div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Comments — trigger card opens the modal; nothing about the
                  underlying comment system (state, API calls, validation) changed */}
              <section>
                <SectionLabel>Discussion ({comments.length})</SectionLabel>
                <div className="mfn-comments-trigger">
                  <div className="mfn-comments-trigger__text">
                    <h3>Join the conversation</h3>
                    <p>{comments.length > 0 ? `${comments.length} comment${comments.length === 1 ? '' : 's'} so far` : 'Be the first to comment'}</p>
                  </div>
                  <button className="mfn-comments-trigger__btn" onClick={() => setCommentModalOpen(true)}>
                    View Comments
                  </button>
                </div>
              </section>
            </article>

            {/* ── SIDEBAR ─────────────────────────────────────── */}
            <aside>
              <div style={{ position: 'sticky', top: 72 }}>
                <div className="mfn-sidebar-card">
                  <div className="mfn-sidebar-card__label">🔥 Most Read</div>
                  {popular.map((p, i) => <PopularItem key={p._id || p.id} story={p} rank={i + 1} />)}
                </div>
                <NewsletterWidget />
                {sidebarAds.length > 0 && (
                  <div className="mfn-sidebar-card">
                    <div className="mfn-sidebar-card__label">Sponsored</div>
                    <div className="mfn-sidebar-ads">
                      <AdBanner ads={sidebarAds} height={200} />
                    </div>
                  </div>
                )}
                <WhatsAppCTA />
              </div>
            </aside>
          </div>
        </div>

        <CommentModal
          open={commentModalOpen}
          onClose={() => setCommentModalOpen(false)}
          comments={comments}
          form={form}
          setForm={setForm}
          onSubmit={handleComment}
          submitting={submitting}
          commentMsg={commentMsg}
        />

        <FloatingAd ad={floatingAd} />
      </div>
    </PublicLayout>
  );
}
