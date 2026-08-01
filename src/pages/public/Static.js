import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { subscribeAPI } from '../../utils/api';

// ─── ABOUT PAGE ──────────────────────────────────────────────────────────────
export function AboutPage() {
  return (
    <PublicLayout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#c0392b', marginBottom: 12 }}>About Us</div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20 }}>
            Making Youth's Voice <em>Be Heard</em>
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#5a5a5a', lineHeight: 1.8, maxWidth: 600, margin: '0 auto', fontStyle: 'italic' }}>
            Mahoko Friday News is Rwanda's youth-powered news platform, dedicated to amplifying the voices, talents, and stories of the next generation.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 32, marginBottom: 60 }}>
          {[
            ['📰', 'Our Mission', 'To make youth voices heard by providing a platform that promotes their talents, ideas, and projects while connecting them to global opportunities.'],
            ['🌍', 'Our Reach', 'Covering news from Rwanda and across Africa — from politics and business to culture, sport, and technology.'],
            ['🎯', 'Our Values', 'Truth, accuracy, and integrity are the foundations of every story we publish. We hold ourselves to the highest journalistic standards.'],
            ['🤝', 'Our Community', 'Join thousands of readers, contributors, and supporters who believe in the power of informed, empowered African youth.'],
          ].map(([icon, title, text]) => (
            <div key={title} style={{ padding: '28px 24px', background: '#f0ece0', border: '1px solid #e8e4d8', borderTop: '3px solid #c0392b' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>{icon}</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700, marginBottom: 10 }}>{title}</h3>
              <p style={{ fontSize: 14, color: '#5a5a5a', lineHeight: 1.7 }}>{text}</p>
            </div>
          ))}
        </div>

        <div style={{ background: '#0d0d0d', color: '#fff', padding: '48px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 60 }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 900, marginBottom: 16 }}>Get in Touch</h2>
            <p style={{ color: 'rgba(255,255,255,.65)', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>Have a story tip, advertising inquiry, or want to collaborate? We'd love to hear from you.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: 'rgba(255,255,255,.7)' }}>
              <span>📧 mahokofridaynews@gmail.com</span>
              <span>📞 +250 739 903 542</span>
              <span>📍 Kigali, Rwanda</span>
            </div>
          </div>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 900, marginBottom: 16 }}>Est. 2018</h2>
            <p style={{ color: 'rgba(255,255,255,.65)', lineHeight: 1.7, fontStyle: 'italic' }}>Founded in Kigali, Rwanda, MFN has grown from a small community newsletter into one of Rwanda's most trusted youth news platforms.</p>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', marginBottom: 12 }}>Stay Connected</h2>
          <p style={{ color: '#5a5a5a', marginBottom: 24, fontStyle: 'italic' }}>Follow MFN on social media for breaking news, live updates, and behind-the-scenes content.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              ['Facebook', 'https://www.facebook.com/profile.php?id=61579631955116'],
              ['Twitter / X', 'https://x.com/ZigaMichel28110'],
              ['Instagram', 'https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite&utm_medium=copy_link&utm_content=xyzx1jj'],
              ['TikTok', 'https://www.tiktok.com/@mahoko.friday.news'],
              ['YouTube', 'https://youtube.com/@mahokofridaynews-n3p'],
              ['WhatsApp', 'https://chat.whatsapp.com/H40lstF5ft180ah97R1L9E'],
            ].map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{ padding: '10px 20px', background: '#0d0d0d', color: '#fff', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' }}>{label}</a>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

// ─── CONTACT PAGE ─────────────────────────────────────────────────────────────
export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production, connect to an email service or backend endpoint
    setSent(true);
  };

  return (
    <PublicLayout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#c0392b', marginBottom: 12 }}>Contact</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, lineHeight: 1.1 }}>Get In Touch</h1>
          <p style={{ color: '#5a5a5a', fontSize: '1.1rem', fontStyle: 'italic', marginTop: 12 }}>Story tips, advertising, partnerships — we want to hear from you.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 48 }}>
          {[
            ['📧', 'Email', 'mahokofridaynews@gmail.com', 'mailto:mahokofridaynews@gmail.com'],
            ['📞', 'Phone', '+250 739 903 542', 'tel:+250739903542'],
            ['📍', 'Location', 'Kigali, Rwanda', null],
            ['💬', 'WhatsApp', 'Join our group channel', 'https://chat.whatsapp.com/H40lstF5ft180ah97R1L9E'],
          ].map(([icon, label, value, href]) => (
            <div key={label} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '20px', background: '#f0ece0', border: '1px solid #e8e4d8' }}>
              <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{icon}</span>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#c0392b', marginBottom: 4 }}>{label}</div>
                {href ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 600 }}>{value}</a>
                  : <span style={{ fontSize: 14 }}>{value}</span>}
              </div>
            </div>
          ))}
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f0ece0', border: '1px solid #e8e4d8' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', marginBottom: 8 }}>Message Sent!</h3>
            <p style={{ color: '#5a5a5a', fontStyle: 'italic' }}>We'll get back to you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: '#f0ece0', padding: '40px', border: '1px solid #e8e4d8' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', marginBottom: 28 }}>Send a Message</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Your Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required placeholder="Full name" style={{ width: '100%', padding: '12px', border: '1px solid #e8e4d8', background: '#fff', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required placeholder="your@email.com" style={{ width: '100%', padding: '12px', border: '1px solid #e8e4d8', background: '#fff', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Subject *</label>
              <input value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} required placeholder="Story tip / Advertising / Partnership…" style={{ width: '100%', padding: '12px', border: '1px solid #e8e4d8', background: '#fff', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Message *</label>
              <textarea value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} rows={6} required placeholder="Your message…" style={{ width: '100%', padding: '12px', border: '1px solid #e8e4d8', background: '#fff', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', resize: 'vertical' }} />
            </div>
            <button type="submit" style={{ background: '#0d0d0d', color: '#fff', border: 'none', padding: '14px 32px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer' }}>Send Message →</button>
          </form>
        )}
      </div>
    </PublicLayout>
  );
}

// ─── SUBSCRIBE PAGE ───────────────────────────────────────────────────────────
export function SubscribePage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await subscribeAPI.subscribe({ email, name });
      setMsg(res.data.message);
      if (res.data.status === 'success') { setSuccess(true); setEmail(''); setName(''); }
    } catch { setMsg('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <PublicLayout>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 20 }}>📬</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, marginBottom: 16, lineHeight: 1.1 }}>Stay Informed</h1>
        <p style={{ color: '#5a5a5a', fontSize: '1.1rem', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 40 }}>
          Join thousands of readers who get Rwanda's top stories delivered to their inbox every morning. Free, no spam, unsubscribe anytime.
        </p>

        {success ? (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '40px 32px', borderRadius: 4 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎉</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: '#166534', marginBottom: 8 }}>You're subscribed!</h3>
            <p style={{ color: '#166534', fontStyle: 'italic' }}>Welcome to the MFN community. Check your inbox soon.</p>
            <Link to="/" style={{ display: 'inline-block', marginTop: 24, background: '#0d0d0d', color: '#fff', padding: '12px 28px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' }}>Read Latest News →</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: '#f0ece0', padding: '40px', border: '1px solid #e8e4d8', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name (optional)" style={{ padding: '14px 16px', border: '1px solid #e8e4d8', background: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" style={{ padding: '14px 16px', border: '1px solid #e8e4d8', background: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
            <button type="submit" disabled={loading} style={{ background: '#c0392b', color: '#fff', border: 'none', padding: '14px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1 }}>
              {loading ? 'Subscribing…' : 'Subscribe Now — It\'s Free'}
            </button>
            {msg && <span style={{ fontSize: 13, color: '#c0392b' }}>{msg}</span>}
          </form>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 48 }}>
          {[['📰', 'Daily News', 'Fresh stories every morning'],['🔒','No Spam','We never share your data'],['❌','Unsubscribe','Anytime, one click']].map(([icon, title, text]) => (
            <div key={title} style={{ padding: '20px 16px', background: '#f0ece0', border: '1px solid #e8e4d8' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{icon}</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 12, color: '#5a5a5a' }}>{text}</div>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}

// ─── PRIVACY PAGE ─────────────────────────────────────────────────────────────
export function PrivacyPage() {
  const sections = [
    ['1. Information We Collect', 'We collect information you provide directly (name, email, comments), as well as non-personal data like browser type and pages visited to help improve our service.'],
    ['2. How We Use Information', 'To respond to inquiries, publish and manage content, improve our services, connect users to opportunities, and ensure platform security.'],
    ['3. Sharing of Information', 'Mahoko Friday News does not sell or trade your personal information. We may share data with trusted partners when necessary or to comply with legal requirements.'],
    ['4. Cookies', 'We use cookies to improve user experience and website performance. You can disable cookies in your browser settings.'],
    ['5. Content Policy', 'By submitting content, you grant MFN the right to publish it. You retain ownership and confirm the content is original.'],
    ['6. Security', 'We implement industry-standard security measures to protect your data, though no system is 100% secure.'],
    ['7. Children', 'Users under 18 should obtain parental permission before submitting personal data.'],
    ['8. Contact', 'For privacy concerns: mahokofridaynews@gmail.com | +250 739 903 542'],
  ];

  return (
    <PublicLayout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#c0392b', marginBottom: 12 }}>Legal</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, marginBottom: 12 }}>Privacy Policy</h1>
          <p style={{ color: '#5a5a5a', fontStyle: 'italic' }}>Effective Date: September 12, 2025</p>
        </div>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.8, marginBottom: 40, color: '#333' }}>
          Mahoko Friday News respects your privacy and is committed to protecting any personal information you provide while using our platform.
        </p>

        {sections.map(([title, text]) => (
          <div key={title} style={{ marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid #e8e4d8' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700, marginBottom: 12, borderLeft: '4px solid #c0392b', paddingLeft: 14 }}>{title}</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: '#444' }}>{text}</p>
          </div>
        ))}

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link to="/" style={{ display: 'inline-block', background: '#0d0d0d', color: '#fff', padding: '12px 28px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' }}>← Back to Home</Link>
        </div>
      </div>
    </PublicLayout>
  );
}
