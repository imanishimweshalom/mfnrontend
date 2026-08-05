import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { authAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMsg, setPwMsg] = useState({ text: '', ok: true });
  const [pwLoading, setPwLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'Journalist' });
  const [userMsg, setUserMsg] = useState({ text: '', ok: true });
  const [userLoading, setUserLoading] = useState(false);

  useEffect(() => {
    authAPI.getUsers().then(r => setUsers(r.data || [])).catch(() => {});
  }, []);

  const handlePwChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return setPwMsg({ text: 'New passwords do not match.', ok: false });
    if (pwForm.newPassword.length < 6) return setPwMsg({ text: 'Password must be at least 6 characters.', ok: false });
    setPwLoading(true); setPwMsg({ text: '', ok: true });
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMsg({ text: '✅ Password updated successfully!', ok: true });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { setPwMsg({ text: err.response?.data?.error || 'Failed to update password.', ok: false }); }
    finally { setPwLoading(false); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserLoading(true); setUserMsg({ text: '', ok: true });
    try {
      await authAPI.createUser(newUser);
      setUserMsg({ text: '✅ Admin user created!', ok: true });
      setNewUser({ username: '', email: '', password: '', role: 'Journalist' });
      const r = await authAPI.getUsers(); setUsers(r.data || []);
    } catch (err) { setUserMsg({ text: err.response?.data?.error || 'Failed to create user.', ok: false }); }
    finally { setUserLoading(false); }
  };

  return (
    <AdminLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        :root { --primary: #1a472a; --primary-light: #2d6a4f; --bg-card: #ffffff; --bg-subtle: #f8fafc; --border: #e2e8f0; --text-main: #0f172a; --text-muted: #64748b; --text-faint: #94a3b8; }
        
        .s-container { font-family: 'Plus Jakarta Sans', sans-serif; animation: fadeIn .4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* Base Mobile Styles */
        .s-header { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; margin-bottom: 24px; }
        .s-title { font-weight: 800; font-size: 1.5rem; letter-spacing: -0.03em; margin: 0; color: var(--text-main); }

        .s-card { background: var(--bg-card); padding: 20px; border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 4px 15px rgba(0,0,0,.03); margin-bottom: 16px; transition: box-shadow .3s; }
        .s-card:hover { box-shadow: 0 8px 25px rgba(0,0,0,.06); }
        .s-card-title { font-weight: 800; margin: 0 0 20px; font-size: 1rem; display: flex; align-items: center; gap: 10px; color: var(--text-main); }
        
        .grid-1, .grid-2, .grid-form-table { display: grid; grid-template-columns: 1fr; gap: 16px; }
        .grid-auto { display: grid; grid-template-columns: 1fr; gap: 12px; }

        .s-input-group { position: relative; margin-bottom: 20px; }
        .s-input { width: 100%; padding: 20px 16px 8px 48px; border: 2px solid var(--border); border-radius: 12px; font-size: 14px; outline: none; font-family: inherit; box-sizing: border-box; transition: border-color .2s, box-shadow .2s; background: transparent; color: var(--text-main); font-weight: 600; }
        .s-input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(26, 71, 42, 0.1); }
        .s-input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-faint); transition: color .2s; pointer-events: none; display: flex; align-items: center; }
        .s-input:focus ~ .s-input-icon { color: var(--primary); }
        .s-floating-label { position: absolute; left: 48px; top: 50%; transform: translateY(-50%); color: var(--text-faint); font-size: 14px; pointer-events: none; transition: all .2s ease; font-weight: 500; }
        .s-input:focus ~ .s-floating-label, .s-input:not(:placeholder-shown) ~ .s-floating-label { top: 10px; transform: translateY(0); font-size: 10px; color: var(--primary); font-weight: 700; text-transform: uppercase; letter-spacing: .05em; }

        .s-select { width: 100%; padding: 14px 16px 14px 48px; border: 2px solid var(--border); border-radius: 12px; font-size: 14px; outline: none; font-family: inherit; box-sizing: border-box; background: #fff; font-weight: 600; color: var(--text-main); appearance: none; }
        
        .s-btn { background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%); color: #fff; border: none; padding: 14px 24px; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; font-family: inherit; transition: all .2s; box-shadow: 0 4px 6px -1px rgba(26, 71, 42, 0.2); display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
        .s-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(26, 71, 42, 0.3); }
        .s-btn:disabled { background: var(--text-faint); cursor: not-allowed; box-shadow: none; }
        .s-btn-full { width: 100%; justify-content: center; }

        .s-alert { padding: 12px 16px; border-radius: 10px; margin-bottom: 20px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .s-alert-ok { background: #f0fdf4; color: #166534; border: 1px solid #86efac; }
        .s-alert-err { background: #fef2f2; color: #b91c1c; border: 1px solid #fca5a5; }

        .s-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .s-table { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 640px; }
        .s-table thead th { padding: 14px 16px; background: var(--bg-subtle); color: var(--text-muted); font-size: 11px; text-transform: uppercase; font-weight: 800; border-bottom: 1px solid var(--border); text-align: left; letter-spacing: .05em; }
        .s-table tbody tr { transition: background .2s; }
        .s-table tbody tr:hover { background: #f8fafc; }
        .s-table tbody td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }

        .badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; display: inline-block; }

        .profile-row { display: flex; justify-content: space-between; padding: 14px 16px; background: var(--bg-subtle); border-radius: 10px; border: 1px solid var(--border); transition: background .2s; }
        .profile-row:hover { background: #f1f5f9; }

        .social-link { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: var(--bg-subtle); border-radius: 12px; border: 1px solid var(--border); text-decoration: none; color: var(--text-main); font-size: 14px; font-weight: 600; transition: all .2s; }
        .social-link:hover { border-color: var(--primary); background: #fff; transform: translateY(-1px); }

        /* Tablet Styles (768px and up) */
        @media (min-width: 768px) {
          .s-header { flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 32px; }
          .s-title { font-size: 1.8rem; }
          .s-card { padding: 28px; border-radius: 20px; margin-bottom: 24px; }
          .grid-2 { grid-template-columns: 1fr 1fr; }
          .grid-auto { grid-template-columns: repeat(2, 1fr); }
        }

        /* Desktop Styles (1024px and up) */
        @media (min-width: 1024px) {
          .grid-form-table { grid-template-columns: 380px 1fr; }
          .grid-auto-3 { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      <div className="s-container">
        <div className="s-header">
          <h1 className="s-title">Settings</h1>
        </div>

        <div className="grid-1 grid-2">
          {/* ── Change Password ───────────────────────────────── */}
          <div className="s-card">
            <h3 className="s-card-title"><span>🔐</span> Change Password</h3>
            <div style={{ background: '#f0fdf4', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 13, color: '#166534', border: '1px solid #86efac', fontWeight: 600 }}>
              Logged in as <strong>{user?.username}</strong> ({user?.role})
            </div>
            <form onSubmit={handlePwChange}>
              <div className="s-input-group">
                <input type="password" className="s-input" value={pwForm.currentPassword} required onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} placeholder=" " id="cur-pw" />
                <label htmlFor="cur-pw" className="s-floating-label">Current Password</label>
                <div className="s-input-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>
              </div>
              <div className="s-input-group">
                <input type="password" className="s-input" value={pwForm.newPassword} required onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} placeholder=" " id="new-pw" />
                <label htmlFor="new-pw" className="s-floating-label">New Password</label>
                <div className="s-input-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L17 5"></path></svg></div>
              </div>
              <div className="s-input-group">
                <input type="password" className="s-input" value={pwForm.confirmPassword} required onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder=" " id="conf-pw" />
                <label htmlFor="conf-pw" className="s-floating-label">Confirm Password</label>
                <div className="s-input-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>
              </div>
              
              {pwMsg.text && <div className={`s-alert ${pwMsg.ok ? 's-alert-ok' : 's-alert-err'}`}>{pwMsg.text}</div>}
              <button type="submit" disabled={pwLoading} className="s-btn s-btn-full">{pwLoading ? 'Updating…' : 'Update Password'}</button>
            </form>
          </div>

          {/* ── Profile Info ──────────────────────────────────── */}
          <div className="s-card" style={{ background: 'linear-gradient(to bottom right, #f8fafc, #ffffff)' }}>
            <h3 className="s-card-title"><span>👤</span> Your Profile</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                ['Username', user?.username], ['Email', user?.email || '—'], ['Role', user?.role], ['Last Login', user?.last_login ? new Date(user.last_login).toLocaleString() : '—'],
              ].map(([label, val]) => (
                <div key={label} className="profile-row">
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{val}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, padding: 18, background: '#fff', borderRadius: 12, border: '1px solid #86efac', boxShadow: '0 4px 6px -1px rgba(134, 239, 172, .2)' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>Role Permissions</div>
              <div style={{ fontSize: 13, color: '#166534', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {user?.role === 'Admin' && '✓ Full access to all features\n✓ Delete content\n✓ Manage users & ads'}
                {user?.role === 'Editor' && '✓ Publish & edit stories\n✓ Manage authors\n✓ Approve comments'}
                {user?.role === 'Journalist' && '✓ Create & publish stories\n✗ Cannot delete content'}
                {user?.role === 'Moderator' && '✓ Approve & delete comments\n✗ Cannot publish stories'}
              </div>
            </div>
          </div>
        </div>

        {/* ── Admin Users Management ────────────────────────── */}
        {user?.role === 'Admin' && (
          <div className="grid-1 grid-form-table">
            <div className="s-card">
              <h3 className="s-card-title"><span>➕</span> Create Admin User</h3>
              <form onSubmit={handleCreateUser}>
                <div className="s-input-group">
                  <input className="s-input" value={newUser.username} required onChange={e => setNewUser(u => ({ ...u, username: e.target.value }))} placeholder=" " id="new-user" />
                  <label htmlFor="new-user" className="s-floating-label">Username</label>
                  <div className="s-input-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
                </div>
                <div className="s-input-group">
                  <input type="email" className="s-input" value={newUser.email} onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))} placeholder=" " id="new-email" />
                  <label htmlFor="new-email" className="s-floating-label">Email Address</label>
                  <div className="s-input-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></div>
                </div>
                <div className="s-input-group">
                  <input type="password" className="s-input" value={newUser.password} required onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))} placeholder=" " id="new-pw-user" />
                  <label htmlFor="new-pw-user" className="s-floating-label">Password</label>
                  <div className="s-input-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>
                </div>
                <div className="s-input-group">
                  <select className="s-select" value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))} style={{ paddingLeft: 48 }} id="new-role">
                    {['Admin', 'Editor', 'Journalist', 'Moderator'].map(r => <option key={r}>{r}</option>)}
                  </select>
                  <label htmlFor="new-role" className="s-floating-label">Role</label>
                  <div className="s-input-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>
                </div>

                {userMsg.text && <div className={`s-alert ${userMsg.ok ? 's-alert-ok' : 's-alert-err'}`}>{userMsg.text}</div>}
                <button type="submit" disabled={userLoading} className="s-btn s-btn-full">{userLoading ? 'Creating…' : 'Create User'}</button>
              </form>
            </div>

            <div className="s-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontWeight: 800, margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-main)' }}>
                  <span>👥</span> Admin Users <span style={{ fontSize: 12, background: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: 6, color: 'var(--text-muted)' }}>{users.length}</span>
                </h3>
              </div>
              <div className="s-table-scroll">
                <table className="s-table">
                  <thead>
                    <tr>{['Username', 'Email', 'Role', 'Last Login', 'Status'].map(h => (<th key={h}>{h}</th>))}</tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id || u.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                              {u.username?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)' }}>{u.username}</div>
                              {u.username === user?.username && <span style={{ fontSize: 10, background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>You</span>}
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{u.email || '—'}</td>
                        <td>
                          <span className="badge" style={{ background: u.role === 'Admin' ? '#fef9c3' : u.role === 'Editor' ? '#e0f2fe' : u.role === 'Moderator' ? '#fce7f3' : '#f1f5f9', color: u.role === 'Admin' ? '#854d0e' : u.role === 'Editor' ? '#0369a1' : u.role === 'Moderator' ? '#be185d' : '#475569' }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-faint)' }}>{u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}</td>
                        <td>
                          <span className="badge" style={{ background: u.active !== false ? '#dcfce7' : '#fef2f2', color: u.active !== false ? '#166534' : '#b91c1c' }}>
                            {u.active !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (<tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--text-faint)', fontSize: 14 }}>No users found</td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Site Information ─────────────────────────────── */}
        <div className="s-card">
          <h3 className="s-card-title"><span>🌐</span> Site Information</h3>
          <div className="grid-auto grid-auto-3">
            {[
              ['Site Name', 'Mahoko Friday News'], ['Tagline', "Make Youth's Voice Be Heard"], ['Language', 'Kinyarwanda / English'], ['Location', 'Kigali, Rwanda'], ['Founded', '2018'], ['Email', 'mahokofridaynews@gmail.com'], ['Phone', '+250 739 903 542'], ['Database', 'MongoDB'], ['Backend', 'Node.js + Express'], ['Frontend', 'React.js'],
            ].map(([label, val]) => (
              <div key={label} style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: 12, border: '1px solid var(--border)', transition: 'all .2s' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Social Media Links ────────────────────────────── */}
        <div className="s-card" style={{ marginBottom: 40 }}>
          <h3 className="s-card-title"><span>📱</span> Social Media</h3>
          <div className="grid-auto">
            {[
              ['Facebook', 'https://www.facebook.com/profile.php?id=61579631955116', '#1877f2'],
              ['Twitter / X', 'https://x.com/ZigaMichel28110', '#0d0d0d'],
              ['Instagram', 'https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite', '#e1306c'],
              ['TikTok', 'https://www.tiktok.com/@mahoko.friday.news', '#0d0d0d'],
              ['YouTube', 'https://youtube.com/@mahokofridaynews-n3p', '#ff0000'],
              ['WhatsApp', 'https://chat.whatsapp.com/H40lstF5ft180ah97R1L9E', '#25d366'],
            ].map(([name, url, color]) => (
              <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="social-link">
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, flexShrink: 0 }}></div>
                <span>{name}</span>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-faint)' }}>↗</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
