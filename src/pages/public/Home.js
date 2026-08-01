import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { HeroCard, GridCard, StoryCard, PopularItem, AdBanner, SectionLabel, NewsletterWidget, WhatsAppCTA, TagCloud, Spinner, EmptyState, imgUrl, timeAgo } from '../../components/ui';
import { storiesAPI, adsAPI } from '../../utils/api';

export default function Home() {
  const [featured, setFeatured] = useState(null);
  const [recent, setRecent] = useState([]);
  const [popular, setPopular] = useState([]);
  const [byCategory, setByCategory] = useState({});
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [storiesRes, popRes, adsRes] = await Promise.all([
          storiesAPI.getAll({ limit: 20, status: 'published' }),
          storiesAPI.getPopular({ limit: 5 }),
          adsAPI.getAll(),
        ]);
        const all = storiesRes.data.stories || [];
        setFeatured(all[0] || null);
        setRecent(all.slice(1));
        setPopular(popRes.data || []);
        setAds(adsRes.data || []);

        const cats = ['Business', 'Sport', 'Technology', 'Health', 'Culture'];
        const catData = {};
        await Promise.all(cats.map(async cat => {
          try {
            const res = await storiesAPI.getAll({ category: cat, limit: 4, status: 'published' });
            catData[cat] = res.data.stories || [];
          } catch { catData[cat] = []; }
        }));
        setByCategory(catData);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <PublicLayout><Spinner /></PublicLayout>;
  if (!featured && recent.length === 0) return <PublicLayout><EmptyState icon="📰" title="No stories yet" message="Check back soon for the latest news." /></PublicLayout>;

  const sidebarStories = recent.slice(0, 2);
  const gridStories   = recent.slice(2, 6);
  const hotStories    = recent.slice(6, 10);

  return (
    <PublicLayout>
      <div style={{ maxWidth: 1260, margin: '0 auto', padding: '28px 20px 40px' }}>

        {/* ── HERO ZONE ─────────────────────────────────────── */}
        {featured && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 2, background: '#e8e4d8', marginBottom: 2 }}>
            <HeroCard story={featured} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {sidebarStories.map(s => (
                <Link key={s._id || s.id} to={`/story/${s._id || s.id}`}
                  style={{ position: 'relative', overflow: 'hidden', background: '#0d0d0d', flex: 1, minHeight: 120, display: 'flex', alignItems: 'flex-end', textDecoration: 'none' }}>
                  <img src={imgUrl(s.image)} alt="" loading="lazy" onError={e => { e.target.onerror = null; e.target.src = '/placeholder.jpg'; }}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .65 }} />
                  <div style={{ position: 'relative', padding: '10px 14px', background: 'linear-gradient(transparent,rgba(0,0,0,.85))', width: '100%' }}>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#e8b84b', marginBottom: 3 }}>{s.category}</div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '.82rem', fontWeight: 700, color: '#fff', lineHeight: 1.25 }}>{(s.title || '').substring(0, 65)}</div>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, color: 'rgba(255,255,255,.4)', marginTop: 3 }}>{timeAgo(s.created_at || s.createdAt)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <AdBanner ads={ads.slice(0, 3)} height={90} />

        {/* ── MAIN CONTENT + SIDEBAR ────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 36, alignItems: 'start' }}>

          {/* Main column */}
          <div>
            <SectionLabel>Latest News</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 20, marginBottom: 28 }}>
              {gridStories.map(s => <GridCard key={s._id || s.id} story={s} />)}
            </div>

            {/* Category sections */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 28, marginBottom: 28 }}>
              {['Business', 'Sport', 'Technology'].map(cat => (
                <div key={cat}>
                  <SectionLabel>
                    <Link to={`/category/${cat}`} style={{ color: '#c0392b', textDecoration: 'none' }}>{cat}</Link>
                  </SectionLabel>
                  {(byCategory[cat] || []).slice(0, 3).map(s => <StoryCard key={s._id || s.id} story={s} />)}
                  <Link to={`/category/${cat}`} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#c0392b', textDecoration: 'none' }}>
                    All {cat} →
                  </Link>
                </div>
              ))}
            </div>

            <AdBanner ads={ads.slice(3)} height={90} />

            {/* Hot stories list */}
            <SectionLabel>More Stories</SectionLabel>
            {hotStories.map(s => (
              <Link key={s._id || s.id} to={`/story/${s._id || s.id}`}
                style={{ display: 'flex', gap: 20, padding: '20px 0', borderBottom: '1px solid #e8e4d8', textDecoration: 'none', color: 'inherit' }}>
                <img src={imgUrl(s.image)} alt="" loading="lazy" onError={e => { e.target.onerror = null; e.target.src = '/placeholder.jpg'; }}
                  style={{ width: 160, height: 110, objectFit: 'cover', flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#c0392b', marginBottom: 6 }}>{s.category}</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', lineHeight: 1.3, marginBottom: 6 }}>{(s.title || '').substring(0, 90)}</div>
                  <p style={{ fontSize: 13, color: '#5a5a5a', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 8 }}>
                    {(s.description || '').replace(/<[^>]+>/g, '').substring(0, 110)}
                  </p>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, color: '#aaa', display: 'flex', gap: 12 }}>
                    <span>👤 {s.author}</span>
                    <span>🕐 {timeAgo(s.created_at || s.createdAt)}</span>
                    <span>👁 {Number(s.views || 0).toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))}

            {/* Health & Culture */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 28, marginTop: 28 }}>
              {['Health', 'Culture'].map(cat => (
                <div key={cat}>
                  <SectionLabel><Link to={`/category/${cat}`} style={{ color: '#c0392b', textDecoration: 'none' }}>{cat}</Link></SectionLabel>
                  {(byCategory[cat] || []).slice(0, 3).map(s => <StoryCard key={s._id || s.id} story={s} />)}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside>
            <div style={{ position: 'sticky', top: 72 }}>
              <div style={{ background: '#fff', border: '1px solid #e8e4d8', padding: 20, marginBottom: 22, borderTop: '3px solid #c0392b' }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase', borderBottom: '3px solid #c0392b', paddingBottom: 10, marginBottom: 16 }}>🔥 Most Read</div>
                {popular.map((p, i) => <PopularItem key={p._id || p.id} story={p} rank={i + 1} />)}
              </div>
              <NewsletterWidget />
              <div style={{ background: '#fff', border: '1px solid #e8e4d8', padding: 20, marginBottom: 22 }}>
                <SectionLabel>Environment</SectionLabel>
                {(byCategory['Environment'] || []).slice(0, 3).map(s => <StoryCard key={s._id || s.id} story={s} />)}
              </div>
              <WhatsAppCTA />
              <div style={{ background: '#fff', border: '1px solid #e8e4d8', padding: 20 }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase', borderBottom: '3px solid #0d0d0d', paddingBottom: 10, marginBottom: 16 }}>🏷 Topics</div>
                <TagCloud tags={['Rwanda', 'Kigali', 'Sport', 'Business', 'Technology', 'Health', 'Culture', 'Africa', 'Education', 'EAC', 'BNR', 'RSE']} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
