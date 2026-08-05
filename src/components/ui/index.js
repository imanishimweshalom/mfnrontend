import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subscribeAPI } from '../../utils/api';

// Helper hook for mobile-first approach
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

export const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export const imgUrl = (path) => {
  if (!path) {
    return 'https://mahokofridaynewsbackend.onrender.com/uploads/placeholder.jpg';
  }

  if (path.startsWith('http')) {
    return path;
  }

  const cleanPath = path.replace(/^uploads\//, '');

  return `https://mahokofridaynewsbackend.onrender.com/uploads/${cleanPath}`;
};

// Fallback image to fix the 404 error
const FALLBACK_IMG = 'https://mahokofridaynewsbackend.onrender.com/uploads/placeholder.jpg';

/* ── STORY CARD (horizontal on desktop, vertical on mobile) ─────────────────────────────── */
export const StoryCard = ({ story, size = 'md' }) => {
  const isMobile = useIsMobile();
  const isLarge = size === 'lg';
  
  return (
    <Link
      to={`/story/${story._id || story.id}`}
      style={{
        display: 'flex', 
        flexDirection: isMobile || isLarge ? 'column' : 'row', // Mobile-first: column
        gap: 14, 
        padding: '14px 0', 
        borderTop: '2px solid #e8e4d8',
        textDecoration: 'none', 
        color: 'inherit', 
        transition: 'border-color .2s',
      }}
    >
      <img
        src={imgUrl(story.image)} alt="" loading="lazy"
        onError={e => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }}
        style={{ 
          width: isMobile || isLarge ? '100%' : 120, 
          height: isMobile ? 180 : (isLarge ? 200 : 80), 
          objectFit: 'cover', 
          flexShrink: 0 
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#c0392b', marginBottom: 4 }}>{story.category}</div>
        <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: isLarge ? '1.1rem' : '.9rem', fontWeight: 700, lineHeight: 1.3, marginBottom: 6 }}>{story.title}</div>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, color: '#bbb', display: 'flex', gap: 12 }}>
          <span>🕐 {timeAgo(story.created_at || story.createdAt)}</span>
          <span>👁 {Number(story.views || 0).toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
};

/* ── GRID CARD ────────────────────────────────────────────── */
export const GridCard = ({ story }) => {
  const isMobile = useIsMobile();
  
  return (
    <Link to={`/story/${story._id || story.id}`} style={{ display: 'flex', flexDirection: 'column', gap: 10, textDecoration: 'none', color: 'inherit', borderTop: '2px solid #e8e4d8', paddingTop: 14 }}>
      <div style={{ overflow: 'hidden', aspectRatio: isMobile ? '16/9' : '16/10' }}>
        <img 
          src={imgUrl(story.image)} 
          alt="" 
          loading="lazy" 
          onError={e => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s' }} 
        />
      </div>
      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#c0392b' }}>{story.category}</div>
      <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: '.92rem', fontWeight: 700, lineHeight: 1.25 }}>{story.title}</div>
      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, color: '#bbb', display: 'flex', gap: 10 }}>
        <span>🕐 {timeAgo(story.created_at || story.createdAt)}</span>
        <span>👁 {Number(story.views || 0).toLocaleString()}</span>
      </div>
    </Link>
  );
};

/* ── HERO CARD ────────────────────────────────────────────── */
export const HeroCard = ({ story }) => {
  const isMobile = useIsMobile();
  
  return (
    <Link to={`/story/${story._id || story.id}`} style={{ display: 'block', position: 'relative', overflow: 'hidden', background: '#000', minHeight: isMobile ? 350 : 500, textDecoration: 'none' }}>
      <img 
        src={imgUrl(story.image)} 
        alt="" 
        loading="eager" 
        onError={e => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }} 
        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .8, position: 'absolute', inset: 0, transition: 'transform .7s' }} 
      />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,.95))', padding: isMobile ? '40px 20px 20px' : '60px 28px 28px' }}>
        <div style={{ background: '#c0392b', display: 'inline-flex', alignItems: 'center', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', padding: '4px 12px', marginBottom: 12 }}>{story.category}</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.5rem,2.8vw,2.5rem)', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: 10 }}>{story.title}</h2>
        <p style={{ color: 'rgba(255,255,255,.72)', fontSize: 14, fontStyle: 'italic', lineHeight: 1.55, marginBottom: 14 }}>
          {(story.description || '').replace(/<[^>]+>/g, '').substring(0, 160)}…
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: 1, color: 'rgba(255,255,255,.5)' }}>
          <span>👤 {story.author}</span>
          <span>🕐 {timeAgo(story.created_at || story.createdAt)}</span>
          <span>👁 {Number(story.views || 0).toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
};

/* ── POPULAR ITEM ─────────────────────────────────────────── */
export const PopularItem = ({ story, rank }) => (
  <Link to={`/story/${story._id || story.id}`} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '11px 0', borderBottom: '1px solid #e8e4d8', textDecoration: 'none', color: 'inherit' }}>
    <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: '2.2rem', color: '#e8e4d8', lineHeight: 1, minWidth: 44, flexShrink: 0 }}>{rank}</div>
    <div>
      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#c0392b', marginBottom: 3 }}>{story.category}</div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '.9rem', fontWeight: 700, lineHeight: 1.3 }}>{(story.title || '').substring(0, 68)}</div>
      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, color: '#aaa', marginTop: 3 }}>
        👁 {Number(story.views || 0).toLocaleString()}
      </div>
    </div>
  </Link>
);

/* ── AD BANNER ───────────────────────────────────────────── */
export const AdBanner = ({ ads = [], height = 90 }) => {
  const isMobile = useIsMobile();
  const [cur, setCur] = useState(0);
  
  useEffect(() => {
    if (!ads.length) return;
    const t = setInterval(() => setCur(c => (c + 1) % ads.length), 10000);
    return () => clearInterval(t);
  }, [ads.length]);
  
  if (!ads.length) return null;
  const ad = ads[cur];
  const currentHeight = isMobile ? 60 : height; // Shorter height on mobile
  
  return (
    <div style={{ position: 'relative', background: '#f0ece0', border: '1px solid #e8e4d8', overflow: 'hidden', height: currentHeight, marginBottom: 24 }}>
      <span style={{ position: 'absolute', top: 4, right: 8, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, letterSpacing: 2, color: '#bbb', textTransform: 'uppercase', zIndex: 1 }}>Advertisement</span>
      {ad.type === 'video'
        ? <video autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}><source src={imgUrl(ad.file)} /></video>
        : <a href={ad.link || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'block', height: '100%' }}>
            <img 
              src={imgUrl(ad.file)} 
              alt="" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              onError={e => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }} 
            />
          </a>
      }
    </div>
  );
};

/* ── SECTION LABEL ───────────────────────────────────────── */
export const SectionLabel = ({ children, color = '#c0392b' }) => (
  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
    {children}
    <span style={{ flex: 1, height: 1, background: '#e8e4d8' }}></span>
  </div>
);

/* ── NEWSLETTER WIDGET ───────────────────────────────────── */
export const NewsletterWidget = () => {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await subscribeAPI.subscribe({ email });
      setMsg(res.data.message);
      if (res.data.status === 'success') setEmail('');
    } catch { setMsg('Error. Try again.'); }
  };
  return (
    <div style={{ background: '#c0392b', color: '#fff', padding: '24px 20px', marginBottom: 22, textAlign: 'center' }}>
      <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.25rem', marginBottom: 5 }}>Stay Informed</h3>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', fontStyle: 'italic', marginBottom: 14 }}>Daily stories to your inbox.</p>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required
          style={{ border: 'none', borderBottom: '2px solid rgba(255,255,255,.2)', background: 'transparent', color: '#fff', padding: '8px 4px', outline: 'none', textAlign: 'center', fontFamily: "'Source Serif 4',serif", fontSize: 13 }} />
        <button type="submit" style={{ background: '#fff', color: '#c0392b', border: 'none', padding: 10, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer' }}>Subscribe →</button>
        {msg && <span style={{ fontSize: 11, color: '#a8e6cf' }}>{msg}</span>}
      </form>
    </div>
  );
};

/* ── WHATSAPP CTA ─────────────────────────────────────────── */
export const WhatsAppCTA = () => (
  <div style={{ background: '#25d366', padding: '18px 20px', textAlign: 'center', marginBottom: 22 }}>
    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,.7)', marginBottom: 8 }}>Join our community</div>
    <a href="https://chat.whatsapp.com/H40lstF5ft180ah97R1L9E" target="_blank" rel="noopener noreferrer"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#25d366', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', padding: '10px 20px' }}>
      💬 WhatsApp Group
    </a>
  </div>
);

/* ── TAG CLOUD ────────────────────────────────────────────── */
export const TagCloud = ({ tags = [] }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
    {tags.map(tag => (
      <Link key={tag} to={`/search?q=${encodeURIComponent(tag)}`}
        style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', background: '#f0ece0', padding: '5px 10px', border: '1px solid #e8e4d8', color: '#0d0d0d', textDecoration: 'none', transition: 'all .2s' }}>
        {tag}
      </Link>
    ))}
  </div>
);

/* ── SPINNER ──────────────────────────────────────────────── */
export const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0' }}>
    <div style={{ width: 32, height: 32, border: '3px solid #e8e4d8', borderTop: '3px solid #c0392b', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
  </div>
);

/* ── EMPTY STATE ──────────────────────────────────────────── */
export const EmptyState = ({ icon = '📰', title = 'Nothing here yet', message = 'Check back soon.', linkTo = '/', linkText = '← Back Home' }) => (
  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
    <div style={{ fontSize: '4rem', marginBottom: 16, opacity: .3 }}>{icon}</div>
    <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.4rem', fontWeight: 900, marginBottom: 8 }}>{title}</h3>
    <p style={{ color: '#5a5a5a', fontStyle: 'italic', marginBottom: 24 }}>{message}</p>
    <Link to={linkTo} style={{ display: 'inline-block', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', background: '#0d0d0d', color: '#faf8f3', padding: '12px 28px', textDecoration: 'none' }}>{linkText}</Link>
  </div>
);

/* ── PAGINATION ───────────────────────────────────────────── */
export const Pagination = ({ page, totalPages, onChange }) => {
  const isMobile = useIsMobile();
  
  if (totalPages <= 1) return null;
  const pages = [];
  // Show fewer pages on mobile
  const maxPages = isMobile ? 4 : 8;
  for (let i = 1; i <= Math.min(totalPages, maxPages); i++) pages.push(i);
  
  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 30, flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start' }}>
      {page > 1 && (
        <button onClick={() => onChange(page - 1)} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, padding: '8px 14px', border: '1.5px solid #e8e4d8', background: '#fff', cursor: 'pointer' }}>← Prev</button>
      )}
      {pages.map(p => (
        <button key={p} onClick={() => onChange(p)} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, padding: '8px 14px', border: '1.5px solid #e8e4d8', background: p === page ? '#c0392b' : '#fff', color: p === page ? '#fff' : '#0d0d0d', cursor: 'pointer' }}>{p}</button>
      ))}
      {page < totalPages && (
        <button onClick={() => onChange(page + 1)} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, padding: '8px 14px', border: '1.5px solid #e8e4d8', background: '#fff', cursor: 'pointer' }}>Next →</button>
      )}
    </div>
  );
};
