import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  Search,
  Menu,
  X,
  ChevronDown,
  CalendarDays,
  Sun,
  MapPin,
  Mail,
  Phone,
  Send,
  ArrowUp,
  ExternalLink,
} from 'lucide-react';

import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
  FaTiktok,
  FaXTwitter,
} from 'react-icons/fa6';

import { breakingAPI, subscribeAPI } from '../../utils/api';


/* =========================================================
   NAVIGATION CATEGORIES
========================================================= */

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
      { label: 'Job Links', path: '/category/job-links' },
    ],
  },
];


/* =========================================================
   SOCIAL MEDIA
========================================================= */

const SOCIALS = [
  {
    icon: FaFacebookF,
    href: 'https://www.facebook.com/profile.php?id=61579631955116',
    label: 'Facebook',
  },
  {
    icon: FaXTwitter,
    href: 'https://x.com/ZigaMichel28110',
    label: 'X',
  },
  {
    icon: FaInstagram,
    href: 'https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite&utm_medium=copy_link&utm_content=xyzx1jj',
    label: 'Instagram',
  },
  {
    icon: FaTiktok,
    href: 'https://www.tiktok.com/@mahoko.friday.news',
    label: 'TikTok',
  },
  {
    icon: FaYoutube,
    href: 'https://youtube.com/@mahokofridaynews-n3p',
    label: 'YouTube',
  },
  {
    icon: FaWhatsapp,
    href: 'https://chat.whatsapp.com/H40lstF5ft180ah97R1L9E',
    label: 'WhatsApp',
  },
];


/* =========================================================
   COMPONENT
========================================================= */

export default function PublicLayout({ children }) {

  const [breaking, setBreaking] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState('');
  const [subMsg, setSubMsg] = useState('');

  const navigate = useNavigate();


  /* =======================================================
     LOAD BREAKING NEWS
  ======================================================= */

  useEffect(() => {

    breakingAPI
      .get()
      .then((res) => {
        setBreaking(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        setBreaking([]);
      });


    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };


    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };

  }, []);


  /* =======================================================
     SEARCH
  ======================================================= */

  const handleSearch = (e) => {

    e.preventDefault();

    const query = searchQ.trim();

    if (!query) return;

    navigate(`/search?q=${encodeURIComponent(query)}`);

    setSearchQ('');
    setMobileOpen(false);
  };


  /* =======================================================
     NEWSLETTER
  ======================================================= */

  const handleSubscribe = async (e) => {

    e.preventDefault();

    if (!email.trim()) return;

    try {

      const res = await subscribeAPI.subscribe({
        email: email.trim(),
      });

      setSubMsg(
        res?.data?.message ||
        'Successfully subscribed!'
      );

      setEmail('');

    } catch (error) {

      setSubMsg(
        'Something went wrong. Please try again.'
      );

    }

  };


  /* =======================================================
     BACK TO TOP
  ======================================================= */

  const scrollToTop = () => {

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

  };


  /* =======================================================
     CURRENT DATE
  ======================================================= */

  const today = new Date().toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );


  return (

    <div className="mfn-layout">

      {/* ===================================================
          GLOBAL CSS
      =================================================== */}

      <style>{`

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
          background: #faf8f3;
          color: #0d0d0d;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        button,
        input {
          font-family: inherit;
        }


        /* =================================================
           HEADER TOP
        ================================================= */

        .mfn-header-top {
          background: #080808;
          color: #999;
          border-bottom: 1px solid rgba(255,255,255,.08);
        }

        .mfn-header-top-inner {
          max-width: 1400px;
          margin: auto;
          padding: 8px 25px;

          min-height: 38px;

          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .mfn-header-info {
          display: flex;
          align-items: center;
          gap: 13px;
          flex-wrap: wrap;
        }

        .mfn-header-info-item {
          display: flex;
          align-items: center;
          gap: 6px;

          font-family: 'Barlow Condensed',
            sans-serif;

          font-size: 11px;
          letter-spacing: .5px;
        }

        .mfn-header-info-item svg {
          width: 13px;
          height: 13px;
          color: #c0392b;
        }

        .mfn-header-separator {
          width: 1px;
          height: 14px;
          background: rgba(255,255,255,.14);
        }


        /* SOCIAL HEADER */

        .mfn-header-socials {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .mfn-header-social {
          width: 27px;
          height: 27px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #777;

          border-radius: 50%;

          transition:
            transform .2s ease,
            color .2s ease,
            background .2s ease;
        }

        .mfn-header-social:hover {
          color: #fff;
          background: #c0392b;
          transform: translateY(-2px);
        }

        .mfn-header-social svg {
          width: 13px;
          height: 13px;
        }

        .mfn-signin {
          margin-left: 7px;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;

          color: #999;
        }

        .mfn-signin:hover {
          color: #fff;
        }


        /* =================================================
           BREAKING NEWS
        ================================================= */

        .mfn-breaking {
          height: 39px;

          display: flex;
          overflow: hidden;

          background: #c0392b;
          color: #fff;
        }

        .mfn-breaking-label {
          flex-shrink: 0;

          display: flex;
          align-items: center;
          gap: 8px;

          padding: 0 20px;

          background: #090909;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .mfn-live-dot {
          width: 7px;
          height: 7px;

          background: #c0392b;
          border-radius: 50%;

          animation:
            mfnPulse 1s infinite;
        }

        @keyframes mfnPulse {

          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }

          50% {
            opacity: .4;
            transform: scale(.7);
          }

        }

        .mfn-breaking-track {
          flex: 1;
          overflow: hidden;

          display: flex;
          align-items: center;
        }

        .mfn-ticker {
          display: flex;
          gap: 65px;
          white-space: nowrap;

          animation:
            mfnTicker 38s linear infinite;
        }

        .mfn-ticker:hover {
          animation-play-state: paused;
        }

        @keyframes mfnTicker {

          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }

        }

        .mfn-ticker-item {
          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size: 13px;
          font-weight: 600;
        }


        /* =================================================
           BRAND AREA
        ================================================= */

        .mfn-brand-area {
          background:
            linear-gradient(
              180deg,
              #fff 0%,
              #faf8f3 100%
            );

          border-bottom:
            1px solid #d9d5ca;
        }

        .mfn-brand-container {
          max-width: 1400px;
          margin: auto;

          min-height: 165px;

          padding: 27px 25px;

          display: grid;
          grid-template-columns:
            1fr auto 1fr;

          align-items: center;

          gap: 35px;
        }


        /* BRAND BUTTONS */

        .mfn-brand-buttons {
          display: flex;
          gap: 8px;
        }

        .mfn-brand-button {
          background: #0d0d0d;
          color: #fff;

          padding: 9px 14px;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;

          text-transform: uppercase;

          transition: .2s;
        }

        .mfn-brand-button:hover {
          background: #c0392b;
          color: #fff;
        }


        /* BRAND */

        .mfn-main-brand {
          text-align: center;
        }

        .mfn-brand-kicker {
          color: #b8860b;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size: 9px;
          font-weight: 800;

          letter-spacing: 5px;

          margin-bottom: 9px;
        }

        .mfn-main-brand h1 {
          color: #0d0d0d;

          font-family:
            'Playfair Display',
            Georgia,
            serif;

          font-size:
            clamp(
              2rem,
              5vw,
              4rem
            );

          font-weight: 900;

          line-height: .9;

          letter-spacing: -.065em;

          white-space: nowrap;
        }

        .mfn-main-brand h1 span {
          color: #c0392b;
        }

        .mfn-brand-tagline {
          margin-top: 13px;

          display: flex;
          justify-content: center;
          align-items: center;

          gap: 10px;

          color: #777;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size: 9px;
          font-weight: 700;

          letter-spacing: 3px;

          text-transform: uppercase;
        }

        .mfn-brand-tagline span {
          width: 35px;
          height: 1px;
          background: #c0392b;
        }


        /* SEARCH */

        .mfn-search-area {
          display: flex;
          justify-content: flex-end;
        }

        .mfn-search {
          width: 300px;

          display: flex;
          align-items: center;

          border:
            1px solid #191919;

          background: #fff;
        }

        .mfn-search > svg {
          margin-left: 11px;
          color: #c0392b;
          flex-shrink: 0;
        }

        .mfn-search input {
          flex: 1;
          min-width: 0;

          border: none;
          outline: none;

          background: transparent;

          padding: 11px 10px;

          font-family:
            'Source Serif 4',
            Georgia,
            serif;

          font-size: 12px;
        }

        .mfn-search button {
          border: none;

          background: #0d0d0d;
          color: #fff;

          padding: 11px 14px;

          cursor: pointer;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 1px;

          text-transform: uppercase;
        }

        .mfn-search button:hover {
          background: #c0392b;
        }


        /* =================================================
           NAVIGATION
        ================================================= */

        .mfn-nav {
          position: sticky;
          top: 0;
          z-index: 999;

          background: #0d0d0d;

          transition:
            box-shadow .3s ease;
        }

        .mfn-nav.scrolled {
          box-shadow:
            0 8px 30px
            rgba(0,0,0,.3);
        }

        .mfn-nav-inner {
          max-width: 1400px;
          margin: auto;

          padding: 0 25px;

          min-height: 51px;

          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .mfn-nav-list {
          display: flex;
          list-style: none;
        }

        .mfn-nav-item {
          position: relative;
        }

        .mfn-nav-link {
          display: flex;
          align-items: center;
          gap: 5px;

          padding: 17px 12px;

          color: #aaa;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size: 12px;
          font-weight: 700;

          letter-spacing: 1.2px;

          text-transform: uppercase;

          transition: .2s;
        }

        .mfn-nav-link:hover {
          background: #191919;
          color: #fff;
        }

        .mfn-video-icon {
          color: #c0392b;
        }


        /* DROPDOWN */

        .mfn-dropdown {
          display: none;

          position: absolute;

          top: 100%;
          left: 0;

          min-width: 210px;

          background: #111;

          border-top:
            3px solid #c0392b;

          box-shadow:
            0 15px 40px
            rgba(0,0,0,.45);

          z-index: 1000;
        }

        .mfn-nav-item:hover
        .mfn-dropdown {
          display: block;
        }

        .mfn-dropdown a {
          display: block;

          padding: 12px 18px;

          color: #888;

          border-bottom:
            1px solid
            rgba(255,255,255,.06);

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size: 11px;
          font-weight: 700;

          letter-spacing: 1px;

          text-transform: uppercase;
        }

        .mfn-dropdown a:hover {
          color: #fff;
          background: #191919;
        }


        /* SUBSCRIBE */

        .mfn-subscribe {
          display: flex;
          align-items: center;
          gap: 6px;

          padding: 9px 15px;

          background: #c0392b;
          color: #fff;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 1.5px;

          text-transform: uppercase;

          transition: .2s;
        }

        .mfn-subscribe:hover {
          background: #e04b3a;
          color: #fff;
        }


        /* MOBILE BUTTON */

        .mfn-mobile-button {
          display: none;

          border: none;
          background: transparent;

          color: #fff;

          cursor: pointer;
        }


        /* =================================================
           MOBILE MENU
        ================================================= */

        .mfn-mobile-menu {
          position: fixed;
          inset: 0;

          z-index: 9999;

          overflow-y: auto;

          background:
            radial-gradient(
              circle at top right,
              rgba(192,57,43,.16),
              transparent 35%
            ),
            #090909;

          padding: 22px;
        }

        .mfn-mobile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          padding-bottom: 18px;

          border-bottom:
            1px solid
            rgba(255,255,255,.1);

          margin-bottom: 20px;
        }

        .mfn-mobile-logo {
          color: #fff;

          font-family:
            'Playfair Display',
            Georgia,
            serif;

          font-size: 1.4rem;
          font-weight: 900;
        }

        .mfn-mobile-logo span {
          color: #c0392b;
        }

        .mfn-mobile-close {
          border: none;
          background: transparent;
          color: #fff;
          cursor: pointer;
        }

        .mfn-mobile-search {
          display: flex;

          border:
            1px solid
            rgba(255,255,255,.15);

          margin-bottom: 22px;
        }

        .mfn-mobile-search input {
          flex: 1;

          min-width: 0;

          border: none;
          outline: none;

          background: transparent;
          color: #fff;

          padding: 12px;

          font-size: 14px;
        }

        .mfn-mobile-search button {
          border: none;

          background: #c0392b;
          color: #fff;

          padding: 0 15px;

          cursor: pointer;
        }

        .mfn-mobile-link {
          display: block;

          color: #ccc;

          padding: 15px 4px;

          border-bottom:
            1px solid
            rgba(255,255,255,.06);

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size: 16px;
          font-weight: 700;

          letter-spacing: 1.5px;

          text-transform: uppercase;
        }

        .mfn-mobile-link:hover {
          color: #c0392b;
        }

        .mfn-mobile-sub {
          padding-left: 16px;
        }

        .mfn-mobile-sub a {
          display: block;

          color: #777;

          padding: 10px 0;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size: 13px;
        }

        .mfn-mobile-sub a:hover {
          color: #fff;
        }

        .mfn-mobile-subscribe {
          display: block;

          margin-top: 20px;

          padding: 14px;

          background: #c0392b;

          color: #fff;

          text-align: center;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size: 13px;
          font-weight: 800;

          letter-spacing: 2px;

          text-transform: uppercase;
        }


        /* =================================================
           FOOTER
        ================================================= */

        .mfn-footer {
          position: relative;

          overflow: hidden;

          margin-top: 70px;

          color: #aaa;

          background:
            radial-gradient(
              circle at 10% 20%,
              rgba(192,57,43,.12),
              transparent 28%
            ),
            radial-gradient(
              circle at 90% 70%,
              rgba(184,134,11,.08),
              transparent 25%
            ),
            #080808;
        }

        .mfn-footer::before {
          content: "";

          position: absolute;

          top: 0;
          left: 0;
          right: 0;

          height: 4px;

          background:
            linear-gradient(
              90deg,
              #c0392b,
              #b8860b,
              #c0392b
            );
        }

        .mfn-footer-container {
          max-width: 1400px;
          margin: auto;

          padding:
            85px 25px
            30px;
        }

        .mfn-footer-grid {
          display: grid;

          grid-template-columns:
            1.5fr
            .9fr
            .9fr
            1.2fr;

          gap: 55px;

          padding-bottom: 60px;
        }


        /* FOOTER BRAND */

        .mfn-footer-mark {
          width: 58px;
          height: 58px;

          display: flex;
          align-items: center;
          justify-content: center;

          border:
            1px solid #c0392b;

          color: #c0392b;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-weight: 900;

          letter-spacing: 2px;

          margin-bottom: 18px;
        }

        .mfn-footer-brand h2 {
          color: #fff;

          font-family:
            'Playfair Display',
            Georgia,
            serif;

          font-size:
            clamp(
              2rem,
              3vw,
              2.8rem
            );

          line-height: .95;

          letter-spacing: -.05em;

          margin-bottom: 15px;
        }

        .mfn-footer-brand h2 span {
          color: #c0392b;
        }

        .mfn-footer-rule {
          display: flex;
          align-items: center;

          gap: 8px;

          color: #b8860b;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size: 8px;
          font-weight: 800;

          letter-spacing: 2.5px;

          margin-bottom: 20px;
        }

        .mfn-footer-rule span {
          width: 27px;
          height: 1px;
          background: #c0392b;
        }

        .mfn-footer-brand p {
          max-width: 390px;

          color: #777;

          font-family:
            'Source Serif 4',
            Georgia,
            serif;

          font-size: 13px;
          line-height: 1.8;

          margin-bottom: 25px;
        }


        /* FOOTER SOCIAL */

        .mfn-footer-socials {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .mfn-footer-social {
          width: 44px;
          height: 44px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #888;

          background:
            rgba(255,255,255,.035);

          border:
            1px solid
            rgba(255,255,255,.1);

          transition: .25s;
        }

        .mfn-footer-social svg {
          width: 17px;
          height: 17px;
        }

        .mfn-footer-social:hover {
          color: #fff;

          background: #c0392b;

          border-color: #c0392b;

          transform:
            translateY(-5px);

          box-shadow:
            0 12px 30px
            rgba(192,57,43,.25);
        }


        /* FOOTER HEADINGS */

        .mfn-footer-heading {
          color: #fff;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size: 12px;
          font-weight: 800;

          letter-spacing: 3px;

          text-transform: uppercase;
        }

        .mfn-footer-heading-line {
          width: 35px;
          height: 2px;

          background: #c0392b;

          margin:
            12px 0
            20px;
        }


        /* FOOTER LINKS */

        .mfn-footer-links {
          list-style: none;
        }

        .mfn-footer-links li {
          border-bottom:
            1px solid
            rgba(255,255,255,.055);
        }

        .mfn-footer-links a {
          display: flex;
          align-items: center;
          gap: 10px;

          padding: 9px 0;

          color: #777;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size: 12px;

          transition: .2s;
        }

        .mfn-footer-links a span {
          color: #c0392b;
          min-width: 18px;
        }

        .mfn-footer-links a:hover {
          color: #fff;
          transform: translateX(5px);
        }


        /* CONTACT */

        .mfn-footer-contact {
          display: flex;
          flex-direction: column;

          gap: 12px;

          margin-top: 24px;
        }

        .mfn-footer-contact div {
          display: flex;
          align-items: center;
          gap: 9px;

          color: #666;

          font-size: 11px;
        }

        .mfn-footer-contact svg {
          width: 14px;
          height: 14px;

          color: #c0392b;

          flex-shrink: 0;
        }


        /* NEWSLETTER */

        .mfn-newsletter {
          position: relative;

          overflow: hidden;

          padding: 28px;

          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,.07),
              rgba(255,255,255,.015)
            );

          border:
            1px solid
            rgba(255,255,255,.1);
        }

        .mfn-newsletter::after {
          content: "MFN";

          position: absolute;

          right: -10px;
          bottom: -30px;

          color:
            rgba(255,255,255,.025);

          font-family:
            'Playfair Display',
            serif;

          font-size: 100px;

          font-weight: 900;

          pointer-events: none;
        }

        .mfn-newsletter-label {
          color: #c0392b;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size: 9px;
          font-weight: 800;

          letter-spacing: 3px;

          margin-bottom: 12px;
        }

        .mfn-newsletter h3 {
          color: #fff;

          font-family:
            'Playfair Display',
            Georgia,
            serif;

          font-size: 2rem;

          line-height: 1;

          margin-bottom: 15px;
        }

        .mfn-newsletter p {
          color: #777;

          font-size: 12px;

          line-height: 1.7;

          margin-bottom: 20px;
        }

        .mfn-newsletter-form {
          display: flex;

          position: relative;

          z-index: 2;
        }

        .mfn-newsletter-form input {
          flex: 1;
          min-width: 0;

          border:
            1px solid
            rgba(255,255,255,.15);

          border-right: none;

          outline: none;

          background: #111;
          color: #fff;

          padding: 11px;

          font-size: 11px;
        }

        .mfn-newsletter-form button {
          width: 48px;

          border: none;

          background: #c0392b;
          color: #fff;

          display: flex;
          align-items: center;
          justify-content: center;

          cursor: pointer;
        }

        .mfn-newsletter-form button:hover {
          background: #e04b3a;
        }

        .mfn-sub-message {
          display: block;

          margin-top: 8px;

          color: #9be7c1;

          font-size: 10px;
        }


        /* =================================================
           DEVELOPER
        ================================================= */

        .mfn-developer {
          padding: 25px 0;

          border-top:
            1px solid
            rgba(255,255,255,.08);

          border-bottom:
            1px solid
            rgba(255,255,255,.08);

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;
        }

        .mfn-developer-info {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .mfn-developer-label {
          color: #555;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size: 9px;
          font-weight: 700;

          letter-spacing: 2px;
        }

        .mfn-developer-name {
          display: flex;
          align-items: center;
          gap: 6px;

          color: #fff;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size: 12px;
          font-weight: 700;
        }

        .mfn-developer-name:hover {
          color: #c0392b;
        }

        .mfn-developer-button {
          display: flex;
          align-items: center;
          gap: 7px;

          padding: 9px 15px;

          border:
            1px solid
            rgba(255,255,255,.12);

          color: #aaa;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size: 9px;
          font-weight: 700;

          letter-spacing: 1px;

          text-transform: uppercase;

          transition: .2s;
        }

        .mfn-developer-button:hover {
          background: #c0392b;
          border-color: #c0392b;
          color: #fff;
        }


        /* =================================================
           FOOTER BOTTOM
        ================================================= */

        .mfn-footer-bottom {
          background: #050505;
        }

        .mfn-footer-bottom-inner {
          max-width: 1400px;
          margin: auto;

          padding:
            17px 25px;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 15px;

          flex-wrap: wrap;

          color: #4f4f4f;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size: 10px;
        }

        .mfn-footer-bottom strong {
          color: #c0392b;
        }

        .mfn-footer-legal {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .mfn-footer-legal a {
          color: #555;

          text-transform: uppercase;

          letter-spacing: 1px;
        }

        .mfn-footer-legal a:hover {
          color: #fff;
        }

        .mfn-top-button {
          width: 34px;
          height: 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          border:
            1px solid
            rgba(255,255,255,.12);

          background: transparent;

          color: #777;

          cursor: pointer;
        }

        .mfn-top-button:hover {
          background: #c0392b;
          border-color: #c0392b;
          color: #fff;
        }


        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (max-width: 1150px) {

          .mfn-brand-container {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .mfn-brand-buttons {
            justify-content: center;
          }

          .mfn-search-area {
            justify-content: center;
          }

          .mfn-nav-list {
            display: none;
          }

          .mfn-mobile-button {
            display: flex;
          }

          .mfn-footer-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

        }


        @media (max-width: 700px) {

          .mfn-header-top-inner {
            justify-content: center;
          }

          .mfn-header-info {
            justify-content: center;
          }

          .mfn-header-socials {
            display: none;
          }

          .mfn-header-separator {
            display: none;
          }

          .mfn-brand-container {
            min-height: 130px;
            padding: 22px 15px;
          }

          .mfn-main-brand h1 {
            font-size: 2.15rem;
          }

          .mfn-brand-kicker {
            letter-spacing: 3px;
          }

          .mfn-brand-tagline {
            font-size: 8px;
            letter-spacing: 1.5px;
          }

          .mfn-brand-tagline span {
            width: 20px;
          }

          .mfn-brand-buttons {
            display: none;
          }

          .mfn-search {
            width: 100%;
          }

          .mfn-nav-inner {
            padding: 0 15px;
          }

          .mfn-subscribe {
            display: none;
          }

          .mfn-breaking-label {
            padding: 0 12px;
          }

          .mfn-breaking-label {
            font-size: 9px;
          }

          .mfn-footer-container {
            padding:
              60px 20px
              25px;
          }

          .mfn-footer-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .mfn-footer-brand p {
            max-width: none;
          }

          .mfn-developer {
            flex-direction: column;
            align-items: flex-start;
          }

          .mfn-footer-bottom-inner {
            justify-content: center;
            text-align: center;
          }

        }

      `}</style>


      {/* ===================================================
          HEADER
      =================================================== */}

      <header>

        {/* TOP BAR */}

        <div className="mfn-header-top">

          <div className="mfn-header-top-inner">

            <div className="mfn-header-info">

              <span className="mfn-header-info-item">
                <CalendarDays />
                {today}
              </span>

              <span className="mfn-header-separator"></span>

              <span className="mfn-header-info-item">
                <MapPin />
                Kigali, Rwanda
              </span>

              <span className="mfn-header-separator"></span>

              <span className="mfn-header-info-item">
                <Sun />
                24°C
              </span>

            </div>


            <div className="mfn-header-socials">

              {SOCIALS.map((social) => {

                const Icon = social.icon;

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.label}
                    aria-label={social.label}
                    className="mfn-header-social"
                  >
                    <Icon />
                  </a>
                );

              })}

              <span className="mfn-header-separator"></span>

             

            </div>

          </div>

        </div>


        {/* BREAKING */}

        {breaking.length > 0 && (

          <div className="mfn-breaking">

            <div className="mfn-breaking-label">

              <span className="mfn-live-dot"></span>

              Breaking

            </div>


            <div className="mfn-breaking-track">

              <div className="mfn-ticker">

                {[...breaking, ...breaking].map(
                  (item, index) => (

                    <span
                      className="mfn-ticker-item"
                      key={`${item._id || item.id || item.title}-${index}`}
                    >
                      ◆ {item.title}
                    </span>

                  )
                )}

              </div>

            </div>

          </div>

        )}


        {/* BRAND */}

        <div className="mfn-brand-area">

          <div className="mfn-brand-container">


            <div className="mfn-brand-buttons">

              <Link
                to="/archive"
                className="mfn-brand-button"
              >
                Archive
              </Link>

              <Link
                to="/epaper"
                className="mfn-brand-button"
              >
                E-Paper
              </Link>

            </div>


            <Link
              to="/"
              className="mfn-main-brand"
            >

              <div className="mfn-brand-kicker">
                THE VOICE OF YOUTH
              </div>

              <h1>
                <span>M</span>ahoko{' '}
                <span>F</span>riday{' '}
                <span>N</span>ews
              </h1>

              <div className="mfn-brand-tagline">

                <span></span>

                Truth · Independence · Youth Voices

                <span></span>

              </div>

            </Link>


            <div className="mfn-search-area">

              <form
                onSubmit={handleSearch}
                className="mfn-search"
              >

                <Search size={16} />

                <input
                  value={searchQ}
                  onChange={(e) =>
                    setSearchQ(e.target.value)
                  }
                  placeholder="Search stories..."
                  aria-label="Search stories"
                />

                <button type="submit">
                  Search
                </button>

              </form>

            </div>

          </div>

        </div>


        {/* NAVIGATION */}

        <nav
          className={`mfn-nav ${
            scrolled ? 'scrolled' : ''
          }`}
        >

          <div className="mfn-nav-inner">

            <ul className="mfn-nav-list">

              {CATEGORIES.map((category) => (

                <li
                  key={category.label}
                  className="mfn-nav-item"
                >

                  {category.path ? (

                    <Link
                      to={category.path}
                      className="mfn-nav-link"
                    >

                      {category.icon && (

                        <span className="mfn-video-icon">
                          {category.icon}
                        </span>

                      )}

                      {category.label}

                    </Link>

                  ) : (

                    <>

                      <span className="mfn-nav-link">

                        {category.label}

                        <ChevronDown size={13} />

                      </span>


                      <div className="mfn-dropdown">

                        {category.sub?.map(
                          (sub) => (

                            <Link
                              key={sub.label}
                              to={sub.path}
                            >
                              {sub.label}
                            </Link>

                          )
                        )}

                      </div>

                    </>

                  )}

                </li>

              ))}

            </ul>


            <Link
              to="/subscribe"
              className="mfn-subscribe"
            >
              Subscribe
              <ArrowUp size={13} />
            </Link>


            <button
              className="mfn-mobile-button"
              onClick={() =>
                setMobileOpen(true)
              }
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>

          </div>

        </nav>

      </header>


      {/* ===================================================
          MOBILE MENU
      =================================================== */}

      {mobileOpen && (

        <div className="mfn-mobile-menu">

          <div className="mfn-mobile-header">

            <div className="mfn-mobile-logo">

              <span>M</span>ahoko Friday News

            </div>

            <button
              className="mfn-mobile-close"
              onClick={() =>
                setMobileOpen(false)
              }
              aria-label="Close menu"
            >
              <X size={25} />
            </button>

          </div>


          <form
            onSubmit={handleSearch}
            className="mfn-mobile-search"
          >

            <input
              value={searchQ}
              onChange={(e) =>
                setSearchQ(e.target.value)
              }
              placeholder="Search stories..."
            />

            <button type="submit">
              <Search size={18} />
            </button>

          </form>


          {CATEGORIES.map((category) => (

            category.path ? (

              <Link
                key={category.label}
                to={category.path}
                onClick={() =>
                  setMobileOpen(false)
                }
                className="mfn-mobile-link"
              >
                {category.label}
              </Link>

            ) : (

              <div key={category.label}>

                <div className="mfn-mobile-link">
                  {category.label}
                </div>

                <div className="mfn-mobile-sub">

                  {category.sub?.map((sub) => (

                    <Link
                      key={sub.label}
                      to={sub.path}
                      onClick={() =>
                        setMobileOpen(false)
                      }
                    >
                      {sub.label}
                    </Link>

                  ))}

                </div>

              </div>

            )

          ))}


          <Link
            to="/subscribe"
            onClick={() =>
              setMobileOpen(false)
            }
            className="mfn-mobile-subscribe"
          >
            Subscribe Now
          </Link>

        </div>

      )}


      {/* ===================================================
          PAGE CONTENT
      =================================================== */}

      <main>
        {children}
      </main>


      {/* ===================================================
          PREMIUM FOOTER
      =================================================== */}

      <footer className="mfn-footer">

        <div className="mfn-footer-container">

          <div className="mfn-footer-grid">


            {/* BRAND */}

            <div className="mfn-footer-brand">

              <div className="mfn-footer-mark">
                MFN
              </div>

              <h2>
                <span>M</span>ahoko{' '}
                <span>F</span>riday{' '}
                <span>N</span>ews
              </h2>

              <div className="mfn-footer-rule">

                <span></span>

                TRUTH · INDEPENDENCE

                <span></span>

              </div>

              <p>
                Reliable news from Rwanda and
                around the world. Mahoko Friday
                News gives young voices a platform
                and brings you stories that matter.
              </p>


              <div className="mfn-footer-socials">

                {SOCIALS.map((social) => {

                  const Icon = social.icon;

                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.label}
                      aria-label={social.label}
                      className="mfn-footer-social"
                    >
                      <Icon />
                    </a>
                  );

                })}

              </div>

            </div>


            {/* EXPLORE */}

            <div>

              <div className="mfn-footer-heading">
                Explore
              </div>

              <div className="mfn-footer-heading-line"></div>

              <ul className="mfn-footer-links">

                {[
                  'Business',
                  'Sport',
                  'Technology',
                  'Health',
                  'Education',
                  'Culture',
                  'Environment',
                ].map((category, index) => (

                  <li key={category}>

                    <Link
                      to={`/category/${category}`}
                    >

                      <span>
                        {String(index + 1).padStart(
                          2,
                          '0'
                        )}
                      </span>

                      {category}

                    </Link>

                  </li>

                ))}

              </ul>

            </div>


            {/* COMPANY */}

            <div>

              <div className="mfn-footer-heading">
                Company
              </div>

              <div className="mfn-footer-heading-line"></div>

              <ul className="mfn-footer-links">

                {[
                  ['About Us', '/about'],
                  ['Contact', '/contact'],
                  ['Archive', '/archive'],
                  ['E-Paper', '/epaper'],
                  ['Videos', '/videos'],
                  ['Newsletter', '/subscribe'],
                ].map(([label, path]) => (

                  <li key={label}>

                    <Link to={path}>

                      <span>→</span>

                      {label}

                    </Link>

                  </li>

                ))}

              </ul>


              <div className="mfn-footer-contact">

                <div>
                  <Mail />
                  mfnyouthvoices@gmail.com
                </div>

                <div>
                  <Phone />
                  +250 787 426 258
                </div>

                <div>
                  <MapPin />
                  Kigali, Rwanda
                </div>

              </div>

            </div>


            {/* NEWSLETTER */}

            <div className="mfn-newsletter">

              <div className="mfn-newsletter-label">
                STAY INFORMED
              </div>

              <h3>
                News that
                <br />
                matters.
              </h3>

              <p>
                Join our newsletter and get the
                most important stories delivered
                directly to your inbox.
              </p>


              <form
                onSubmit={handleSubscribe}
                className="mfn-newsletter-form"
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
                  <Send size={17} />
                </button>

              </form>


              {subMsg && (

                <small className="mfn-sub-message">
                  {subMsg}
                </small>

              )}

            </div>

          </div>


          {/* =================================================
              DEVELOPER
          ================================================= */}

          <div className="mfn-developer">

            <div className="mfn-developer-info">

              <span className="mfn-developer-label">
                WEBSITE DESIGNED & DEVELOPED BY
              </span>

              <a
                href="https://nsengiyumva-gerard.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="mfn-developer-name"
              >
                Gerard Nsengiyumva
                <ExternalLink size={14} />
              </a>

            </div>


            <a
              href="https://nsengiyumva-gerard.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="mfn-developer-button"
            >
              View Developer
              <ExternalLink size={13} />
            </a>

          </div>

        </div>


        {/* =================================================
            BOTTOM
        ================================================= */}

        <div className="mfn-footer-bottom">

          <div className="mfn-footer-bottom-inner">

            <div>

              © {new Date().getFullYear()}{' '}

              <strong>
                Mahoko Friday News
              </strong>

              {' · '}

              All Rights Reserved

            </div>


            <div className="mfn-footer-legal">

              <Link to="/privacy">
                Privacy
              </Link>

              <Link to="/terms">
                Terms
              </Link>

              <button
                onClick={scrollToTop}
                className="mfn-top-button"
                title="Back to top"
                aria-label="Back to top"
              >
                <ArrowUp size={16} />
              </button>

            </div>

          </div>

        </div>

      </footer>

    </div>

  );

}
