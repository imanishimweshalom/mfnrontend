import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';

import {
  GridCard,
  StoryCard,
  PopularItem,
  AdBanner,
  SectionLabel,
  NewsletterWidget,
  WhatsAppCTA,
  TagCloud,
  Spinner,
  EmptyState,
  imgUrl,
  timeAgo
} from '../../components/ui';

import { storiesAPI, adsAPI } from '../../utils/api';

export default function Home() {
  const [featured, setFeatured] = useState(null);
  const [latestStories, setLatestStories] = useState([]);
  const [recent, setRecent] = useState([]);
  const [popular, setPopular] = useState([]);
  const [byCategory, setByCategory] = useState({});
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ============================================================
     LATEST NEWS
  ============================================================ */

  const [latestIndex, setLatestIndex] = useState(0);
  const [latestAnimating, setLatestAnimating] = useState(false);

  /* ============================================================
     MOST READ
     5 AT A TIME
     ROTATE THROUGH 20 STORIES
  ============================================================ */

  const [mostReadStart, setMostReadStart] = useState(0);

  const animationTimerRef = useRef(null);
  const autoPlayRef = useRef(null);
  const mostReadTimerRef = useRef(null);

  /* ============================================================
     HELPERS
  ============================================================ */

  const getStoryDate = story => {
    const value =
      story?.created_at ||
      story?.createdAt ||
      story?.published_at ||
      story?.publishedAt ||
      story?.date ||
      null;

    if (!value) return 0;

    const timestamp = new Date(value).getTime();

    return Number.isNaN(timestamp) ? 0 : timestamp;
  };

  const sortNewestFirst = stories => {
    return [...stories].sort(
      (a, b) => getStoryDate(b) - getStoryDate(a)
    );
  };

  /* ============================================================
     LOAD HOME DATA
  ============================================================ */

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);

        const [storiesRes, popRes, adsRes] = await Promise.all([
          storiesAPI.getAll({
            limit: 20,
            status: 'published'
          }),

          storiesAPI.getPopular({
            limit: 20
          }),

          adsAPI.getAll()
        ]);

        if (!mounted) return;

        const rawStories =
          storiesRes?.data?.stories || [];

        /* ======================================================
           NEWEST FIRST
        ====================================================== */

        const allStories = sortNewestFirst(rawStories);

        /* ======================================================
           FEATURED
        ====================================================== */

        setFeatured(allStories[0] || null);

        /* ======================================================
           LATEST NEWS
           EXACTLY 5 NEWEST STORIES
        ====================================================== */

        const newestFive = allStories.slice(0, 5);

        setLatestStories(newestFive);

        /* ======================================================
           REMAINING STORIES
        ====================================================== */

        setRecent(allStories.slice(5));

        /* ======================================================
           MOST READ
           USE 20 NEWEST STORIES
           5 DISPLAYED AT ONCE
        ====================================================== */

        const latestTwenty = allStories.slice(0, 20);

        setPopular(latestTwenty);

        /* ======================================================
           ADS
           KEEP DATA AND POSITIONS
        ====================================================== */

        const adsData = Array.isArray(adsRes?.data)
          ? adsRes.data
          : adsRes?.data?.ads || [];

        setAds(adsData);

        /* ======================================================
           CATEGORY DATA
        ====================================================== */

        const categories = [
          'Business',
          'Sport',
          'Technology',
          'Health',
          'Culture',
          'Environment'
        ];

        const categoryResults = {};

        await Promise.all(
          categories.map(async category => {
            try {
              const response = await storiesAPI.getAll({
                category,
                limit: 4,
                status: 'published'
              });

              const categoryStories =
                response?.data?.stories || [];

              categoryResults[category] =
                sortNewestFirst(categoryStories);
            } catch (error) {
              console.error(
                `Failed to load ${category} stories:`,
                error
              );

              categoryResults[category] = [];
            }
          })
        );

        if (!mounted) return;

        setByCategory(categoryResults);
      } catch (error) {
        console.error(
          'Failed to load homepage:',
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  /* ============================================================
     RESET LATEST INDEX
  ============================================================ */

  useEffect(() => {
    if (
      latestStories.length > 0 &&
      latestIndex >= latestStories.length
    ) {
      setLatestIndex(0);
    }
  }, [latestStories, latestIndex]);

  /* ============================================================
     RESET MOST READ
  ============================================================ */

  useEffect(() => {
    if (
      popular.length > 0 &&
      mostReadStart >= popular.length
    ) {
      setMostReadStart(0);
    }
  }, [popular, mostReadStart]);

  /* ============================================================
     LATEST NEWS AUTO PLAY
     EVERY 10 SECONDS
  ============================================================ */

  useEffect(() => {
    if (latestStories.length <= 1) {
      return undefined;
    }

    autoPlayRef.current = setInterval(() => {
      setLatestAnimating(true);

      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }

      animationTimerRef.current = setTimeout(() => {
        setLatestIndex(prev => (
          (prev + 1) % latestStories.length
        ));

        setLatestAnimating(false);
      }, 450);
    }, 10000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }

      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, [latestStories.length]);

  /* ============================================================
     MOST READ AUTO ROTATION
     EVERY 5 SECONDS
     ONE STORY MOVES UP
  ============================================================ */

  useEffect(() => {
    if (popular.length <= 5) {
      return undefined;
    }

    mostReadTimerRef.current = setInterval(() => {
      setMostReadStart(prev => (
        (prev + 1) % popular.length
      ));
    }, 5000);

    return () => {
      if (mostReadTimerRef.current) {
        clearInterval(mostReadTimerRef.current);
      }
    };
  }, [popular.length]);

  /* ============================================================
     GET 5 MOST READ STORIES
  ============================================================ */

  const visibleMostRead = [];

  if (popular.length > 0) {
    for (
      let i = 0;
      i < Math.min(5, popular.length);
      i++
    ) {
      visibleMostRead.push({
        story:
          popular[
            (mostReadStart + i) % popular.length
          ],
        originalIndex:
          (mostReadStart + i) % popular.length
      });
    }
  }

  /* ============================================================
     MANUAL LATEST STORY CHANGE
  ============================================================ */

  const changeLatestStory = index => {
    if (
      index === latestIndex ||
      !latestStories[index]
    ) {
      return;
    }

    setLatestAnimating(true);

    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
    }

    animationTimerRef.current = setTimeout(() => {
      setLatestIndex(index);
      setLatestAnimating(false);
    }, 350);
  };

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <PublicLayout>
        <Spinner />
      </PublicLayout>
    );
  }

  /* ============================================================
     EMPTY STATE
  ============================================================ */

  if (
    !featured &&
    latestStories.length === 0 &&
    recent.length === 0
  ) {
    return (
      <PublicLayout>
        <EmptyState
          icon="📰"
          title="No stories yet"
          message="Check back soon for the latest news."
        />
      </PublicLayout>
    );
  }

  /* ============================================================
     OTHER STORIES
  ============================================================ */

  const gridStories = recent.slice(0, 4);
  const hotStories = recent.slice(4, 10);

  const currentLatest =
    latestStories[latestIndex] ||
    latestStories[0] ||
    null;

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <>
      <style>{`

        /* ========================================================
           GLOBAL HOME
        ======================================================== */

        .home-page {
          width: 100%;
          background: #f8f6f0;
        }

        /* ========================================================
           TOP ADVERTISEMENT
           FULL BLACK
           LARGE PROFESSIONAL HEIGHT
        ======================================================== */

        .home-top-ad-section {
          width: 100%;
          min-height: 150px;
          box-sizing: border-box;
          background: #000;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-bottom: 1px solid #1c1c1c;
          position: relative;
          z-index: 1000;
        }

        .top-ad-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .top-ad-label {
          font-family:
            "Barlow Condensed",
            sans-serif;
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: #555;
          text-align: center;
          margin-bottom: 7px;
        }

        .top-ad-wrapper {
          width: 100%;
          height: 110px;
          overflow: hidden;
          border: 1px solid #202020;
          border-radius: 3px;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 10px 35px rgba(0, 0, 0, .45);
        }

        .top-ad-wrapper > div {
          width: 100% !important;
          height: 100% !important;
          display: flex !important;
          flex-direction: row !important;
        }

        .top-ad-wrapper a {
          flex: 1 1 50% !important;
          width: 50% !important;
          height: 100% !important;
          display: block !important;
        }

        .top-ad-wrapper img {
          width: 100% !important;
          height: 110px !important;
          object-fit: cover !important;
          display: block !important;
        }

        /* ========================================================
           MAIN HOME CONTAINER
        ======================================================== */

        .home-content {
          width: 100%;
          max-width: 1260px;
          margin: 0 auto;
          padding: 28px 20px 40px;
          box-sizing: border-box;
        }

        /* ========================================================
           HERO
        ======================================================== */

        .home-hero-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr) 340px;
          gap: 2px;
          background: #000;
          margin-bottom: 2px;
          min-height: 520px;
        }

        /* ========================================================
           LATEST NEWS HERO
        ======================================================== */

        .hero-latest-news {
          position: relative;
          width: 100%;
          height: 520px;
          min-height: 520px;
          overflow: hidden;
          background: #000;
        }

        .hero-latest-slide {
          position: relative;
          display: block;
          width: 100%;
          height: 100%;
          min-height: 520px;
          overflow: hidden;
          text-decoration: none;
          color: #fff;
          background: #000;
        }

        .hero-latest-slide img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transform: scale(1);
          transition:
            transform 10s ease,
            opacity .5s ease;
          background: #000;
        }

        .hero-latest-slide:hover img {
          transform: scale(1.045);
        }

        /* ========================================================
           PROFESSIONAL BLACK COVER
        ======================================================== */

        .hero-latest-slide::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;

          background:
            linear-gradient(
              to bottom,
              rgba(0, 0, 0, .03) 0%,
              rgba(0, 0, 0, .10) 25%,
              rgba(0, 0, 0, .45) 55%,
              rgba(0, 0, 0, .97) 100%
            );
        }

        /* ========================================================
           HERO OVERLAY
        ======================================================== */

        .hero-latest-overlay {
          position: absolute;
          inset: 0;
          z-index: 5;

          display: flex;
          flex-direction: column;
          justify-content: flex-end;

          padding:
            55px 55px 50px;

          background:
            linear-gradient(
              to right,
              rgba(0, 0, 0, .20),
              transparent 65%
            );
        }

        .hero-latest-category {
          font-family:
            "Barlow Condensed",
            sans-serif;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #e8b84b;
          margin-bottom: 12px;
        }

        .hero-latest-title {
          font-family:
            "Playfair Display",
            Georgia,
            serif;

          font-size:
            clamp(2rem, 4vw, 3.6rem);

          font-weight: 700;
          line-height: 1.08;

          margin: 0 0 16px;

          max-width: 950px;

          color: #fff;

          text-shadow:
            0 3px 15px rgba(0, 0, 0, .75);
        }

        .hero-latest-description {
          max-width: 760px;

          margin: 0 0 18px;

          font-size: 15px;

          line-height: 1.65;

          color:
            rgba(255, 255, 255, .82);

          text-shadow:
            0 2px 8px rgba(0, 0, 0, .65);
        }

        .hero-latest-meta {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;

          font-family:
            "Barlow Condensed",
            sans-serif;

          font-size: 11px;

          letter-spacing: .5px;

          color:
            rgba(255, 255, 255, .72);
        }

        /* ========================================================
           LATEST NEWS ANIMATION
        ======================================================== */

        .hero-latest-changing {
          animation:
            heroLatestProfessional
            .55s
            ease;
        }

        @keyframes heroLatestProfessional {

          0% {
            opacity: 0;
            transform:
              translateY(18px)
              scale(.99);
          }

          100% {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }

        }

        /* ========================================================
           DOTS
        ======================================================== */

        .hero-latest-dots {
          position: absolute;

          right: 35px;
          bottom: 32px;

          z-index: 20;

          display: flex;
          align-items: center;
          gap: 8px;
        }

        .hero-latest-dots button {
          width: 8px;
          height: 8px;

          padding: 0;

          border: 0;

          border-radius: 50%;

          background:
            rgba(255, 255, 255, .35);

          cursor: pointer;

          transition:
            all .3s ease;
        }

        .hero-latest-dots button:hover {
          background:
            rgba(255, 255, 255, .85);
        }

        .hero-latest-dots button.active {
          width: 30px;

          border-radius: 6px;

          background: #e8b84b;
        }

        /* ========================================================
           PROGRESS BAR
        ======================================================== */

        .hero-latest-progress {
          position: absolute;

          left: 0;
          bottom: 0;

          width: 100%;
          height: 4px;

          background:
            rgba(255, 255, 255, .12);

          z-index: 30;

          overflow: hidden;
        }

        .hero-latest-progress-inner {
          width: 0;
          height: 100%;

          background: #e8b84b;

          animation:
            heroLatestProgress
            10s
            linear
            forwards;
        }

        @keyframes heroLatestProgress {

          from {
            width: 0;
          }

          to {
            width: 100%;
          }

        }

        /* ========================================================
           HERO SIDEBAR
        ======================================================== */

        .home-hero-sidebar {
          display: flex;
          flex-direction: column;
          gap: 2px;
          background: #000;
        }

        .home-hero-sidebar > a {
          position: relative;
          overflow: hidden;
          background: #0d0d0d;
          flex: 1;
          min-height: 120px;
          display: flex;
          align-items: flex-end;
          text-decoration: none;
        }

        .hero-sidebar-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: .65;
          transition:
            transform .6s ease,
            opacity .6s ease;
        }

        .home-hero-sidebar > a:hover
        .hero-sidebar-image {
          transform: scale(1.05);
          opacity: .78;
        }

        .hero-sidebar-content {
          position: relative;
          width: 100%;
          padding: 14px;
          background:
            linear-gradient(
              transparent,
              rgba(0, 0, 0, .92)
            );
        }

        .hero-sidebar-category {
          font-family:
            "Barlow Condensed",
            sans-serif;

          font-size: 9px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;

          color: #e8b84b;

          margin-bottom: 3px;
        }

        .hero-sidebar-title {
          font-family:
            "Playfair Display",
            serif;

          font-size: .82rem;
          font-weight: 700;

          color: #fff;

          line-height: 1.25;
        }

        .hero-sidebar-time {
          font-family:
            "Barlow Condensed",
            sans-serif;

          font-size: 9px;

          color:
            rgba(255, 255, 255, .42);

          margin-top: 3px;
        }

        /* ========================================================
           MAIN + SIDEBAR
        ======================================================== */

        .home-main-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr) 340px;
          gap: 36px;
          align-items: start;
        }

        .home-sidebar-sticky {
          position: sticky;
          top: 72px;
        }

        /* ========================================================
           HOT STORIES
        ======================================================== */

        .home-hot-story {
          display: flex;
          gap: 20px;

          padding: 20px 0;

          border-bottom:
            1px solid #e8e4d8;

          text-decoration: none;
          color: inherit;
        }

        .home-hot-story-img {
          width: 160px;
          height: 110px;

          object-fit: cover;

          flex-shrink: 0;
        }

        /* ========================================================
           HIDDEN OLD CAROUSEL AREA
           TITLE REMAINS IN ORIGINAL LOCATION
        ======================================================== */

        .latest-news-carousel {
          position: relative;
          width: 100%;
          height: 0;
          overflow: hidden;
          margin-bottom: 0;
        }

        /* ========================================================
           MOST READ
        ======================================================== */

        .most-read-list {
          position: relative;
          overflow: hidden;
        }

        .most-read-track {
          display: flex;
          flex-direction: column;
        }

        .most-read-item {
          animation:
            mostReadSlideUp
            .65s
            ease;
        }

        @keyframes mostReadSlideUp {

          0% {
            opacity: 0;
            transform:
              translateY(35px);
          }

          100% {
            opacity: 1;
            transform:
              translateY(0);
          }

        }

        .most-read-item + .most-read-item {
          margin-top: 2px;
        }

        .most-read-counter {
          display: flex;
          justify-content: space-between;
          align-items: center;

          font-family:
            "Barlow Condensed",
            sans-serif;

          font-size: 9px;

          letter-spacing: 1.5px;

          text-transform: uppercase;

          color: #999;

          margin-top: 12px;

          padding-top: 10px;

          border-top:
            1px solid #eee;
        }

        /* ========================================================
           TABLET
        ======================================================== */

        @media (max-width: 1100px) {

          .home-hero-grid {
            grid-template-columns:
              minmax(0, 1fr) 300px;
          }

          .home-main-grid {
            grid-template-columns:
              minmax(0, 1fr) 300px;
            gap: 24px;
          }

          .hero-latest-overlay {
            padding:
              42px 40px 40px;
          }

          .hero-latest-title {
            font-size:
              clamp(1.8rem, 4vw, 3rem);
          }

        }

        /* ========================================================
           TABLET / SMALL LAPTOP
        ======================================================== */

        @media (max-width: 1024px) {

          .home-main-grid {
            grid-template-columns:
              1fr !important;
          }

          .home-sidebar-sticky {
            position: static !important;
          }

          .hero-latest-news {
            height: 460px;
            min-height: 460px;
          }

          .hero-latest-slide {
            min-height: 460px;
          }

        }

        /* ========================================================
           MOBILE
        ======================================================== */

        @media (max-width: 768px) {

          .home-top-ad-section {
            min-height: 125px;
            padding: 12px;
          }

          .top-ad-wrapper {
            height: 95px;
          }

          .top-ad-wrapper img {
            height: 95px !important;
          }

          .top-ad-wrapper > div {
            flex-direction:
              column !important;
          }

          .top-ad-wrapper a {
            width: 100% !important;
            height: 100% !important;
            flex: 1 1 100% !important;
          }

          .home-content {
            padding:
              18px 12px 32px;
          }

          .home-hero-grid {
            grid-template-columns:
              1fr !important;
            min-height: auto;
          }

          .hero-latest-news {
            height: 390px;
            min-height: 390px;
          }

          .hero-latest-slide {
            min-height: 390px;
          }

          .hero-latest-overlay {
            padding:
              28px 25px 34px;
          }

          .hero-latest-title {
            font-size:
              clamp(1.55rem, 6vw, 2.2rem);

            line-height: 1.1;
          }

          .hero-latest-description {
            font-size: 13px;
            line-height: 1.5;
          }

          .hero-latest-dots {
            right: 20px;
            bottom: 24px;
          }

          .home-hero-sidebar {
            flex-direction:
              row !important;
          }

          .home-hero-sidebar > a {
            flex:
              1 1 50% !important;

            min-height:
              160px !important;
          }

        }

        /* ========================================================
           SMALL MOBILE
        ======================================================== */

        @media (max-width: 600px) {

          .home-top-ad-section {
            min-height: 105px;
            padding: 8px;
          }

          .top-ad-wrapper {
            height: 80px;
          }

          .top-ad-wrapper img {
            height: 80px !important;
          }

          .hero-latest-news {
            height: 350px;
            min-height: 350px;
          }

          .hero-latest-slide {
            min-height: 350px;
          }

          .hero-latest-overlay {
            padding:
              22px 20px 28px;
          }

          .hero-latest-category {
            font-size: 10px;
            letter-spacing: 2px;
          }

          .hero-latest-title {
            font-size: 1.45rem;
          }

          .hero-latest-description {
            display: none;
          }

          .hero-latest-meta {
            font-size: 9px;
            gap: 10px;
          }

          .hero-latest-dots {
            right: 15px;
            bottom: 18px;
          }

          .home-hero-sidebar {
            flex-direction:
              column !important;
          }

          .home-hero-sidebar > a {
            flex:
              1 1 100% !important;

            min-height:
              145px !important;
          }

          .home-hot-story {
            flex-direction:
              column !important;

            gap: 12px !important;
          }

          .home-hot-story-img {
            width: 100% !important;
            height: 200px !important;
          }

        }

      `}</style>

      {/* =========================================================
          TOP ADVERTISEMENT
          SAME POSITION
      ========================================================= */}

      {ads.length > 0 && (
        <div className="home-top-ad-section">

          <div className="top-ad-container">

            <div className="top-ad-label">
              Advertisement
            </div>

            <div className="top-ad-wrapper">

              <AdBanner
                ads={ads.slice(0, 2)}
                height={110}
              />

            </div>

          </div>

        </div>
      )}

      <PublicLayout>

        <div className="home-page">

          <div className="home-content">

            {/* =====================================================
                HERO STRUCTURE
            ===================================================== */}

            {featured && (
              <div className="home-hero-grid">

                {/* =================================================
                    LATEST NEWS ANIMATION
                ================================================= */}

                {currentLatest && (
                  <div
                    className={`
                      hero-latest-news
                      ${
                        latestAnimating
                          ? 'hero-latest-changing'
                          : ''
                      }
                    `}
                  >

                    <Link
                      to={`/story/${
                        currentLatest._id ||
                        currentLatest.id
                      }`}
                      className="hero-latest-slide"
                    >

                      <img
                        key={
                          currentLatest._id ||
                          currentLatest.id
                        }
                        src={imgUrl(
                          currentLatest.image
                        )}
                        alt={
                          currentLatest.title ||
                          'Latest news'
                        }
                        loading="eager"
                        onError={event => {
                          event.currentTarget.onerror =
                            null;

                          event.currentTarget.src =
                            '/placeholder.jpg';
                        }}
                      />

                      <div className="hero-latest-overlay">

                        <div className="hero-latest-category">
                          {currentLatest.category ||
                            'News'}
                        </div>

                        <h2 className="hero-latest-title">
                          {currentLatest.title}
                        </h2>

                        <p className="hero-latest-description">
                          {(currentLatest.description || '')
                            .replace(/<[^>]+>/g, '')
                            .substring(0, 180)}
                        </p>

                        <div className="hero-latest-meta">

                          <span>
                            👤{' '}
                            {currentLatest.author ||
                              'Unknown'}
                          </span>

                          <span>
                            🕐{' '}
                            {timeAgo(
                              currentLatest.created_at ||
                              currentLatest.createdAt
                            )}
                          </span>

                          <span>
                            👁{' '}
                            {Number(
                              currentLatest.views || 0
                            ).toLocaleString()}
                          </span>

                        </div>

                      </div>

                    </Link>

                    {/* DOTS */}

                    {latestStories.length > 1 && (
                      <div className="hero-latest-dots">

                        {latestStories.map(
                          (story, index) => (

                            <button
                              key={
                                story._id ||
                                story.id ||
                                index
                              }
                              type="button"
                              className={
                                index === latestIndex
                                  ? 'active'
                                  : ''
                              }
                              onClick={() =>
                                changeLatestStory(
                                  index
                                )
                              }
                              aria-label={`Show latest story ${
                                index + 1
                              }`}
                            />

                          )
                        )}

                      </div>
                    )}

                    {/* PROGRESS */}

                    {latestStories.length > 1 && (
                      <div className="hero-latest-progress">

                        <div
                          key={latestIndex}
                          className="hero-latest-progress-inner"
                        />

                      </div>
                    )}

                  </div>
                )}

                {/* =================================================
                    HERO SIDEBAR
                ================================================= */}

                <div className="home-hero-sidebar">

                  {recent.slice(0, 2).map(story => (

                    <Link
                      key={
                        story._id ||
                        story.id
                      }
                      to={`/story/${
                        story._id ||
                        story.id
                      }`}
                    >

                      <img
                        className="hero-sidebar-image"
                        src={imgUrl(story.image)}
                        alt=""
                        loading="lazy"
                        onError={event => {
                          event.currentTarget.onerror =
                            null;

                          event.currentTarget.src =
                            '/placeholder.jpg';
                        }}
                      />

                      <div className="hero-sidebar-content">

                        <div className="hero-sidebar-category">
                          {story.category}
                        </div>

                        <div className="hero-sidebar-title">
                          {(story.title || '')
                            .substring(0, 65)}
                        </div>

                        <div className="hero-sidebar-time">
                          {timeAgo(
                            story.created_at ||
                            story.createdAt
                          )}
                        </div>

                      </div>

                    </Link>

                  ))}

                </div>

              </div>
            )}

            {/* =====================================================
                ADVERTISEMENT
                SAME POSITION
            ===================================================== */}

            <AdBanner
              ads={ads.slice(0, 3)}
              height={210}
            />

            {/* =====================================================
                MAIN + SIDEBAR
            ===================================================== */}

            <div className="home-main-grid">

              {/* ===================================================
                  MAIN COLUMN
              =================================================== */}

              <div>

                {/* ===============================================
                    LATEST NEWS TITLE
                    STAYS HERE
                =============================================== */}

                <SectionLabel>
                  Latest News
                </SectionLabel>

                {/* ===============================================
                    STORY GRID
                =============================================== */}

                {gridStories.length > 0 && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fill,minmax(230px,1fr))',
                      gap: 20,
                      marginBottom: 28
                    }}
                  >

                    {gridStories.map(story => (

                      <GridCard
                        key={
                          story._id ||
                          story.id
                        }
                        story={story}
                      />

                    ))}

                  </div>
                )}

                {/* ===============================================
                    BUSINESS / SPORT / TECHNOLOGY
                =============================================== */}

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill,minmax(200px,1fr))',
                    gap: 28,
                    marginBottom: 28
                  }}
                >

                  {[
                    'Business',
                    'Sport',
                    'Technology'
                  ].map(category => (

                    <div key={category}>

                      <SectionLabel>

                        <Link
                          to={`/category/${category}`}
                          style={{
                            color: '#c0392b',
                            textDecoration: 'none'
                          }}
                        >
                          {category}
                        </Link>

                      </SectionLabel>

                      {(byCategory[category] || [])
                        .slice(0, 3)
                        .map(story => (

                          <StoryCard
                            key={
                              story._id ||
                              story.id
                            }
                            story={story}
                          />

                        ))}

                      <Link
                        to={`/category/${category}`}
                        style={{
                          fontFamily:
                            "'Barlow Condensed',sans-serif",
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: 2,
                          textTransform:
                            'uppercase',
                          color: '#c0392b',
                          textDecoration: 'none'
                        }}
                      >
                        All {category} →
                      </Link>

                    </div>

                  ))}

                </div>

                {/* =================================================
                    SECOND AD
                    SAME POSITION
                ================================================= */}

                <AdBanner
                  ads={ads.slice(3)}
                  height={210}
                />

                {/* =================================================
                    MORE STORIES
                ================================================= */}

                <SectionLabel>
                  More Stories
                </SectionLabel>

                {hotStories.map(story => (

                  <Link
                    key={
                      story._id ||
                      story.id
                    }
                    to={`/story/${
                      story._id ||
                      story.id
                    }`}
                    className="home-hot-story"
                  >

                    <img
                      className="home-hot-story-img"
                      src={imgUrl(story.image)}
                      alt=""
                      loading="lazy"
                      onError={event => {
                        event.currentTarget.onerror =
                          null;

                        event.currentTarget.src =
                          '/placeholder.jpg';
                      }}
                    />

                    <div>

                      <div
                        style={{
                          fontFamily:
                            "'Barlow Condensed',sans-serif",
                          fontSize: 9,
                          fontWeight: 800,
                          letterSpacing: 2,
                          textTransform:
                            'uppercase',
                          color: '#c0392b',
                          marginBottom: 6
                        }}
                      >
                        {story.category}
                      </div>

                      <div
                        style={{
                          fontFamily:
                            "'Playfair Display',serif",
                          fontSize: '1.1rem',
                          lineHeight: 1.3,
                          marginBottom: 6
                        }}
                      >
                        {(story.title || '')
                          .substring(0, 90)}
                      </div>

                      <p
                        style={{
                          fontSize: 13,
                          color: '#5a5a5a',
                          fontStyle: 'italic',
                          lineHeight: 1.5,
                          marginBottom: 8
                        }}
                      >
                        {(story.description || '')
                          .replace(/<[^>]+>/g, '')
                          .substring(0, 110)}
                      </p>

                      <div
                        style={{
                          fontFamily:
                            "'Barlow Condensed',sans-serif",
                          fontSize: 10,
                          color: '#aaa',
                          display: 'flex',
                          gap: 12,
                          flexWrap: 'wrap'
                        }}
                      >

                        <span>
                          👤{' '}
                          {story.author ||
                            'Unknown'}
                        </span>

                        <span>
                          🕐{' '}
                          {timeAgo(
                            story.created_at ||
                            story.createdAt
                          )}
                        </span>

                        <span>
                          👁{' '}
                          {Number(
                            story.views || 0
                          ).toLocaleString()}
                        </span>

                      </div>

                    </div>

                  </Link>

                ))}

                {/* =================================================
                    HEALTH / CULTURE
                ================================================= */}

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill,minmax(200px,1fr))',
                    gap: 28,
                    marginTop: 28
                  }}
                >

                  {[
                    'Health',
                    'Culture'
                  ].map(category => (

                    <div key={category}>

                      <SectionLabel>

                        <Link
                          to={`/category/${category}`}
                          style={{
                            color: '#c0392b',
                            textDecoration: 'none'
                          }}
                        >
                          {category}
                        </Link>

                      </SectionLabel>

                      {(byCategory[category] || [])
                        .slice(0, 3)
                        .map(story => (

                          <StoryCard
                            key={
                              story._id ||
                              story.id
                            }
                            story={story}
                          />

                        ))}

                    </div>

                  ))}

                </div>

              </div>

              {/* ===================================================
                  SIDEBAR
              =================================================== */}

              <aside>

                <div className="home-sidebar-sticky">

                  {/* =============================================
                      MOST READ
                      5 AT ONCE
                      ROTATES EVERY 5 SECONDS
                  ============================================= */}

                  <div
                    style={{
                      background: '#fff',
                      border:
                        '1px solid #e8e4d8',
                      padding: 20,
                      marginBottom: 22,
                      borderTop:
                        '3px solid #c0392b'
                    }}
                  >

                    <div
                      style={{
                        fontFamily:
                          "'Barlow Condensed',sans-serif",
                        fontWeight: 800,
                        fontSize: 11,
                        letterSpacing: 2.5,
                        textTransform:
                          'uppercase',
                        borderBottom:
                          '3px solid #c0392b',
                        paddingBottom: 10,
                        marginBottom: 16
                      }}
                    >
                      🔥 Most Read
                    </div>

                    {popular.length > 0 && (

                      <div className="most-read-list">

                        <div
                          key={mostReadStart}
                          className="most-read-track"
                        >

                          {visibleMostRead.map(
                            ({
                              story,
                              originalIndex
                            }) => (

                              <div
                                key={
                                  story?._id ||
                                  story?.id ||
                                  `${mostReadStart}-${originalIndex}`
                                }
                                className="most-read-item"
                              >

                                <PopularItem
                                  story={story}
                                  rank={
                                    originalIndex + 1
                                  }
                                />

                              </div>

                            )
                          )}

                        </div>

                        <div className="most-read-counter">

                          <span>
                            Latest 20
                          </span>

                          <span>
                            {Math.min(
                              mostReadStart + 1,
                              popular.length
                            )}
                            {' - '}
                            {Math.min(
                              mostReadStart + 5,
                              popular.length
                            )}
                            {' / '}
                            {popular.length}
                          </span>

                        </div>

                      </div>

                    )}

                  </div>

                  {/* =============================================
                      NEWSLETTER
                  ============================================= */}

                  <NewsletterWidget />

                  {/* =============================================
                      ENVIRONMENT
                  ============================================= */}

                  <div
                    style={{
                      background: '#fff',
                      border:
                        '1px solid #e8e4d8',
                      padding: 20,
                      marginBottom: 22
                    }}
                  >

                    <SectionLabel>
                      Environment
                    </SectionLabel>

                    {(byCategory.Environment || [])
                      .slice(0, 3)
                      .map(story => (

                        <StoryCard
                          key={
                            story._id ||
                            story.id
                          }
                          story={story}
                        />

                      ))}

                  </div>

                  {/* =============================================
                      WHATSAPP
                  ============================================= */}

                  <WhatsAppCTA />

                  {/* =============================================
                      TOPICS
                  ============================================= */}

                  <div
                    style={{
                      background: '#fff',
                      border:
                        '1px solid #e8e4d8',
                      padding: 20
                    }}
                  >

                    <div
                      style={{
                        fontFamily:
                          "'Barlow Condensed',sans-serif",
                        fontWeight: 800,
                        fontSize: 11,
                        letterSpacing: 2.5,
                        textTransform:
                          'uppercase',
                        borderBottom:
                          '3px solid #0d0d0d',
                        paddingBottom: 10,
                        marginBottom: 16
                      }}
                    >
                      🏷 Topics
                    </div>

                    <TagCloud
                      tags={[
                        'Rwanda',
                        'Kigali',
                        'Sport',
                        'Business',
                        'Technology',
                        'Health',
                        'Culture',
                        'Africa',
                        'Education',
                        'EAC',
                        'BNR',
                        'RSE'
                      ]}
                    />

                  </div>

                </div>

              </aside>

            </div>

          </div>

        </div>

      </PublicLayout>
    </>
  );
}
