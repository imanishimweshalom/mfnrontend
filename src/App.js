import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages
import Home from './pages/public/Home';
import StoryPage from './pages/public/Story';
import CategoryPage from './pages/public/Category';
import { SearchPage, AuthorPage, VideosPage } from './pages/public/Other';
import { ContactPage, AboutPage, SubscribePage, PrivacyPage } from './pages/public/Static';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import { StoriesList, StoryForm } from './pages/admin/Stories';
import { Authors, Comments, Videos, Ads, Subscribers, AuditLogs } from './pages/admin/Manage';
import Settings from './pages/admin/Settings';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '4px solid #e2e8f0', borderTop: '4px solid #1a472a', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
        <p style={{ color: '#64748b', fontFamily: 'sans-serif' }}>Loading…</p>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* ── PUBLIC ── */}
      <Route path="/" element={<Home />} />
      <Route path="/story/:id" element={<StoryPage />} />
      <Route path="/category/:category" element={<CategoryPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/author/:name" element={<AuthorPage />} />
      <Route path="/videos" element={<VideosPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/subscribe" element={<SubscribePage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<PrivacyPage />} />
      <Route path="/epaper" element={<AboutPage />} />
      <Route path="/archive" element={<CategoryPage />} />

      {/* ── ADMIN ── */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin/stories" element={<ProtectedRoute><StoriesList /></ProtectedRoute>} />
      <Route path="/admin/stories/new" element={<ProtectedRoute><StoryForm /></ProtectedRoute>} />
      <Route path="/admin/stories/edit/:id" element={<ProtectedRoute><StoryForm /></ProtectedRoute>} />
      <Route path="/admin/authors" element={<ProtectedRoute><Authors /></ProtectedRoute>} />
      <Route path="/admin/comments" element={<ProtectedRoute><Comments /></ProtectedRoute>} />
      <Route path="/admin/videos" element={<ProtectedRoute><Videos /></ProtectedRoute>} />
      <Route path="/admin/ads" element={<ProtectedRoute><Ads /></ProtectedRoute>} />
      <Route path="/admin/subscribers" element={<ProtectedRoute><Subscribers /></ProtectedRoute>} />
      <Route path="/admin/audit" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      {/* Redirect /admin → dashboard */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      {/* 404 fallback */}
      <Route path="*" element={
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'serif', background: '#faf8f3' }}>
          <h1 style={{ fontSize: '6rem', fontWeight: 900, color: '#c0392b', margin: 0, lineHeight: 1 }}>404</h1>
          <p style={{ fontSize: '1.4rem', color: '#5a5a5a', marginBottom: 24 }}>Page not found</p>
          <a href="/" style={{ background: '#0d0d0d', color: '#fff', padding: '12px 28px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', textDecoration: 'none' }}>← Back Home</a>
        </div>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
