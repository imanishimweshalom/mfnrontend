import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Facebook,
  Instagram,
  Youtube,
  Music2,
  MessageCircle,
  Twitter,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Send,
  ArrowUp
} from 'lucide-react';

import { breakingAPI, subscribeAPI } from '../../utils/api';

const CATEGORIES = [
  { label: 'Home', path: '/' },
  { label: 'Business', path: '/category/Business' },
  { label: 'Sport', path: '/category/Sport' },
  { label: 'Technology', path: '/category/Technology' },
  { label: 'Health', path: '/category/Health' },
  { label: 'Culture', path: '/category/Culture' },
  { label: 'Religion', path: '/category/Religion' },
  { label: 'Entertainment', path: '/category/Entertainment' },
  { label: 'Education', path: '/category/Education' },
  { label: 'Video', path: '/videos', icon: '▶' },
  {
    label: 'More',
    sub: [
      { label: 'Le Phare', path: '/category/Le Phare' },
      { label: 'Environment', path: '/category/Environment' },
      { label: 'Music', path: '/category/Music' },
      { label: 'Transport', path: '/category/Transport' },
      { label: 'Job Links', path: '/category/job-links' }
    ]
  }
];

const SOCIALS = [
  {
    icon: Facebook,
    href: 'https://www.facebook.com/profile.php?id=61579631955116',
    label: 'Facebook'
  },
  {
    icon: Twitter,
    href: 'https://x.com/ZigaMichel28110',
    label: 'X'
  },
  {
    icon: Instagram,
    href: 'https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite&utm_medium=copy_link&utm_content=xyzx1jj',
    label: 'Instagram'
  },
  {
    icon: Music2,
    href: 'https://www.tiktok.com/@mahoko.friday.news',
    label: 'TikTok'
  },
  {
    icon: Youtube,
    href: 'https://youtube.com/@mahokofridaynews-n3p',
    label: 'YouTube'
  },
  {
    icon: MessageCircle,
    href: 'https://chat.whatsapp.com/H40lstF5ft180ah97R1L9E',
    label: 'WhatsApp'
  }
];

export default function PublicLayout({ children }) {
  const [breaking, setBreaking] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState('');
  const [subMsg, setSubMsg] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    breakingAPI
      .get()
      .then((r) => {
        setBreaking(Array.isArray(r.data) ? r.data : []);
      })
      .catch(() => {
        setBreaking([]);
      });

    const onScroll = () => {
      setScrolled(window.scrollY > 60);
    };

    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    if (searchQ.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
      setMobileOpen(false);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();

    try {
      const res = await subscribeAPI.subscribe({ email });

      setSubMsg(
        res?.data?.message || 'Successfully subscribed!'
      );

      setEmail('');
    } catch (error) {
      setSubMsg(
        error?.response?.data?.message ||
          'Something went wrong. Please try again.'
      );
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div
      style={{
        fontFamily: "'Source Serif 4', Georgia, serif",
        background: '#faf8f3',
        color: '#0d0d0d',
        minHeight: '100vh'
      }}
    >
      <style>{`

        /* =====================================================
           GLOBAL
        ===================================================== */

        :root {
          --red: #c0392b;
          --red-dark: #962d22;
          --ink: #0d0d0d;
          --gold: #b8860b;
          --light: #e8e4d8;
          --mid: #5a5a5a;
          --white: #ffffff;
          --paper: #faf8f3;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: var(--paper);
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        button,
        input {
          font-family: inherit;
        }

        a:hover {
          color: var(--red);
        }


        /* =====================================================
           BREAKING TICKER
        ===================================================== */

        .ticker {
          display: flex;
          white-space: nowrap;
          gap: 60px;
          animation: tickerScroll 35s linear infinite;
          min-width: max-content;
        }

        .ticker:hover {
          animation-play-state: paused;
        }

        @keyframes tickerScroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }

          50% {
            opacity: 0.35;
          }
        }


        /* =====================================================
           DROPDOWN
        ===================================================== */

        .dropdown-menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          background: #111;
          min-width: 210px;
          border-top: 3px solid var(--red);
          z-index: 1000;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
        }

        .nav-item:hover .dropdown-menu {
          display: block;
        }

        .dropdown-menu a {
          display: block;
          padding: 11px 18px;
          color: #aaa;
          font-size: 12px;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,.06);
          transition: all .2s ease;
        }

        .dropdown-menu a:hover {
          color: #fff;
          background: rgba(255,255,255,.07);
          padding-left: 23px;
        }


        /* =====================================================
           HEADER
        ===================================================== */

        .masthead-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 20px;
        }

        .masthead-links {
          display: flex;
          gap: 10px;
        }

        .masthead-search {
          display: flex;
          justify-content: flex-end;
        }

        .top-bar-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .top-bar-socials {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .top-social {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #888;
          transition: all .2s ease;
        }

        .top-social:hover {
          color: #fff;
          transform: translateY(-2px);
        }


        /* =====================================================
           NAVIGATION
        ===================================================== */

        .main-navigation {
          background: #0d0d0d;
          position: sticky;
          top: 0;
          z-index: 999;
          transition: box-shadow .3s ease;
        }

        .nav-inner {
          max-width: 1260px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-desktop {
          display: flex;
          list-style: none;
          flex-wrap: wrap;
        }

        .nav-link {
          display: block;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #ccc;
          padding: 14px 15px;
          transition: color .2s, background .2s;
        }

        .nav-link:hover {
          color: #fff;
          background: rgba(255,255,255,.08);
        }

        .subscribe-nav {
          display: flex;
          gap: 8px;
          padding: 0 10px;
        }

        .subscribe-button {
          background: var(--red);
          color: #fff;
          border: none;
          padding: 7px 15px;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          transition: all .2s ease;
        }

        .subscribe-button:hover {
          background: #e04b3a;
          color: #fff;
          transform: translateY(-1px);
        }

        .hamburger {
          display: none;
          background: none;
          border: none;
          color: #fff;
          font-size: 22px;
          cursor: pointer;
          padding: 14px;
        }


        /* =====================================================
           MOBILE MENU
        ===================================================== */

        .mobile-menu {
          position: fixed;
          inset: 0;
          background: #111;
          z-index: 9999;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }

        .mobile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,.1);
        }

        .mobile-logo {
          font-family: 'Playfair Display', serif;
          color: #fff;
          font-size: 1.25rem;
          font-weight: 900;
        }

        .mobile-close {
          background: none;
          border: none;
          color: #fff;
          font-size: 23px;
          cursor: pointer;
        }

        .mobile-search {
          display: flex;
          border: 1px solid rgba(255,255,255,.2);
          margin-bottom: 20px;
        }

        .mobile-search input {
          flex: 1;
          background: transparent;
          border: none;
          color: #fff;
          padding: 11px 14px;
          outline: none;
          font-size: 15px;
        }

        .mobile-search button {
          background: var(--red);
          border: none;
          color: #fff;
          padding: 0 17px;
          cursor: pointer;
        }

        .mobile-link {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #ccc;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,.06);
          display: block;
        }

        .mobile-link:hover {
          color: #fff;
        }

        .mobile-sub-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #888;
          padding: 14px 0;
          display: block;
        }

        .mobile-sub-link {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 14px;
          color: #666;
          padding: 10px 16px;
          display: block;
        }

        .mobile-sub-link:hover {
          color: #fff;
        }

        .mobile-subscribe {
          margin-top: 20px;
          background: var(--red);
          color: #fff;
          text-align: center;
          padding: 14px;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }


        /* =====================================================
           FOOTER
        ===================================================== */

        .site-footer {
          background:
            radial-gradient(
              circle at 10% 10%,
              rgba(192,57,43,.13),
              transparent 30%
            ),
            radial-gradient(
              circle at 90% 80%,
              rgba(184,134,11,.09),
              transparent 30%
            ),
            #090909;

          color: #aaa;
          margin-top: 60px;
          position: relative;
          overflow: hidden;
        }

        .site-footer::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(
            90deg,
            #c0392b,
            #b8860b,
            #c0392b
          );
        }

        .footer-container {
          max-width: 1260px;
          margin: auto;
          padding: 70px 20px 35px;
          position: relative;
          z-index: 1;
        }

        .footer-main {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr 1.3fr;
          gap: 55px;
          padding-bottom: 55px;
        }

        .footer-brand {
          max-width: 390px;
        }

        .footer-logo {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 900;
          letter-spacing: -.05em;
          line-height: 1;
          color: #fff;
          margin-bottom: 15px;
        }

        .footer-logo span {
          color: var(--red);
        }

        .footer-tagline {
          font-family: 'Barlow Condensed', sans-serif;
          color: var(--gold);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 18px;
        }

        .footer-description {
          font-family: 'Source Serif 4', Georgia, serif;
          font-size: 14px;
          line-height: 1.8;
          color: #888;
          margin-bottom: 25px;
        }

        .footer-socials {
          display: flex;
          gap: 9px;
          flex-wrap: wrap;
        }

        .footer-social {
          width: 43px;
          height: 43px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.035);
          color: #aaa;
          transition: all .25s ease;
        }

        .footer-social:hover {
          color: #fff;
          background: var(--red);
          border-color: var(--red);
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(192,57,43,.25);
        }

        .footer-column h4 {
          color: #fff;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,.1);
          position: relative;
        }

        .footer-column h4::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -1px;
          width: 35px;
          height: 2px;
          background: var(--red);
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-links li {
          margin-bottom: 11px;
        }

        .footer-links a {
          color: #777;
          font-family: 'Source Serif 4', Georgia, serif;
          font-size: 13px;
          transition: all .2s ease;
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .footer-links a::before {
          content: "→";
          color: var(--red);
          font-family: Arial, sans-serif;
        }

        .footer-links a:hover {
          color: #fff;
          transform: translateX(4px);
        }

        .newsletter-box {
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,.07),
              rgba(255,255,255,.025)
            );

          border: 1px solid rgba(255,255,255,.1);
          padding: 25px;
          position: relative;
          overflow: hidden;
        }

        .newsletter-box::after {
          content: "NEWS";
          position: absolute;
          right: -10px;
          bottom: -12px;
          font-family: 'Playfair Display', serif;
          font-size: 75px;
          font-weight: 900;
          color: rgba(255,255,255,.025);
          pointer-events: none;
        }

        .newsletter-box h3 {
          color: #fff;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.4rem;
          margin-bottom: 8px;
        }

        .newsletter-box p {
          font-family: 'Source Serif 4', Georgia, serif;
          font-size: 12px;
          line-height: 1.6;
          color: #777;
          margin-bottom: 18px;
        }

        .newsletter-form {
          display: flex;
          border: 1px solid rgba(255,255,255,.15);
          background: #111;
          position: relative;
          z-index: 2;
        }

        .newsletter-form input {
          min-width: 0;
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          padding: 11px;
          font-family: 'Source Serif 4', serif;
          font-size: 12px;
        }

        .newsletter-form input::placeholder {
          color: #555;
        }

        .newsletter-form button {
          border: none;
          background: var(--red);
          color: #fff;
          width: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background .2s;
        }

        .newsletter-form button:hover {
          background: #e04b3a;
        }

        .subscribe-message {
          display: block;
          margin-top: 9px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 11px;
          color: #a8e6cf;
        }

        .contact-info {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #777;
          font-size: 12px;
        }

        .contact-item svg {
          color: var(--red);
          flex-shrink: 0;
        }


        /* =====================================================
           DEVELOPER
        ===================================================== */

        .developer-section {
          border-top: 1px solid rgba(255,255,255,.08);
          border-bottom: 1px solid rgba(255,255,255,.08);
          padding: 25px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }

        .developer-text {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 12px;
          color: #666;
          letter-spacing: .5px;
        }

        .developer-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #fff;
          font-weight: 700;
          transition: color .2s ease;
        }

        .developer-link:hover {
          color: var(--red);
        }

        .developer-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 1px solid rgba(255,255,255,.1);
          padding: 8px 13px;
          color: #888;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }


        /* =====================================================
           FOOTER BOTTOM
        ===================================================== */

        .footer-bottom {
          background: #050505;
          padding: 18px 0;
        }

        .footer-bottom-inner {
          max-width: 1260px;
          margin: auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          flex-wrap: wrap;
        }

        .copyright {
          font-family: 'Barlow Condensed', sans-serif;
          color: #555;
          font-size: 11px;
          letter-spacing: .5px;
        }

        .copyright strong {
          color: var(--red);
        }

        .legal-links {
          display: flex;
          gap: 22px;
        }

        .legal-links a {
          color: #555;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: color .2s;
        }

        .legal-links a:hover {
          color: #fff;
        }

        .back-top {
          width: 40px;
          height: 40px;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.04);
          color: #aaa;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all .2s;
        }

        .back-top:hover {
          background: var(--red);
          color: #fff;
          border-color: var(--red);
        }


        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1100px) {

          .nav-link {
            padding-left: 10px;
            padding-right: 10px;
            font-size: 12px;
          }

          .footer-main {
            grid-template-columns: repeat(2, 1fr);
            gap: 40px;
          }
        }


        @media (max-width: 900px) {

          .nav-desktop {
            display: none !important;
          }

          .subscribe-nav {
            display: none;
          }

          .hamburger {
            display: block;
          }

          .masthead-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
          }

          .masthead-links {
            justify-content: center;
            margin-bottom: 12px;
          }

          .masthead-search {
            justify-content: center;
            margin-top: 12px;
            width: 100%;
          }

          .masthead-search input {
            width: 100% !important;
          }

          .top-bar-inner {
            flex-direction: column;
            gap: 7px;
            text-align: center;
          }

          .top-bar-socials {
            justify-content: center;
            width: 100%;
          }
        }


        @media (max-width: 650px) {

          .footer-container {
            padding: 50px 20px 25px;
          }

          .footer-main {
            grid-template-columns: 1fr;
            gap: 35px;
          }

          .footer-brand {
            max-width: none;
          }

          .developer-section {
            align-items: flex-start;
            flex-direction: column;
          }

          .footer-bottom-inner {
            justify-content: center;
            text-align: center;
          }

          .copyright {
            width: 100%;
          }

          .legal-links {
            order: 2;
          }

          .back-top {
            order: 1;
          }
        }


        @media (max-width: 400px) {

          .masthead-links {
            flex-wrap: wrap;
          }

          .footer-social {
            width: 40px;
            height: 40px;
          }

          .newsletter-box {
            padding: 20px;
          }
        }

      `}</style>


      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <div
        style={{
          background: '#0d0d0d',
          color: '#ccc',
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 12,
          padding: '8px 0'
        }}
      >
        <div
          className="top-bar-inner"
          style={{
            maxWidth: 1260,
            margin: '0 auto',
            padding: '0 20px'
          }}
        >

          <div
            style={{
              display: 'flex',
              gap: 20,
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}
          >
            <span>
              📅{' '}
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>

            <span style={{ color: '#888' }}>
              ☀ Kigali · 24°C
            </span>
          </div>


          <div className="top-bar-socials">

            {SOCIALS.map((social) => {
              const Icon = social.icon;

              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="top-social"
                  title={social.label}
                  aria-label={social.label}
                >
                  <Icon size={14} />
                </a>
              );
            })}

            <Link
              to="/admin/login"
              style={{
                color: '#888',
                letterSpacing: 1,
                textTransform: 'uppercase',
                fontSize: 11
              }}
            >
              Sign In
            </Link>

          </div>

        </div>
      </div>


      {/* =====================================================
          BREAKING NEWS
      ===================================================== */}

      {breaking.length > 0 && (
        <div
          style={{
            background: '#c0392b',
            color: '#fff',
            display: 'flex',
            overflow: 'hidden',
            height: 38
          }}
        >

          <div
            style={{
              background: '#0d0d0d',
              padding: '0 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: 11,
              letterSpacing: 2,
              textTransform: 'uppercase'
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                background: '#c0392b',
                borderRadius: '50%',
                animation: 'pulse 1s infinite'
              }}
            />

            Breaking
          </div>


          <div
            style={{
              flex: 1,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <div className="ticker">

              {[...breaking, ...breaking].map((b, i) => (
                <span
                  key={`${b._id || b.id || b.title}-${i}`}
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 13,
                    fontWeight: 600
                  }}
                >
                  ◆ {b.title}
                </span>
              ))}

            </div>
          </div>

        </div>
      )}


      {/* =====================================================
          MASTHEAD
      ===================================================== */}

      <div
        style={{
          background: '#fff',
          borderBottom: '3px double #0d0d0d',
          padding: '20px 0 16px'
        }}
      >

        <div
          className="masthead-grid"
          style={{
            maxWidth: 1260,
            margin: '0 auto',
            padding: '0 20px'
          }}
        >

          <div className="masthead-links">

            <Link
              to="/archive"
              style={{
                background: '#0d0d0d',
                color: '#fff',
                padding: '5px 12px',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: 1
              }}
            >
              Archive
            </Link>

            <Link
              to="/epaper"
              style={{
                background: '#0d0d0d',
                color: '#fff',
                padding: '5px 12px',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: 1
              }}
            >
              E-Paper
            </Link>

          </div>


          <Link
            to="/"
            style={{
              textAlign: 'center'
            }}
          >

            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(1.6rem,4vw,2.8rem)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 1,
                color: '#0d0d0d'
              }}
            >
              <span style={{ color: '#c0392b' }}>M</span>
              ahoko{' '}
              <span style={{ color: '#c0392b' }}>F</span>
              riday{' '}
              <span style={{ color: '#c0392b' }}>N</span>
              ews
            </h1>

            <p
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 10,
                letterSpacing: 4,
                textTransform: 'uppercase',
                color: '#5a5a5a',
                marginTop: 4
              }}
            >
              Latest News · Truth & Independence
            </p>

          </Link>


          <form
            onSubmit={handleSearch}
            className="masthead-search"
          >

            <div
              style={{
                display: 'flex',
                border: '1.5px solid #0d0d0d',
                width: '100%',
                maxWidth: 220
              }}
            >

              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search stories…"
                style={{
                  border: 'none',
                  outline: 'none',
                  padding: '7px 12px',
                  width: '100%',
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  fontSize: 13,
                  background: '#faf8f3'
                }}
              />

              <button
                type="submit"
                style={{
                  background: '#0d0d0d',
                  color: '#fff',
                  border: 'none',
                  padding: '7px 14px',
                  cursor: 'pointer'
                }}
              >
                🔍
              </button>

            </div>

          </form>

        </div>
      </div>


      {/* =====================================================
          MAIN NAVIGATION
      ===================================================== */}

      <nav
        className="main-navigation"
        style={{
          boxShadow: scrolled
            ? '0 2px 20px rgba(0,0,0,.3)'
            : 'none'
        }}
      >

        <div className="nav-inner">

          <ul className="nav-desktop">

            {CATEGORIES.map((cat) => (

              <li
                key={cat.label}
                className="nav-item"
                style={{
                  position: 'relative'
                }}
              >

                {cat.path ? (

                  <Link
                    to={cat.path}
                    className="nav-link"
                  >
                    {cat.icon && (
                      <span
                        style={{
                          color: '#c0392b',
                          marginRight: 4
                        }}
                      >
                        {cat.icon}
                      </span>
                    )}

                    {cat.label}
                  </Link>

                ) : (

                  <>
                    <span
                      className="nav-link"
                      style={{
                        cursor: 'pointer'
                      }}
                    >
                      {cat.label} ▾
                    </span>

                    <div className="dropdown-menu">

                      {cat.sub?.map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.path}
                        >
                          {sub.label}
                        </Link>
                      ))}

                    </div>
                  </>

                )}

              </li>

            ))}

          </ul>


          <div className="subscribe-nav">

            <Link
              to="/subscribe"
              className="subscribe-button"
            >
              Subscribe
            </Link>

          </div>


          <button
            className="hamburger"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>

        </div>

      </nav>


      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      {mobileOpen && (

        <div className="mobile-menu">

          <div className="mobile-header">

            <span className="mobile-logo">
              Mahoko Friday News
            </span>

            <button
              className="mobile-close"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>

          </div>


          <form
            onSubmit={handleSearch}
            className="mobile-search"
          >

            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search…"
            />

            <button type="submit">
              🔍
            </button>

          </form>


          {CATEGORIES.map((cat) => (

            cat.path ? (

              <Link
                key={cat.label}
                to={cat.path}
                onClick={() => setMobileOpen(false)}
                className="mobile-link"
              >
                {cat.label}
              </Link>

            ) : (

              <div
                key={cat.label}
                style={{
                  borderBottom:
                    '1px solid rgba(255,255,255,.06)',
                  paddingBottom: 8
                }}
              >

                <span className="mobile-sub-title">
                  {cat.label}
                </span>

                {cat.sub?.map((sub) => (

                  <Link
                    key={sub.label}
                    to={sub.path}
                    onClick={() => setMobileOpen(false)}
                    className="mobile-sub-link"
                  >
                    {sub.label}
                  </Link>

                ))}

              </div>

            )

          ))}


          <Link
            to="/subscribe"
            onClick={() => setMobileOpen(false)}
            className="mobile-subscribe"
          >
            Subscribe Now
          </Link>

        </div>

      )}


      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}

      <main>
        {children}
      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="site-footer">

        <div className="footer-container">

          <div className="footer-main">


            {/* BRAND */}

            <div className="footer-brand">

              <h2 className="footer-logo">
                <span>M</span>ahoko{' '}
                <span>F</span>riday{' '}
                <span>N</span>ews
              </h2>

              <div className="footer-tagline">
                Truth · Independence · Youth Voices
              </div>

              <p className="footer-description">
                Reliable news about Rwanda and the world.
                We bring stories that matter, amplify youth
                voices, and keep our readers informed with
                independent journalism.
              </p>


              <div className="footer-socials">

                {SOCIALS.map((social) => {

                  const Icon = social.icon;

                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-social"
                      title={social.label}
                      aria-label={social.label}
                    >
                      <Icon
                        size={18}
                        strokeWidth={1.8}
                      />
                    </a>
                  );

                })}

              </div>

            </div>


            {/* EXPLORE */}

            <div className="footer-column">

              <h4>Explore</h4>

              <ul className="footer-links">

                {[
                  'Business',
                  'Sport',
                  'Technology',
                  'Education',
                  'Health',
                  'Culture',
                  'Entertainment',
                  'Environment'
                ].map((category) => (

                  <li key={category}>

                    <Link
                      to={`/category/${category}`}
                    >
                      {category}
                    </Link>

                  </li>

                ))}

              </ul>

            </div>


            {/* SERVICES */}

            <div className="footer-column">

              <h4>Mahoko News</h4>

              <ul className="footer-links">

                <li>
                  <Link to="/about">
                    About Us
                  </Link>
                </li>

                <li>
                  <Link to="/contact">
                    Contact
                  </Link>
                </li>

                <li>
                  <Link to="/epaper">
                    E-Paper
                  </Link>
                </li>

                <li>
                  <Link to="/archive">
                    Archive
                  </Link>
                </li>

                <li>
                  <Link to="/videos">
                    Videos
                  </Link>
                </li>

                <li>
                  <Link to="/subscribe">
                    Subscribe
                  </Link>
                </li>

              </ul>


              <div className="contact-info">

                <div className="contact-item">
                  <Mail size={15} />
                  <span>
                    mfnyouthvoices@gmail.com
                  </span>
                </div>

                <div className="contact-item">
                  <Phone size={15} />
                  <span>
                    +250 787 426 258
                  </span>
                </div>

                <div className="contact-item">
                  <MapPin size={15} />
                  <span>
                    Kigali, Rwanda
                  </span>
                </div>

              </div>

            </div>


            {/* NEWSLETTER */}

            <div className="footer-column">

              <h4>Stay Connected</h4>

              <div className="newsletter-box">

                <h3>
                  Get the latest news.
                </h3>

                <p>
                  Subscribe to Mahoko Friday News
                  and receive important stories and
                  updates directly in your inbox.
                </p>


                <form
                  onSubmit={handleSubscribe}
                  className="newsletter-form"
                >

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="Your email address"
                    required
                  />

                  <button
                    type="submit"
                    aria-label="Subscribe"
                  >
                    <Send size={16} />
                  </button>

                </form>


                {subMsg && (
                  <span className="subscribe-message">
                    {subMsg}
                  </span>
                )}

              </div>

            </div>

          </div>


          {/* =================================================
              DEVELOPER CREDIT
          ================================================= */}

          <div className="developer-section">

            <div className="developer-text">

              Website designed & developed by{' '}

              <a
                href="https://nsengiyumva-gerard.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="developer-link"
              >
                Gerard Nsengiyumva

                <ExternalLink size={13} />

              </a>

            </div>


            <div className="developer-badge">

              <span>⚡</span>

              Digital Development

            </div>

          </div>

        </div>


        {/* =================================================
            FOOTER BOTTOM
        ================================================= */}

        <div className="footer-bottom">

          <div className="footer-bottom-inner">

            <div className="copyright">

              © {new Date().getFullYear()} Mahoko Friday News.
              All rights reserved.

              <span> · </span>

              Developed by{' '}

              <strong>Gerard</strong>.

            </div>


            <div className="legal-links">

              <Link to="/privacy">
                Privacy
              </Link>

              <Link to="/terms">
                Terms
              </Link>

            </div>


            <button
              className="back-top"
              onClick={scrollToTop}
              aria-label="Back to top"
              title="Back to top"
            >
              <ArrowUp size={17} />
            </button>

          </div>

        </div>

      </footer>

    </div>
  );
}
