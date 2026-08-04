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
    <div className="modern-login-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .modern-login-container {
          min-height: 100vh;
          min-height: 100dvh; /* Dynamic viewport height for modern mobile browsers */
          background: linear-gradient(135deg, #1a472a 0%, #2d6a4f 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .modern-login-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 48px 40px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: slideUp 0.4s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .login-icon-box {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #1a472a 0%, #2d6a4f 100%);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 28px;
          color: #fff;
          box-shadow: 0 10px 15px -3px rgba(26, 71, 42, 0.3);
        }

        .login-title {
          font-weight: 800;
          font-size: 1.75rem;
          color: #1e293b;
          margin: 0 0 4px;
        }

        .login-subtitle {
          color: #94a3b8;
          font-size: 15px;
          font-weight: 500;
        }

        .error-message {
          background: #fef2f2;
          color: #dc2626;
          padding: 14px 16px;
          border-radius: 12px;
          margin-bottom: 24px;
          font-size: 14px;
          text-align: center;
          font-weight: 600;
          border: 1px solid #fee2e2;
        }

        .input-group {
          position: relative;
          margin-bottom: 24px;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          transition: color 0.3s ease;
          pointer-events: none;
          display: flex;
          align-items: center;
        }

        .modern-input {
          width: 100%;
          padding: 20px 16px 8px 48px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          outline: none;
          font-family: inherit;
          box-sizing: border-box;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          background: transparent;
          color: #1e293b;
          font-weight: 600;
        }

        .modern-input:focus {
          border-color: #1a472a;
          box-shadow: 0 0 0 4px rgba(26, 71, 42, 0.1);
        }

        .modern-input:focus ~ .input-icon {
          color: #1a472a;
        }

        .floating-label {
          position: absolute;
          left: 48px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 15px;
          pointer-events: none;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .modern-input:focus ~ .floating-label,
        .modern-input:not(:placeholder-shown) ~ .floating-label {
          top: 12px;
          transform: translateY(0);
          font-size: 11px;
          color: #1a472a;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .login-button {
          width: 100%;
          background: linear-gradient(135deg, #1a472a 0%, #2d6a4f 100%);
          color: #fff;
          border: none;
          padding: 16px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
          margin-top: 8px;
          box-shadow: 0 10px 15px -3px rgba(26, 71, 42, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 20px -3px rgba(26, 71, 42, 0.3);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Loading Spinner Animation */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }

        /* Responsive Design - Tablets & Small Laptops */
        @media (max-width: 768px) {
          .modern-login-container {
            padding: 24px;
          }
        }

        /* Responsive Design - Mobile Phones */
        @media (max-width: 480px) {
          .modern-login-card {
            padding: 32px 24px;
            border-radius: 20px;
          }
          .login-title {
            font-size: 1.5rem;
          }
          .modern-input {
            padding: 18px 16px 6px 48px;
            font-size: 14px;
          }
          .floating-label {
            font-size: 14px;
          }
        }

        /* Responsive Design - Very Small Mobile Phones (e.g., iPhone SE) */
        @media (max-width: 360px) {
          .modern-login-card {
            padding: 24px 20px;
            border-radius: 16px;
          }
          .login-title {
            font-size: 1.35rem;
          }
          .login-icon-box {
            width: 56px;
            height: 56px;
            font-size: 24px;
            border-radius: 14px;
            margin-bottom: 16px;
          }
          .login-header {
            margin-bottom: 28px;
          }
        }
      `}</style>

      <div className="modern-login-card">
        <div className="login-header">
          <div className="login-icon-box">📰</div>
          <h1 className="login-title">MFN Admin</h1>
          <p className="login-subtitle">Sign in to your dashboard</p>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input 
              type="text"
              className="modern-input"
              value={form.username} 
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))} 
              required 
              placeholder=" " // Space is required for floating label CSS trick
              id="username"
            />
            <label htmlFor="username" className="floating-label">Username</label>
            <div className="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>

          <div className="input-group">
            <input 
              type="password" 
              className="modern-input"
              value={form.password} 
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
              required 
              placeholder=" " // Space is required for floating label CSS trick
              id="password"
            />
            <label htmlFor="password" className="floating-label">Password</label>
            <div className="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
          </div>

          <button type="submit" disabled={loading} className="login-button">
            {loading ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
              </svg>
            ) : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
