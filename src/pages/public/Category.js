import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { GridCard, PopularItem, AdBanner, SectionLabel, NewsletterWidget, WhatsAppCTA, Spinner, EmptyState, Pagination, imgUrl } from '../../components/ui';
import { storiesAPI, adsAPI } from '../../utils/api';

const CAT_COLORS = {
  Sport: '#0d3b6e', Business: '#0a6847', Technology: '#0c4a6e',
  Health: '#b91c1c', Culture: '#7c2d12', Environment: '#065f46',
  'Le Phare': '#92400e', Music: '#be185d', Transport: '#374151',
};

export default function CategoryPage() {
  const { category } = useParams();
  const [stories, setStories] = useState([]);
  const [popular, setPopular] = useState([]);
  const [ads, setAds] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const accent = CAT_COLORS[category] || '#c0392b';

  useEffect(() => { setPage(1); }, [category]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [sRes, pRes, aRes] = await Promise.all([
          storiesAPI.getAll({ category, page, limit: 12, status: 'published' }),
          storiesAPI.getPopular({ category, limit: 5 }),
          adsAPI.getAll(),
        ]);
        setStories(sRes.data.stories || []);
        setTotalPages(sRes.data.pages || 1);
        setTotal(sRes.data.total || 0);
        setPopular(pRes.data || []);
        setAds(aRes.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [category, page]);

  return (
    <PublicLayout>
      {/* Category header */}
      <div style={{ background: accent, padding: '22px 0 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -20, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 140, fontWeight: 900, color: 'rgba(255,255,255,.04)', letterSpacing: -6, lineHeight: 1, pointerEvents: 'none', textTransform: 'uppercase', userSelect: 'none' }}>
          {(category || '').substring(0, 8)}
        </div>
        <div style={{ maxWidth: 1260, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <span style={{ color: 'rgba(255,255,255,.8)' }}>{category}</span>
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(1.6rem,4vw,3rem)', letterSpacing: 4, textTransform: 'uppercase', color: '#fff', marginBottom: 16 }}>
            {category} <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: '1rem', fontWeight: 400, opacity: .5 }}>({total} stories)</span>
          </h1>
          <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,.1)', marginTop: 8 }}>
            {[category, 'All Stories'].map(f => (
              <span key={f} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: f === category ? '#fff' : 'rgba(255,255,255,.55)', padding: '12px 18px', borderRight: '1px solid rgba(255,255,255,.06)', background: f === category ? 'rgba(255,255,255,.1)' : 'transparent', cursor: 'pointer' }}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1260, margin: '0 auto', padding: '32px 20px 40px' }}>
        <AdBanner ads={ads} height={90} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 36, alignItems: 'start' }}>

          <div>
            {loading ? <Spinner /> : stories.length === 0 ? (
              <EmptyState icon="📰" title={`No ${category} stories yet`} message="Check back soon for the latest updates." />
            ) : (
              <>
                {/* Featured first story */}
                <Link to={`/story/${stories[0]._id || stories[0].id}`}
                  style={{ display: 'block', position: 'relative', overflow: 'hidden', background: '#000', height: 360, marginBottom: 28, textDecoration: 'none' }}>
                  <img src={imgUrl(stories[0].image)} alt="" loading="eager" onError={e => { e.target.onerror = null; e.target.src = '/placeholder.jpg'; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .75 }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,.95))', padding: '50px 24px 24px' }}>
                    <div style={{ background: accent, display: 'inline-block', padding: '3px 10px', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 10, letterSpacing: 2, color: '#fff', marginBottom: 10 }}>{stories[0].category}</div>
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.3rem,2.5vw,2rem)', fontWeight: 900, color: '#fff', lineHeight: 1.15 }}>{stories[0].title}</h2>
                  </div>
                </Link>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 20, marginBottom: 28 }}>
                  {stories.slice(1).map(s => <GridCard key={s._id || s.id} story={s} />)}
                </div>

                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </>
            )}
          </div>

          <aside>
            <div style={{ position: 'sticky', top: 72 }}>
              <div style={{ background: '#fff', border: '1px solid #e8e4d8', padding: 20, marginBottom: 22, borderTop: `3px solid ${accent}` }}>
                <SectionLabel>🔥 Most Read</SectionLabel>
                {popular.map((p, i) => <PopularItem key={p._id || p.id} story={p} rank={i + 1} />)}
                {popular.length === 0 && <p style={{ color: '#bbb', fontStyle: 'italic', fontSize: 13 }}>No popular stories yet.</p>}
              </div>
              <NewsletterWidget />
              <WhatsAppCTA />
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
