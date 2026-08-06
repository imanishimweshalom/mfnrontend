import React, { useState, useEffect } from 'react';
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
  { icon: '📨', label: 'Newsletter', path: '/admin/newsletter' },
  { icon: '🔒', label: 'Audit Logs', path: '/admin/audit' },
  { icon: '⚙️', label: 'Settings', path: '/admin/settings' },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Desktop collapse state
  const [collapsed, setCollapsed] = useState(false);
  // Mobile drawer state
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false); // Close drawer if resizing to desktop
    };

    checkMobile(); // Check on initial render
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // On mobile, ignore the desktop "collapsed" state
  const isCollapsed = !isMobile && collapsed;

  const handleLogout = () => {
    if (window.confirm('Sign out of dashboard?')) {
      logout();
      navigate('/admin/login');
    }
  };

  const handleNavClick = () => {
    if (isMobile) setMobileOpen(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* Mobile Backdrop */}
      {isMobile && mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)} 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, transition: 'opacity .3s ease' }}
        />
      )}

      {/* Sidebar */}
      <aside style={{ 
        width: isMobile ? 260 : (isCollapsed ? 72 : 260), 
        background: '#fff', 
        height: '100vh', 
        position: 'fixed', 
        left: 0, 
        top: 0, 
        borderRight: '1px solid #e2e8f0', 
        padding: isMobile ? '24px 20px' : (isCollapsed ? '24px 12px' : '32px 20px'), 
        zIndex: 1001, 
        display: 'flex', 
        flexDirection: 'column', 
        transition: 'transform .3s ease, width .3s ease', 
        overflow: 'hidden',
        transform: isMobile && !mobileOpen ? 'translateX(-100%)' : 'translateX(0)',
        boxShadow: isMobile && mobileOpen ? '0 0 20px rgba(0,0,0,0.1)' : 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36, justifyContent: isCollapsed ? 'center' : 'space-between' }}>
          {!isCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: '#1a472a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, flexShrink: 0 }}>📰</div>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1a472a', whiteSpace: 'nowrap' }}>MFN Admin</span>
            </div>
          )}
          <button 
            onClick={() => isMobile ? setMobileOpen(false) : setCollapsed(c => !c)} 
            style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            {isMobile ? '✕' : (isCollapsed ? '→' : '←')}
          </button>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          {NAV.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                title={isCollapsed ? item.label : ''} 
                onClick={handleNavClick}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12, 
                  padding: '12px 14px', 
                  textDecoration: 'none', 
                  color: active ? '#fff' : '#64748b', 
                  fontWeight: 600, 
                  fontSize: 14, 
                  borderRadius: 10, 
                  background: active ? '#1a472a' : 'transparent', 
                  transition: 'all .2s', 
                  justifyContent: isCollapsed ? 'center' : 'flex-start', 
                  boxShadow: active ? '0 8px 15px rgba(26,71,42,.2)' : 'none', 
                  whiteSpace: 'nowrap' 
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                {!isCollapsed && item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, marginTop: 8 }}>
          {!isCollapsed && user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{user.username?.charAt(0).toUpperCase()}</div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.username}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{user.role}</div>
              </div>
            </div>
          )}
          <button 
            onClick={handleLogout} 
            title={isCollapsed ? 'Logout' : ''} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 10, 
              width: '100%', 
              padding: '10px 14px', 
              background: 'none', 
              border: '1px solid #fca5a5', 
              borderRadius: 10, 
              color: '#ef4444', 
              fontWeight: 600, 
              fontSize: 14, 
              cursor: 'pointer', 
              justifyContent: isCollapsed ? 'center' : 'flex-start', 
              fontFamily: 'inherit', 
              transition: 'all .2s' 
            }}
          >
            <span style={{ fontSize: 18 }}>🚪</span>
            {!isCollapsed && 'Log Out'}
          </button>
          {!isCollapsed && <Link to="/" target="_blank" onClick={handleNavClick} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', color: '#94a3b8', fontSize: 13, textDecoration: 'none', marginTop: 4 }}>🌐 View Website →</Link>}
        </div>
      </aside>

      {/* Main content */}
      <main style={{ 
        marginLeft: isMobile ? 0 : (isCollapsed ? 72 : 260), 
        flex: 1, 
        padding: isMobile ? '80px 16px 40px' : '40px 40px', 
        minHeight: '100vh', 
        transition: 'margin-left .3s ease' 
      }}>
        {/* Mobile Top Header */}
        {isMobile && (
          <header style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: 64,
            background: '#fff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            zIndex: 999,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <button 
              onClick={() => setMobileOpen(true)} 
              style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#1a472a' }}
            >
              ☰
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 12 }}>
              <div style={{ width: 32, height: 32, background: '#1a472a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}>📰</div>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1a472a' }}>MFN Admin</span>
            </div>
          </header>
        )}
        
        {children}
      </main>
    </div>
  );
}
