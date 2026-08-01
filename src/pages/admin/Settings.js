import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { authAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

function Card({ children, style = {} }) {
  return (
    <div style={{ background: '#fff', padding: 28, borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,.03)', marginBottom: 24, ...style }}>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0',
  borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box', marginBottom: 14,
};
const labelStyle = { display: 'block', marginBottom: 7, fontWeight: 700, fontSize: 13, color: '#334155' };
const btnStyle = {
  background: '#1a472a', color: '#fff', border: 'none', padding: '12px 24px',
  borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer',
  fontFamily: 'inherit', transition: 'all .2s',
};

export default function Settings() {
  const { user } = useAuth();
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMsg, setPwMsg]   = useState({ text: '', ok: true });
  const [pwLoading, setPwLoading] = useState(false);

  const [users, setUsers]   = useState([]);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'Journalist' });
  const [userMsg, setUserMsg] = useState({ text: '', ok: true });
  const [userLoading, setUserLoading] = useState(false);

  useEffect(() => {
    authAPI.getUsers().then(r => setUsers(r.data || [])).catch(() => {});
  }, []);

  const handlePwChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return setPwMsg({ text: 'New passwords do not match.', ok: false });
    }
    if (pwForm.newPassword.length < 6) {
      return setPwMsg({ text: 'Password must be at least 6 characters.', ok: false });
    }
    setPwLoading(true);
    setPwMsg({ text: '', ok: true });
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMsg({ text: '✅ Password updated successfully!', ok: true });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwMsg({ text: err.response?.data?.error || 'Failed to update password.', ok: false });
    } finally { setPwLoading(false); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserLoading(true);
    setUserMsg({ text: '', ok: true });
    try {
      await authAPI.createUser(newUser);
      setUserMsg({ text: '✅ Admin user created!', ok: true });
      setNewUser({ username: '', email: '', password: '', role: 'Journalist' });
      const r = await authAPI.getUsers();
      setUsers(r.data || []);
    } catch (err) {
      setUserMsg({ text: err.response?.data?.error || 'Failed to create user.', ok: false });
    } finally { setUserLoading(false); }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.03em', margin: 0 }}>Settings</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* ── Change Password ───────────────────────────────── */}
        <Card>
          <h3 style={{ fontWeight: 800, margin: '0 0 20px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>🔐</span> Change Password
          </h3>
          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 13, color: '#64748b' }}>
            Logged in as <strong>{user?.username}</strong> ({user?.role})
          </div>
          <form onSubmit={handlePwChange}>
            <label style={labelStyle}>Current Password</label>
            <input type="password" value={pwForm.currentPassword} required
              onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
              placeholder="Enter current password" style={inputStyle} />
            <label style={labelStyle}>New Password</label>
            <input type="password" value={pwForm.newPassword} required
              onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
              placeholder="Min. 6 characters" style={inputStyle} />
            <label style={labelStyle}>Confirm New Password</label>
            <input type="password" value={pwForm.confirmPassword} required
              onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
              placeholder="Repeat new password" style={inputStyle} />
            {pwMsg.text && (
              <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13,
                background: pwMsg.ok ? '#f0fdf4' : '#fef2f2',
                color: pwMsg.ok ? '#166534' : '#b91c1c',
                border: `1px solid ${pwMsg.ok ? '#86efac' : '#fca5a5'}` }}>
                {pwMsg.text}
              </div>
            )}
            <button type="submit" disabled={pwLoading} style={{ ...btnStyle, opacity: pwLoading ? .7 : 1, cursor: pwLoading ? 'not-allowed' : 'pointer' }}>
              {pwLoading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </Card>

        {/* ── Profile Info ──────────────────────────────────── */}
        <Card>
          <h3 style={{ fontWeight: 800, margin: '0 0 20px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>👤</span> Your Profile
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              ['Username', user?.username],
              ['Email', user?.email || '—'],
              ['Role', user?.role],
              ['Last Login', user?.last_login ? new Date(user.last_login).toLocaleString() : '—'],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, padding: 16, background: '#f0fdf4', borderRadius: 10, border: '1px solid #86efac' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', marginBottom: 6 }}>Role Permissions</div>
            <div style={{ fontSize: 12, color: '#166534', lineHeight: 1.7 }}>
              {user?.role === 'Admin' && '✓ Full access to all features\n✓ Delete content\n✓ Manage users\n✓ Manage ads'}
              {user?.role === 'Editor' && '✓ Publish & edit stories\n✓ Manage authors\n✓ Approve comments'}
              {user?.role === 'Journalist' && '✓ Create & publish stories\n✗ Cannot delete content'}
              {user?.role === 'Moderator' && '✓ Approve & delete comments\n✗ Cannot publish stories'}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Admin Users Management ────────────────────────── */}
      {user?.role === 'Admin' && (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24 }}>
          <Card>
            <h3 style={{ fontWeight: 800, margin: '0 0 20px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>➕</span> Create Admin User
            </h3>
            <form onSubmit={handleCreateUser}>
              <label style={labelStyle}>Username *</label>
              <input value={newUser.username} required onChange={e => setNewUser(u => ({ ...u, username: e.target.value }))}
                placeholder="Unique username" style={inputStyle} />
              <label style={labelStyle}>Email</label>
              <input type="email" value={newUser.email} onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))}
                placeholder="admin@mfn.com" style={inputStyle} />
              <label style={labelStyle}>Password *</label>
              <input type="password" value={newUser.password} required onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))}
                placeholder="Min. 6 characters" style={inputStyle} />
              <label style={labelStyle}>Role *</label>
              <select value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))} style={{ ...inputStyle, background: '#fff' }}>
                {['Admin', 'Editor', 'Journalist', 'Moderator'].map(r => <option key={r}>{r}</option>)}
              </select>
              {userMsg.text && (
                <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13,
                  background: userMsg.ok ? '#f0fdf4' : '#fef2f2',
                  color: userMsg.ok ? '#166534' : '#b91c1c',
                  border: `1px solid ${userMsg.ok ? '#86efac' : '#fca5a5'}` }}>
                  {userMsg.text}
                </div>
              )}
              <button type="submit" disabled={userLoading} style={{ ...btnStyle, width: '100%', opacity: userLoading ? .7 : 1 }}>
                {userLoading ? 'Creating…' : 'Create User'}
              </button>
            </form>
          </Card>

          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 800, margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>👥</span> Admin Users ({users.length})
              </h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  {['Username', 'Email', 'Role', 'Last Login', 'Status'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', background: '#f8fafc', color: '#64748b', fontSize: 11, textTransform: 'uppercase', fontWeight: 800, borderBottom: '1px solid #e2e8f0', textAlign: 'left', letterSpacing: '.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id || u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, background: '#1a472a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                          {u.username?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{u.username}</span>
                        {u.username === user?.username && <span style={{ fontSize: 10, background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>You</span>}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748b' }}>{u.email || '—'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                        background: u.role === 'Admin' ? '#fef9c3' : u.role === 'Editor' ? '#e0f2fe' : u.role === 'Moderator' ? '#fce7f3' : '#f1f5f9',
                        color: u.role === 'Admin' ? '#854d0e' : u.role === 'Editor' ? '#0369a1' : u.role === 'Moderator' ? '#be185d' : '#475569',
                      }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#94a3b8' }}>
                      {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                        background: u.active !== false ? '#dcfce7' : '#fef2f2',
                        color: u.active !== false ? '#166534' : '#b91c1c' }}>
                        {u.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>No users found</td></tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* ── Site Information ─────────────────────────────── */}
      <Card>
        <h3 style={{ fontWeight: 800, margin: '0 0 20px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>🌐</span> Site Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
          {[
            ['Site Name', 'Mahoko Friday News'],
            ['Tagline', 'Make Youth\'s Voice Be Heard'],
            ['Language', 'Kinyarwanda / English'],
            ['Location', 'Kigali, Rwanda'],
            ['Founded', '2018'],
            ['Email', 'mahokofridaynews@gmail.com'],
            ['Phone', '+250 739 903 542'],
            ['Database', 'MongoDB'],
            ['Backend', 'Node.js + Express'],
            ['Frontend', 'React.js'],
          ].map(([label, val]) => (
            <div key={label} style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{val}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Social Media Links ────────────────────────────── */}
      <Card>
        <h3 style={{ fontWeight: 800, margin: '0 0 20px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>📱</span> Social Media
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12 }}>
          {[
            ['Facebook', 'https://www.facebook.com/profile.php?id=61579631955116', '#1877f2'],
            ['Twitter / X', 'https://x.com/ZigaMichel28110', '#0d0d0d'],
            ['Instagram', 'https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite&utm_medium=copy_link&utm_content=xyzx1jj', '#e1306c'],
            ['TikTok', 'https://www.tiktok.com/@mahoko.friday.news', '#0d0d0d'],
            ['YouTube', 'https://youtube.com/@mahokofridaynews-n3p', '#ff0000'],
            ['WhatsApp', 'https://chat.whatsapp.com/H40lstF5ft180ah97R1L9E', '#25d366'],
          ].map(([name, url, color]) => (
            <a key={name} href={url} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', textDecoration: 'none', color: '#0f172a', fontSize: 14, fontWeight: 600, transition: 'all .2s' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }}></div>
              <span>{name}</span>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94a3b8' }}>↗</span>
            </a>
          ))}
        </div>
      </Card>
    </AdminLayout>
  );
}
