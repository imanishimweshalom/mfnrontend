
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

  const [latestIndex, setLatestIndex] = useState(0);
  const [latestAnimating, setLatestAnimating] = useState(false);

  const animationTimerRef = useRef(null);
  const autoPlayRef = useRef(null);

  /*
  ============================================================
  HELPERS
  ============================================================
  */

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

  /*
  ============================================================
  LOAD HOME DATA
  ============================================================
  */

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

        const rawStories = storiesRes?.data?.stories || [];

        /*
        --------------------------------------------------------
        ALWAYS SORT NEWEST FIRST
        --------------------------------------------------------
        */

        const allStories = sortNewestFirst(rawStories);

        /*
        --------------------------------------------------------
        IMPORTANT STRUCTURE

        Story #1 remains Featured.

        Latest News carousel gets the newest 5 stories.

        The remaining stories are used by the other homepage
        sections.

        --------------------------------------------------------
        */

        const newestFive = allStories.slice(0, 5);

        setFeatured(allStories[0] || null);
        setLatestStories(newestFive);

        /*
        Do not duplicate the five carousel stories in the
        normal story grid.
        */
        setRecent(allStories.slice(5));

        /*
        --------------------------------------------------------
        POPULAR
        --------------------------------------------------------
        */

        const popularData = Array.isArray(popRes?.data)
          ? popRes.data
          : popRes?.data?.stories || [];

        setPopular(popularData);

        /*
        --------------------------------------------------------
        ADS
        --------------------------------------------------------
        */

        const adsData = Array.isArray(adsRes?.data)
          ? adsRes.data
          : adsRes?.data?.ads || [];

        setAds(adsData);

        /*
        --------------------------------------------------------
        CATEGORY DATA
        --------------------------------------------------------
        */

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

  /*
  ============================================================
  RESET INDEX WHEN LATEST STORIES CHANGE
  ============================================================
  */

  useEffect(() => {
    if (latestIndex >= latestStories.length) {
      setLatestIndex(0);
    }
  }, [latestStories, latestIndex]);

  /*
  ============================================================
  AUTO PLAY
  ============================================================
  
  Every 10 seconds:
  
  1. Start fade animation
  2. Change story
  3. Finish animation
  
  ============================================================
  */

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
          return (prev + 1) % latestStories.length;
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

  /*
  ============================================================
  MANUAL STORY CHANGE
  ============================================================
  */

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

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loading) {
    return (
      <PublicLayout>
        <Spinner />
      </PublicLayout>
    );
  }

  /*
  ============================================================
  EMPTY STATE
  ============================================================
  */

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

  /*
  ============================================================
  OTHER STORIES
  ============================================================
  */

  const gridStories = recent.slice(0, 4);
  const hotStories = recent.slice(4, 10);

  const currentLatest =
    latestStories[latestIndex] ||
    latestStories[0] ||
    null;

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <>
      <style>{`

        /* ====================================================
           TOP AD
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
           HERO
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
          border-bottom: 1px solid #e8e4d8;
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
           LATEST NEWS
        ==================================================== */

        .latest-news-carousel {
          position: relative;
          width: 100%;
          height: 380px;
          overflow: hidden;
          background: #0d0d0d;
          margin-bottom: 30px;
          border: 1px solid #e8e4d8;
          box-shadow: 0 8px 25px rgba(0,0,0,.08);
        }

        .latest-news-slide {
          position: relative;
          display: block;
          width: 100%;
          height: 100%;
          overflow: hidden;
          text-decoration: none;
          color: #fff;
        }

        .latest-news-slide img {
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

        .latest-news-slide:hover img {
          transform: scale(1.04);
        }

        .latest-news-overlay {
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

        .latest-news-category {
          font-family: "Barlow Condensed", sans-serif;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: #e8b84b;
          margin-bottom: 8px;
        }

        .latest-news-title {
          font-family: "Playfair Display", serif;
          font-size: clamp(1.5rem, 3vw, 2.6rem);
          font-weight: 700;
          line-height: 1.12;
          margin: 0 0 12px;
          max-width: 900px;
          text-shadow: 0 2px 8px rgba(0,0,0,.45);
        }

        .latest-news-description {
          max-width: 780px;
          margin: 0 0 14px;
          font-size: 14px;
          line-height: 1.55;
          color: rgba(255,255,255,.82);
        }

        .latest-news-meta {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          font-family: "Barlow Condensed", sans-serif;
          font-size: 10px;
          color: rgba(255,255,255,.68);
        }


        /* ====================================================
           ANIMATION
        ==================================================== */

        .latest-news-changing {
          animation:
            latestNewsFade .45s ease;
        }

        @keyframes latestNewsFade {
          0% {
            opacity: .05;
            transform: translateY(10px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }


        /* ====================================================
           DOTS
        ==================================================== */

        .latest-news-dots {
          position: absolute;
          right: 24px;
          bottom: 22px;
          display: flex;
          align-items: center;
          gap: 7px;
          z-index: 20;
        }

        .latest-news-dots button {
          width: 8px;
          height: 8px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: rgba(255,255,255,.45);
          cursor: pointer;
          transition:
            width .25s ease,
            background .25s ease;
        }

        .latest-news-dots button:hover {
          background: rgba(255,255,255,.85);
        }

        .latest-news-dots button.active {
          width: 26px;
          border-radius: 5px;
          background: #e8b84b;
        }


        /* ====================================================
           10 SECOND PROGRESS BAR
        ==================================================== */

        .latest-news-progress {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 3px;
          background: rgba(255,255,255,.15);
          z-index: 30;
          overflow: hidden;
        }

        .latest-news-progress-inner {
          width: 0;
          height: 100%;
          background: #e8b84b;
          animation:
            latestNewsProgress 10s linear forwards;
        }

        @keyframes latestNewsProgress {
          from {
            width: 0;
          }

          to {
            width: 100%;
          }
        }


        /* ====================================================
           TABLET
        ==================================================== */

        @media (max-width: 1024px) {

          .home-main-grid {
            grid-template-columns: 1fr !important;
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
            grid-template-columns: 1fr !important;
          }

          .home-hero-sidebar {
            flex-direction: row !important;
          }

          .home-hero-sidebar > * {
            flex: 1 1 45% !important;
            min-height: 140px !important;
          }

          .top-ad-wrapper > div {
            flex-direction: column !important;
          }

          .latest-news-carousel {
            height: 350px;
          }

          .latest-news-overlay {
            padding: 24px;
          }

          .latest-news-title {
            font-size: 1.55rem;
          }

          .latest-news-description {
            font-size: 12px;
          }

        }


        /* ====================================================
           SMALL MOBILE
        ==================================================== */

        @media (max-width: 600px) {

          .home-hero-sidebar {
            flex-direction: column !important;
          }

          .home-hero-sidebar > * {
            flex: 1 1 100% !important;
          }

          .home-hot-story {
            flex-direction: column !important;
            gap: 12px !important;
          }

          .home-hot-story-img {
            width: 100% !important;
            height: 200px !important;
          }

          .latest-news-carousel {
            height: 330px;
          }

          .latest-news-overlay {
            padding: 20px;
          }

          .latest-news-title {
            font-size: 1.35rem;
          }

          .latest-news-description {
            display: none;
          }

          .latest-news-meta {
            gap: 8px;
          }

          .latest-news-dots {
            right: 15px;
            bottom: 17px;
          }

        }

      `}</style>


      {/* ====================================================
          TOP ADVERTISEMENT
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
              HERO
          ================================================= */}

          {featured && (
            <div className="home-hero-grid">

              <HeroCard story={featured} />

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
                        event.currentTarget.onerror = null;
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
                          textTransform: 'uppercase',
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
                  LATEST NEWS — EXACTLY 5 NEWEST STORIES
              =============================================== */}

              <SectionLabel>
                Latest News
              </SectionLabel>

              {currentLatest && (
                <div
                  className={`latest-news-carousel ${
                    latestAnimating
                      ? 'latest-news-changing'
                      : ''
                  }`}
                >

                  <Link
                    to={`/story/${
                      currentLatest._id ||
                      currentLatest.id
                    }`}
                    className="latest-news-slide"
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
                        event.currentTarget.onerror = null;
                        event.currentTarget.src =
                          '/placeholder.jpg';
                      }}
                    />

                    <div className="latest-news-overlay">

                      <div className="latest-news-category">
                        {currentLatest.category ||
                          'News'}
                      </div>

                      <h2 className="latest-news-title">
                        {currentLatest.title}
                      </h2>

                      <p className="latest-news-description">
                        {(currentLatest.description || '')
                          .replace(/<[^>]+>/g, '')
                          .substring(0, 180)}
                      </p>

                      <div className="latest-news-meta">

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


                  {/* =========================================
                      CAROUSEL DOTS
                  ========================================= */}

                  {latestStories.length > 1 && (
                    <div className="latest-news-dots">

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


                  {/* =========================================
                      10 SECOND TIMER
                  ========================================= */}

                  {latestStories.length > 1 && (
                    <div className="latest-news-progress">

                      <div
                        key={latestIndex}
                        className="latest-news-progress-inner"
                      />

                    </div>
                  )}

                </div>
              )}


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
                      event.currentTarget.onerror = null;
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


                  {popular.map(
                    (story, index) => (

                      <PopularItem
                        key={
                          story._id ||
                          story.id ||
                          index
                        }
                        story={story}
                        rank={index + 1}
                      />

                    )
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

