
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';

import {
  HeroCard,
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
     SHOW 5 AT A TIME
     ROTATE THROUGH 20 LATEST STORIES
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
            limit: 5
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

           Keep the original featured story/data structure.
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

           We use the 20 newest stories.
           Five are displayed at once.
        ====================================================== */

        const latestTwenty = allStories.slice(0, 20);

        setPopular(latestTwenty);

        /* ======================================================
           ADS

           DO NOT CHANGE ADS DATA OR POSITIONS
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
    if (latestIndex >= latestStories.length) {
      setLatestIndex(0);
    }
  }, [latestStories, latestIndex]);

  /* ============================================================
     RESET MOST READ START
  ============================================================ */

  useEffect(() => {
    if (mostReadStart >= popular.length) {
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
        setLatestIndex(prev => {
          return (
            (prev + 1) %
            latestStories.length
          );
        });

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
     MOST READ VERTICAL ANIMATION

     5 STORIES VISIBLE AT ONCE.
     EVERY 5 SECONDS THE LIST MOVES UP ONE STORY.
  ============================================================ */

  useEffect(() => {
    if (popular.length <= 5) {
      return undefined;
    }

    mostReadTimerRef.current = setInterval(() => {
      setMostReadStart(prev => {
        return (
          (prev + 1) %
          popular.length
        );
      });
    }, 5000);

    return () => {
      if (mostReadTimerRef.current) {
        clearInterval(
          mostReadTimerRef.current
        );
      }
    };
  }, [popular.length]);

  /* ============================================================
     GET 5 MOST READ STORIES TO DISPLAY
  ============================================================ */

  const visibleMostRead = [];

  if (popular.length > 0) {
    for (let i = 0; i < Math.min(5, popular.length); i++) {
      visibleMostRead.push({
        story:
          popular[
            (mostReadStart + i) %
            popular.length
          ],
        originalIndex:
          (mostReadStart + i) %
          popular.length
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

        /* ====================================================
           TOP AD
           UNCHANGED
        ==================================================== */

        .home-top-ad-section {
          width: 100%;
          box-sizing: border-box;
          background: #0d0d0d;
          padding: 10px 16px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-bottom: 1px solid #333;
          position: relative;
          z-index: 1000;
        }

        .top-ad-wrapper {
          width: 100%;
          max-width: 970px;
          height: 90px;
          overflow: hidden;
          border: 1px solid #333;
          border-radius: 4px;
          display: flex;
          background: #111;
        }

        .top-ad-wrapper > div {
          width: 100% !important;
          height: 100% !important;
          display: flex !important;
          flex-direction: row !important;
        }

        .top-ad-wrapper a {
          flex: 1 1 50% !important;
          height: 100% !important;
          display: block !important;
        }

        .top-ad-wrapper img {
          width: 100% !important;
          height: 90px !important;
          object-fit: cover !important;
          display: block !important;
        }

        /* ====================================================
           HERO STRUCTURE
           KEEP SAME STRUCTURE
        ==================================================== */

        .home-hero-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 2px;
          background: #e8e4d8;
          margin-bottom: 2px;
        }

        .home-hero-sidebar {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        /* ====================================================
           LATEST NEWS ANIMATION INSIDE HERO MAIN AREA
        ==================================================== */

        .hero-latest-news {
          position: relative;
          width: 100%;
          min-height: 380px;
          height: 100%;
          overflow: hidden;
          background: #0d0d0d;
        }

        .hero-latest-slide {
          position: relative;
          display: block;
          width: 100%;
          height: 100%;
          min-height: 380px;
          overflow: hidden;
          text-decoration: none;
          color: #fff;
        }

        .hero-latest-slide img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scale(1);
          transition:
            transform 10s ease,
            opacity .45s ease;
        }

        .hero-latest-slide:hover img {
          transform: scale(1.04);
        }

        .hero-latest-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 36px;
          background:
            linear-gradient(
              to bottom,
              rgba(0,0,0,0) 10%,
              rgba(0,0,0,.18) 38%,
              rgba(0,0,0,.95) 100%
            );
        }

        .hero-latest-category {
          font-family:
            "Barlow Condensed",
            sans-serif;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: #e8b84b;
          margin-bottom: 8px;
        }

        .hero-latest-title {
          font-family:
            "Playfair Display",
            serif;
          font-size:
            clamp(1.5rem, 3vw, 2.6rem);
          font-weight: 700;
          line-height: 1.12;
          margin: 0 0 12px;
          max-width: 900px;
          text-shadow:
            0 2px 8px rgba(0,0,0,.45);
        }

        .hero-latest-description {
          max-width: 780px;
          margin: 0 0 14px;
          font-size: 14px;
          line-height: 1.55;
          color:
            rgba(255,255,255,.82);
        }

        .hero-latest-meta {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          font-family:
            "Barlow Condensed",
            sans-serif;
          font-size: 10px;
          color:
            rgba(255,255,255,.68);
        }

        .hero-latest-changing {
          animation:
            heroLatestFade .45s ease;
        }

        @keyframes heroLatestFade {
          0% {
            opacity: .05;
            transform: translateY(10px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-latest-dots {
          position: absolute;
          right: 24px;
          bottom: 22px;
          display: flex;
          align-items: center;
          gap: 7px;
          z-index: 20;
        }

        .hero-latest-dots button {
          width: 8px;
          height: 8px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background:
            rgba(255,255,255,.45);
          cursor: pointer;
          transition:
            width .25s ease,
            background .25s ease;
        }

        .hero-latest-dots button:hover {
          background:
            rgba(255,255,255,.85);
        }

        .hero-latest-dots button.active {
          width: 26px;
          border-radius: 5px;
          background: #e8b84b;
        }

        .hero-latest-progress {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 3px;
          background:
            rgba(255,255,255,.15);
          z-index: 30;
          overflow: hidden;
        }

        .hero-latest-progress-inner {
          width: 0;
          height: 100%;
          background: #e8b84b;
          animation:
            heroLatestProgress 10s linear forwards;
        }

        @keyframes heroLatestProgress {
          from {
            width: 0;
          }

          to {
            width: 100%;
          }
        }

        /* ====================================================
           MAIN
        ==================================================== */

        .home-main-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 36px;
          align-items: start;
        }

        .home-sidebar-sticky {
          position: sticky;
          top: 72px;
        }

        /* ====================================================
           HOT STORIES
        ==================================================== */

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

        /* ====================================================
           ORIGINAL LATEST NEWS SECTION
           KEEP ITS TITLE LOCATION
        ==================================================== */

        .latest-news-carousel {
          position: relative;
          width: 100%;
          height: 0;
          overflow: hidden;
          margin-bottom: 0;
        }

        /* ====================================================
           MOST READ
        ==================================================== */

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
            mostReadSlideUp .65s ease;
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

        /* ====================================================
           TABLET
        ==================================================== */

        @media (max-width: 1024px) {

          .home-main-grid {
            grid-template-columns:
              1fr !important;
          }

          .home-sidebar-sticky {
            position: static !important;
          }

        }

        /* ====================================================
           MOBILE
        ==================================================== */

        @media (max-width: 768px) {

          .home-hero-grid {
            grid-template-columns:
              1fr !important;
          }

          .home-hero-sidebar {
            flex-direction:
              row !important;
          }

          .home-hero-sidebar > * {
            flex:
              1 1 45% !important;
            min-height:
              140px !important;
          }

          .top-ad-wrapper > div {
            flex-direction:
              column !important;
          }

          .hero-latest-news {
            min-height: 350px;
          }

          .hero-latest-slide {
            min-height: 350px;
          }

          .hero-latest-overlay {
            padding: 24px;
          }

          .hero-latest-title {
            font-size: 1.55rem;
          }

          .hero-latest-description {
            font-size: 12px;
          }

        }

        /* ====================================================
           SMALL MOBILE
        ==================================================== */

        @media (max-width: 600px) {

          .home-hero-sidebar {
            flex-direction:
              column !important;
          }

          .home-hero-sidebar > * {
            flex:
              1 1 100% !important;
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

          .hero-latest-news {
            min-height: 330px;
          }

          .hero-latest-slide {
            min-height: 330px;
          }

          .hero-latest-overlay {
            padding: 20px;
          }

          .hero-latest-title {
            font-size: 1.35rem;
          }

          .hero-latest-description {
            display: none;
          }

          .hero-latest-meta {
            gap: 8px;
          }

          .hero-latest-dots {
            right: 15px;
            bottom: 17px;
          }

        }

      `}</style>

      {/* ====================================================
          TOP ADVERTISEMENT
          EXACTLY WHERE IT WAS
      ==================================================== */}

      {ads.length > 0 && (
        <div className="home-top-ad-section">

          <div
            style={{
              width: '100%',
              maxWidth: 970,
              margin: '0 auto'
            }}
          >

            <div
              style={{
                fontFamily:
                  "'Barlow Condensed',sans-serif",
                fontSize: 8,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: '#666',
                marginBottom: 4,
                textAlign: 'center'
              }}
            >
              Advertisement
            </div>

            <div className="top-ad-wrapper">

              <AdBanner
                ads={ads.slice(0, 2)}
                height={90}
              />

            </div>

          </div>

        </div>
      )}

      <PublicLayout>

        <div
          style={{
            maxWidth: 1260,
            margin: '0 auto',
            padding: '28px 20px 40px'
          }}
        >

          {/* =================================================
              HERO STRUCTURE

              THE STRUCTURE STAYS THE SAME.
              THE MAIN HERO CONTENT IS NOW THE ANIMATION.
          ================================================= */}

          {featured && (
            <div className="home-hero-grid">

              {/* =================================================
                  LATEST NEWS ANIMATION
                  REPLACES THE ORIGINAL HERO CARD
              ================================================= */}

              {currentLatest && (
                <div
                  className={`hero-latest-news ${
                    latestAnimating
                      ? 'hero-latest-changing'
                      : ''
                  }`}
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
                  SAME STRUCTURE
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
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      background: '#0d0d0d',
                      flex: 1,
                      minHeight: 120,
                      display: 'flex',
                      alignItems: 'flex-end',
                      textDecoration: 'none'
                    }}
                  >

                    <img
                      src={imgUrl(story.image)}
                      alt=""
                      loading="lazy"
                      onError={event => {
                        event.currentTarget.onerror =
                          null;

                        event.currentTarget.src =
                          '/placeholder.jpg';
                      }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: .65
                      }}
                    />

                    <div
                      style={{
                        position: 'relative',
                        padding: '10px 14px',
                        background:
                          'linear-gradient(transparent,rgba(0,0,0,.85))',
                        width: '100%'
                      }}
                    >

                      <div
                        style={{
                          fontFamily:
                            "'Barlow Condensed',sans-serif",
                          fontSize: 9,
                          fontWeight: 800,
                          letterSpacing: 2,
                          textTransform:
                            'uppercase',
                          color: '#e8b84b',
                          marginBottom: 3
                        }}
                      >
                        {story.category}
                      </div>

                      <div
                        style={{
                          fontFamily:
                            "'Playfair Display',serif",
                          fontSize: '.82rem',
                          fontWeight: 700,
                          color: '#fff',
                          lineHeight: 1.25
                        }}
                      >
                        {(story.title || '')
                          .substring(0, 65)}
                      </div>

                      <div
                        style={{
                          fontFamily:
                            "'Barlow Condensed',sans-serif",
                          fontSize: 9,
                          color:
                            'rgba(255,255,255,.4)',
                          marginTop: 3
                        }}
                      >
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

          {/* =================================================
              ADVERTISEMENT
              KEEP EXACTLY WHERE IT WAS
          ================================================= */}

          <AdBanner
            ads={ads.slice(0, 3)}
            height={210}
          />

          {/* =================================================
              MAIN + SIDEBAR
          ================================================= */}

          <div className="home-main-grid">

            {/* =================================================
                MAIN COLUMN
            ================================================= */}

            <div>

              {/* ===============================================
                  LATEST NEWS TITLE
                  
                  TITLE REMAINS IN ITS ORIGINAL LOCATION
              =============================================== */}

              <SectionLabel>
                Latest News
              </SectionLabel>

              {/* 
                The animated Latest News is already displayed
                in the original hero structure above.
                This title remains here exactly as requested.
              */}

              {/* =================================================
                  STORY GRID
              ================================================= */}

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

              {/* =================================================
                  BUSINESS / SPORT / TECHNOLOGY
              ================================================= */}

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
                  KEEP EXACTLY WHERE IT WAS
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

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside>

              <div className="home-sidebar-sticky">

                {/* =============================================
                    MOST READ

                    SHOW 5 AT ONCE
                    ROTATE THROUGH 20
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

      </PublicLayout>
    </>
  );
}

