import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.username, form.password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#1a472a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');`}</style>
      <div style={{ background: '#fff', borderRadius: 20, padding: '48px 40px', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 60, height: 60, background: '#1a472a', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28, color: '#fff' }}>📰</div>
          <h1 style={{ fontWeight: 800, fontSize: '1.5rem', color: '#1a472a', marginBottom: 4 }}>MFN Admin</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Sign in to your dashboard</p>
        </div>
        {error && (
          <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14, textAlign: 'center' }}>{error}</div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, fontSize: 14, color: '#334155' }}>Username</label>
            <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required placeholder="Enter username" style={{ width: '100%', padding: '13px 16px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, fontSize: 14, color: '#334155' }}>Password</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required placeholder="Enter password" style={{ width: '100%', padding: '13px 16px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" disabled={loading} style={{ background: loading ? '#94a3b8' : '#1a472a', color: '#fff', border: 'none', padding: '14px', borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8, transition: 'all .2s' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#94a3b8' }}>
          Default: <code style={{ background: '#f8fafc', padding: '2px 6px', borderRadius: 4 }}>Gerard banya</code> / <code style={{ background: '#f8fafc', padding: '2px 6px', borderRadius: 4 }}>admin123</code>
        </p>
      </div>
    </div>
  );
}
