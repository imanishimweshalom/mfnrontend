import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { breakingAPI, subscribeAPI } from '../../utils/api';

const CATEGORIES = [
  { label: 'Home', path: '/' },
  { label: 'Business', path: '/category/Business' },
  { label: 'Sport', path: '/category/Sport' },
  { label: 'Technology', path: '/category/Technology' },
  { label: 'Health', path: '/category/Health' },
  { label: 'Culture', path: '/category/Culture' },
   { label: 'Entertainment', path: '/category/Entertainment' },
    { label: 'Education', path: '/category/Education' },
  { label: 'Video', path: '/videos', icon: '▶' },
  { label: 'More', sub: [
    { label: 'Le Phare', path: '/category/Le Phare' },
    { label: 'Environment', path: '/category/Environment' },
    { label: 'Music', path: '/category/Music' },
    { label: 'Transport', path: '/category/Transport' },
     { label: 'job links', path: '/category/job-links' },
    
  ]},
];

const SOCIALS = [
  { icon: 'f', href: 'https://www.facebook.com/profile.php?id=61579631955116', label: 'Facebook' },
  { icon: 'X', href: 'https://x.com/ZigaMichel28110', label: 'X' },
  { icon: '📷', href: 'https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite&utm_medium=copy_link&utm_content=xyzx1jj', label: 'Instagram' },
  { icon: '♪', href: 'https://www.tiktok.com/@mahoko.friday.news', label: 'TikTok' },
  { icon: '▶', href: 'https://youtube.com/@mahokofridaynews-n3p', label: 'YouTube' },
  { icon: 'W', href: 'https://chat.whatsapp.com/H40lstF5ft180ah97R1L9E', label: 'WhatsApp' },
];

export default function PublicLayout({ children }) {
  const [breaking, setBreaking] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState('');
  const [subMsg, setSubMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    breakingAPI.get().then(r => setBreaking(r.data)).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQ)}`);
      setMobileOpen(false); // Close mobile menu on search
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    try {
      const res = await subscribeAPI.subscribe({ email });
      setSubMsg(res.data.message);
      setEmail('');
    } catch { setSubMsg('Something went wrong. Please try again.'); }
  };

  return (
    <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", background: '#faf8f3', color: '#0d0d0d', minHeight: '100vh' }}>
      <style>{`
        :root { --red:#c0392b; --ink:#0d0d0d; --gold:#b8860b; --light:#e8e4d8; --mid:#5a5a5a; --white:#fff; --paper:#faf8f3; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { color: inherit; text-decoration: none; }
        a:hover { color: var(--red); }
        
        .ticker { display: flex; white-space: nowrap; gap: 60px; animation: scroll 35s linear infinite; }
        .ticker:hover { animation-play-state: paused; }
        @keyframes scroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes pulse { 0%, 100% {opacity: 1} 50% {opacity: .4} }
        
        .dropdown-menu { display: none; position: absolute; top: 100%; left: 0; background: #111; min-width: 200px; border-top: 3px solid var(--red); z-index: 1000; box-shadow: 0 8px 30px rgba(0,0,0,.4); }
        .nav-item:hover .dropdown-menu { display: block; }
        .dropdown-menu a { display: block; padding: 10px 18px; color: #aaa; font-size: 12px; font-family: 'Barlow Condensed', sans-serif; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,.06); }
        .dropdown-menu a:hover { color: #fff; background: rgba(255,255,255,.06); }
        
        /* Responsive Layout Enhancements */
        .masthead-grid { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 20px; }
        .masthead-links { display: flex; gap: 10px; }
        .masthead-search { display: flex; justify-content: flex-end; }
        .top-bar-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
        .top-bar-socials { display: flex; gap: 16px; align-items: center; }
        
        @media(max-width: 900px) {
          .nav-desktop { display: none !important; }
          .hamburger { display: block !important; }
          .masthead-grid { grid-template-columns: 1fr !important; text-align: center; }
          .masthead-links { justify-content: center; margin-bottom: 12px; }
          .masthead-search { justify-content: center; margin-top: 12px; width: 100%; }
          .masthead-search input { width: 100% !important; }
          .top-bar-inner { flex-direction: column; gap: 6px; text-align: center; }
          .top-bar-socials { justify-content: center; width: 100%; }
        }
      `}</style>

      {/* Top Bar */}
      <div style={{ background: '#0d0d0d', color: '#ccc', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, padding: '8px 0' }}>
        <div className="top-bar-inner" style={{ maxWidth: 1260, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span>📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span style={{ color: '#888' }}>☀ Kigali · 24°C</span>
          </div>
          <div className="top-bar-socials">
            {SOCIALS.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{ color: '#888', fontSize: 13 }} title={s.label}>{s.icon}</a>
            ))}
            <Link to="/admin/login" style={{ color: '#888', letterSpacing: 1, textTransform: 'uppercase', fontSize: 11 }}>Sign In</Link>
          </div>
        </div>
      </div>

      {/* Breaking Ticker */}
      {breaking.length > 0 && (
        <div style={{ background: '#c0392b', color: '#fff', display: 'flex', overflow: 'hidden', height: 38 }}>
          <div style={{ background: '#0d0d0d', padding: '0 18px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, background: '#c0392b', borderRadius: '50%', animation: 'pulse 1s infinite' }}></span>
            Breaking
          </div>
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
            <div className="ticker">
              {[...breaking, ...breaking].map((b, i) => (
                <span key={i} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 600 }}>◆ {b.title}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Masthead */}
      <div style={{ background: '#fff', borderBottom: '3px double #0d0d0d', padding: '20px 0 16px' }}>
        <div className="masthead-grid" style={{ maxWidth: 1260, margin: '0 auto', padding: '0 20px' }}>
          <div className="masthead-links">
            <Link to="/archive" style={{ background: '#0d0d0d', color: '#fff', padding: '5px 12px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: 1 }}>Archive</Link>
            <Link to="/epaper" style={{ background: '#0d0d0d', color: '#fff', padding: '5px 12px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: 1 }}>E-Paper</Link>
          </div>
          <Link to="/" style={{ textAlign: 'center' }}>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.6rem,4vw,2.8rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: '#0d0d0d' }}>
              <span style={{ color: '#c0392b' }}>M</span>ahoko <span style={{ color: '#c0392b' }}>F</span>riday <span style={{ color: '#c0392b' }}>N</span>ews
            </h1>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: '#5a5a5a', marginTop: 4 }}>Latest News · Truth & Independence</p>
          </Link>
          <form onSubmit={handleSearch} className="masthead-search">
            <div style={{ display: 'flex', border: '1.5px solid #0d0d0d', width: '100%', maxWidth: 220 }}>
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search stories…" style={{ border: 'none', outline: 'none', padding: '7px 12px', width: '100%', fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 13, background: '#faf8f3' }} />
              <button type="submit" style={{ background: '#0d0d0d', color: '#fff', border: 'none', padding: '7px 14px', cursor: 'pointer' }}>🔍</button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Nav */}
      <nav style={{ background: '#0d0d0d', position: 'sticky', top: 0, zIndex: 999, boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,.3)' : 'none' }}>
        <div style={{ maxWidth: 1260, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <ul className="nav-desktop" style={{ display: 'flex', listStyle: 'none', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <li key={cat.label} className="nav-item" style={{ position: 'relative' }}>
                {cat.path ? (
                  <Link to={cat.path} style={{ display: 'block', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', color: '#ccc', padding: '14px 16px', transition: 'color .2s,background .2s' }}
                    onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,.08)'}
                    onMouseLeave={e => e.target.style.background = 'transparent'}>
                    {cat.icon && <span style={{ color: '#c0392b', marginRight: 4 }}>{cat.icon}</span>}{cat.label}
                  </Link>
                ) : (
                  <>
                    <span style={{ display: 'block', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', color: '#ccc', padding: '14px 16px', cursor: 'pointer' }}>
                      {cat.label} ▾
                    </span>
                    <div className="dropdown-menu">
                      {cat.sub?.map(s => <Link key={s.label} to={s.path}>{s.label}</Link>)}
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: 8, padding: '0 10px' }}>
            <Link to="/subscribe" style={{ background: '#c0392b', color: '#fff', border: 'none', padding: '6px 14px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}>Subscribe</Link>
          </div>
          <button className="hamburger" style={{ display: 'none', background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer', padding: '14px' }} onClick={() => setMobileOpen(true)}>☰</button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, background: '#111', zIndex: 9999, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,.1)' }}>
            <span style={{ fontFamily: "'Playfair Display', serif", color: '#fff', fontSize: '1.2rem' }}>Mahoko News</span>
            <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }}>✕</button>
          </div>
          <form onSubmit={handleSearch} style={{ display: 'flex', border: '1px solid rgba(255,255,255,.2)', marginBottom: 20 }}>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search…" style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', padding: '10px 14px', outline: 'none', fontSize: 15 }} />
            <button type="submit" style={{ background: '#c0392b', border: 'none', color: '#fff', padding: '0 16px', cursor: 'pointer', fontSize: 15 }}>🔍</button>
          </form>
          {CATEGORIES.map(cat => cat.path ? (
            <Link key={cat.label} to={cat.path} onClick={() => setMobileOpen(false)} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#ccc', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'block' }}>{cat.label}</Link>
          ) : (
            <div key={cat.label} style={{ borderBottom: '1px solid rgba(255,255,255,.06)', paddingBottom: 8 }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#888', padding: '14px 0', display: 'block' }}>{cat.label}</span>
              {cat.sub?.map(s => <Link key={s.label} to={s.path} onClick={() => setMobileOpen(false)} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: '#666', padding: '10px 16px', display: 'block' }}>{s.label}</Link>)}
            </div>
          ))}
          <Link to="/subscribe" onClick={() => setMobileOpen(false)} style={{ marginTop: 20, background: '#c0392b', color: '#fff', textAlign: 'center', padding: '14px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase' }}>Subscribe Now</Link>
        </div>
      )}

      {/* Page Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer style={{ background: '#0d0d0d', color: '#aaa', padding: '50px 0 0', marginTop: 10 }}>
        <div style={{ maxWidth: 1260, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 40, marginBottom: 40 }}>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: 8 }}>
                <span style={{ color: '#c0392b' }}>M</span>ahoko <span style={{ color: '#c0392b' }}>F</span>riday <span style={{ color: '#c0392b' }}>N</span>ews
              </h2>
              <p style={{ fontSize: 13, fontStyle: 'italic', lineHeight: 1.6, marginBottom: 16 }}>Reliable news, the truth about events in Rwanda and around the world. Making Youth's Voices Heard.</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {SOCIALS.map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#aaa', transition: 'all .2s' }} title={s.label}>{s.icon}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', borderBottom: '1px solid rgba(255,255,255,.1)', paddingBottom: 10, marginBottom: 16 }}>Categories</h4>
              <ul style={{ listStyle: 'none' }}>
                {['Business','Sport','Technology','Education','Health','Culture','Environment'].map(c => (
                  <li key={c} style={{ padding: '5px 0' }}><Link to={`/category/${c}`} style={{ fontSize: 13, color: '#888', fontStyle: 'italic' }}>→ {c}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', borderBottom: '1px solid rgba(255,255,255,.1)', paddingBottom: 10, marginBottom: 16 }}>Services</h4>
              <ul style={{ listStyle: 'none' }}>
                {[['About Us','/about'],['Contact','/contact'],['E-Paper','/epaper'],['Archive','/archive']].map(([l,p]) => (
                  <li key={l} style={{ padding: '5px 0' }}><Link to={p} style={{ fontSize: 13, color: '#888', fontStyle: 'italic' }}>→ {l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', borderBottom: '1px solid rgba(255,255,255,.1)', paddingBottom: 10, marginBottom: 16 }}>Newsletter</h4>
              <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#fff', padding: '8px 12px', outline: 'none', fontFamily: "'Source Serif 4', serif", fontSize: 13 }} />
                <button type="submit" style={{ background: '#c0392b', color: '#fff', border: 'none', padding: 10, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer' }}>Subscribe</button>
                {subMsg && <span style={{ fontSize: 11, color: '#a8e6cf' }}>{subMsg}</span>}
              </form>
              <div style={{ marginTop: 16, fontSize: 13, color: '#888', lineHeight: 1.6 }}>
                <div>📧 mfnyouthvoices@gmail.com</div>
                <div>📞 +250 787426258</div>
                <div>📍 Kigali, Rwanda</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ background: '#080808', color: '#555', padding: '16px 0', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: '.5px' }}>
          <div style={{ maxWidth: 1260, margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, textAlign: 'center' }}>
            <span>© {new Date().getFullYear()} Mahoko Friday News. Developed by <span style={{ color: '#c0392b' }}>Gerard</span>.</span>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
              
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 
