import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { analyticsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ label, value, icon, color = '#1a472a', sub }) => (
  <div style={{ background: '#fff', padding: 24, borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,.03)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontWeight: 700, color: '#64748b', fontSize: 12, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
        <div style={{ fontWeight: 800, fontSize: '2.2rem', color: '#0f172a', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>{sub}</div>}
      </div>
      <div style={{ width: 48, height: 48, background: `${color}15`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{icon}</div>
    </div>
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    analyticsAPI.getOverview().then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      {/* ── Mobile-First Responsive CSS Additions ── */}
      <style>{`
        .admin-dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 36px; gap: 16px; flex-wrap: wrap; }
        .admin-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 32px; }
        .admin-main-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
        .admin-quick-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
        
        @media (max-width: 1024px) {
          /* Tablet Layout */
          .admin-main-grid { grid-template-columns: 1fr !important; }
        }
        
        @media (max-width: 768px) {
          /* Mobile Layout */
          .admin-dash-header { margin-bottom: 24px; }
          .admin-dash-header h1 { font-size: 1.4rem !important; }
          .admin-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
          .admin-stats-grid > div { padding: 16px !important; }
          .admin-stats-grid > div > div > div:last-child { width: 36px !important; height: 36px !important; font-size: 18px !important; }
          
          .admin-main-grid > div { padding: 20px !important; }
          .admin-quick-actions { grid-template-columns: repeat(3, 1fr) !important; }
          .admin-quick-actions > a { padding: 12px 8px !important; font-size: 12px !important; }
        }
        
        @media (max-width: 480px) {
          /* Small Mobile Layout */
          .admin-stats-grid { grid-template-columns: 1fr !important; }
          .admin-quick-actions { grid-template-columns: repeat(2, 1fr) !important; }
          .admin-table-wrap { overflow-x: auto; }
          .admin-table-wrap table { min-width: 500px; }
        }
      `}</style>

      <div className="admin-dash-header">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.03em', margin: 0, color: '#0f172a' }}>Welcome back, {user?.username?.split(' ')[0]} 👋</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Link to="/admin/stories/new" style={{ background: '#1a472a', color: '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, height: 'fit-content' }}>
          ✏️ New Story
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTop: '3px solid #1a472a', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="admin-stats-grid">
            <StatCard label="Total Stories" value={data?.stories?.toLocaleString() || 0} icon="📰" color="#1a472a" sub="Published articles" />
            <StatCard label="Global Views" value={Number(data?.views || 0).toLocaleString()} icon="👁" color="#0369a1" sub="All time reads" />
            <StatCard label="Pending Review" value={data?.pendingComments || 0} icon="💬" color="#c5a059" sub="Comments to moderate" />
            <StatCard label="Subscribers" value={Number(data?.subscribers || 0).toLocaleString()} icon="📧" color="#be185d" sub="Active newsletter" />
          </div>

          <div className="admin-main-grid">
            {/* Trending */}
            <div style={{ background: '#fff', padding: 28, borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>🔥 Trending Stories</h3>
                <Link to="/admin/stories" style={{ fontSize: 13, color: '#1a472a', fontWeight: 600 }}>View all →</Link>
              </div>
              <div className="admin-table-wrap" style={{ width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    <tr>
                      {['Title','Category','Views','Action'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 12px', background: '#f8fafc', color: '#64748b', fontSize: 11, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '.05em', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.trending || []).map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 12px', fontSize: 14, fontWeight: 600, maxWidth: 260 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                        </td>
                        <td style={{ padding: '14px 12px' }}>
                          <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>{s.category}</span>
                        </td>
                        <td style={{ padding: '14px 12px', fontSize: 14, fontWeight: 700, color: '#0369a1' }}>{Number(s.views).toLocaleString()}</td>
                        <td style={{ padding: '14px 12px' }}>
                          <Link to={`/admin/stories/edit/${s.id}`} style={{ fontSize: 12, color: '#1a472a', fontWeight: 600, whiteSpace: 'nowrap' }}>Edit</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category stats */}
            <div style={{ background: '#fff', padding: 28, borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,.03)' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem', margin: '0 0 20px' }}>📊 By Category</h3>
              {(data?.categoryStats || []).slice(0, 7).map(c => {
                const maxViews = Math.max(...(data?.categoryStats || []).map(x => x.views || 0));
                const pct = maxViews ? Math.round((c.views / maxViews) * 100) : 0;
                return (
                  <div key={c.category} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{c.category}</span>
                      <span style={{ fontSize: 12, color: '#94a3b8', textAlign: 'right' }}>{c.count} stories · {Number(c.views||0).toLocaleString()} views</span>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                      <div style={{ background: '#1a472a', height: '100%', width: `${pct}%`, borderRadius: 4, transition: 'width .6s ease' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ background: '#fff', padding: 28, borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,.03)', marginTop: 24 }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', margin: '0 0 20px' }}>⚡ Quick Actions</h3>
            <div className="admin-quick-actions">
              {[
                ['✏️', 'New Story', '/admin/stories/new'],
                ['👤', 'Add Author', '/admin/authors'],
                ['💬', 'Moderate', '/admin/comments'],
                ['🎬', 'Add Video', '/admin/videos'],
                ['📢', 'Manage Ads', '/admin/ads'],
                ['📧', 'Subscribers', '/admin/subscribers'],
              ].map(([icon, label, path]) => (
                <Link key={label} to={path} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px', background: '#f8fafc', borderRadius: 12, textDecoration: 'none', color: '#334155', fontWeight: 600, fontSize: 13, border: '1px solid #e2e8f0', transition: 'all .2s' }}>
                  <span style={{ fontSize: 24 }}>{icon}</span>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
