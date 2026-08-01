import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { icon: '🏠', label: 'Overview', path: '/admin/dashboard' },
  { icon: '✏️', label: 'Create Story', path: '/admin/stories/new' },
  { icon: '📚', label: 'All Stories', path: '/admin/stories' },
  { icon: '👤', label: 'Authors', path: '/admin/authors' },
  { icon: '💬', label: 'Comments', path: '/admin/comments' },
  { icon: '🎬', label: 'Videos', path: '/admin/videos' },
  { icon: '📢', label: 'Ads', path: '/admin/ads' },
  { icon: '📧', label: 'Subscribers', path: '/admin/subscribers' },
  { icon: '🔒', label: 'Audit Logs', path: '/admin/audit' },
  { icon: '⚙️', label: 'Settings', path: '/admin/settings' },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Sign out of dashboard?')) {
      logout();
      navigate('/admin/login');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* Sidebar */}
      <aside style={{ width: collapsed ? 72 : 260, background: '#fff', height: '100vh', position: 'fixed', left: 0, top: 0, borderRight: '1px solid #e2e8f0', padding: collapsed ? '24px 12px' : '32px 20px', zIndex: 100, display: 'flex', flexDirection: 'column', transition: 'width .3s ease', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36, justifyContent: collapsed ? 'center' : 'space-between' }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: '#1a472a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, flexShrink: 0 }}>📰</div>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1a472a', whiteSpace: 'nowrap' }}>MFN Admin</span>
            </div>
          )}
          <button onClick={() => setCollapsed(c => !c)} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} title={collapsed ? item.label : ''} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', textDecoration: 'none', color: active ? '#fff' : '#64748b', fontWeight: 600, fontSize: 14, borderRadius: 10, background: active ? '#1a472a' : 'transparent', transition: 'all .2s', justifyContent: collapsed ? 'center' : 'flex-start', boxShadow: active ? '0 8px 15px rgba(26,71,42,.2)' : 'none', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, marginTop: 8 }}>
          {!collapsed && user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{user.username?.charAt(0).toUpperCase()}</div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.username}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{user.role}</div>
              </div>
            </div>
          )}
          <button onClick={handleLogout} title={collapsed ? 'Logout' : ''} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', background: 'none', border: '1px solid #fca5a5', borderRadius: 10, color: '#ef4444', fontWeight: 600, fontSize: 14, cursor: 'pointer', justifyContent: collapsed ? 'center' : 'flex-start', fontFamily: 'inherit', transition: 'all .2s' }}>
            <span style={{ fontSize: 18 }}>🚪</span>
            {!collapsed && 'Log Out'}
          </button>
          {!collapsed && <Link to="/" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', color: '#94a3b8', fontSize: 13, textDecoration: 'none', marginTop: 4 }}>🌐 View Website →</Link>}
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: collapsed ? 72 : 260, flex: 1, padding: '40px 40px', minHeight: '100vh', transition: 'margin-left .3s ease' }}>
        {children}
      </main>
    </div>
  );
}
