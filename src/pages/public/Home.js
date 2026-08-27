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

  const storyId = story =>
    story?._id || story?.id;

  const cleanText = text =>
    (text || '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  /* ============================================================
     LOAD DATA
  ============================================================ */

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);

        const [storiesRes, popRes, adsRes] =
          await Promise.all([
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

        const allStories =
          sortNewestFirst(rawStories);

        /* Featured */

        setFeatured(
          allStories[0] || null
        );

        /* Latest 5 */

        setLatestStories(
          allStories.slice(0, 5)
        );

        /* Remaining */

        setRecent(
          allStories.slice(5)
        );

        /*
          Most Read area intentionally uses
          latest 20 stories as requested.
        */

        setPopular(
          allStories.slice(0, 20)
        );

        /* Ads */

        const adsData =
          Array.isArray(adsRes?.data)
            ? adsRes.data
            : adsRes?.data?.ads || [];

        setAds(adsData);

        /* Categories */

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
              const response =
                await storiesAPI.getAll({
                  category,
                  limit: 4,
                  status: 'published'
                });

              const stories =
                response?.data?.stories || [];

              categoryResults[category] =
                sortNewestFirst(stories);
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
     RESET LATEST
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

    autoPlayRef.current =
      setInterval(() => {
        setLatestAnimating(true);

        if (animationTimerRef.current) {
          clearTimeout(
            animationTimerRef.current
          );
        }

        animationTimerRef.current =
          setTimeout(() => {
            setLatestIndex(prev =>
              (prev + 1) %
              latestStories.length
            );

            setLatestAnimating(false);
          }, 450);
      }, 10000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(
          autoPlayRef.current
        );
      }

      if (animationTimerRef.current) {
        clearTimeout(
          animationTimerRef.current
        );
      }
    };
  }, [latestStories.length]);

  /* ============================================================
     MOST READ
     EVERY 5 SECONDS
  ============================================================ */

  useEffect(() => {
    if (popular.length <= 5) {
      return undefined;
    }

    mostReadTimerRef.current =
      setInterval(() => {
        setMostReadStart(prev =>
          (prev + 1) % popular.length
        );
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
     VISIBLE MOST READ
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
     MANUAL LATEST CHANGE
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
      clearTimeout(
        animationTimerRef.current
      );
    }

    animationTimerRef.current =
      setTimeout(() => {
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
        <div className="home-loading">
          <Spinner />
        </div>
      </PublicLayout>
    );
  }

  /* ============================================================
     EMPTY
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
     STORY GROUPS
  ============================================================ */

  const gridStories =
    recent.slice(0, 4);

  const hotStories =
    recent.slice(4, 10);

  const currentLatest =
    latestStories[latestIndex] ||
    latestStories[0] ||
    null;

  return (
    <>
      <style>{`

        /* ======================================================
           ROOT
        ====================================================== */

        .news-home {
          --red: #b21f24;
          --red-dark: #8f171c;
          --gold: #c9a24d;
          --ink: #111111;
          --muted: #737373;
          --soft: #f5f3ee;
          --line: #e7e3da;
          --paper: #ffffff;

          width: 100%;
          background: #f8f7f3;
          color: var(--ink);
        }

        .news-home *,
        .news-home *::before,
        .news-home *::after {
          box-sizing: border-box;
        }

        /* ======================================================
           TOP AD
        ====================================================== */

        .news-top-ad {
          width: 100%;
          background: #050505;
          padding: 18px 20px 20px;
          border-bottom: 1px solid #222;
        }

        .news-top-ad-inner {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .news-ad-label {
          text-align: center;
          color: #555;
          font-family:
            "Barlow Condensed",
            sans-serif;
          font-size: 8px;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 7px;
        }

        .news-top-ad-box {
          width: 100%;
          height: 110px;
          overflow: hidden;
          background: #000;
          border: 1px solid #242424;
          border-radius: 2px;
          box-shadow:
            0 15px 40px
            rgba(0,0,0,.4);
        }

        .news-top-ad-box > div {
          width: 100% !important;
          height: 100% !important;
          display: flex !important;
          flex-direction: row !important;
        }

        .news-top-ad-box a {
          flex: 1 1 50% !important;
          width: 50% !important;
          height: 100% !important;
        }

        .news-top-ad-box img {
          width: 100% !important;
          height: 110px !important;
          object-fit: cover !important;
          display: block !important;
        }

        /* ======================================================
           PAGE CONTAINER
        ====================================================== */

        .news-container {
          width: 100%;
          max-width: 1320px;
          margin: 0 auto;
          padding:
            30px 24px 70px;
        }

        /* ======================================================
           HERO
        ====================================================== */

        .news-hero {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr) 350px;
          gap: 3px;
          background: #111;
          margin-bottom: 26px;
        }

        .news-hero-main {
          position: relative;
          height: 560px;
          min-width: 0;
          overflow: hidden;
          background: #111;
        }

        .news-hero-link {
          position: absolute;
          inset: 0;
          display: block;
          color: #fff;
          text-decoration: none;
          overflow: hidden;
        }

        .news-hero-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition:
            transform 12s ease;
        }

        .news-hero-main:hover
        .news-hero-image {
          transform: scale(1.045);
        }

        .news-hero-link::after {
          content: "";
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              to top,
              rgba(0,0,0,.96) 0%,
              rgba(0,0,0,.75) 27%,
              rgba(0,0,0,.22) 60%,
              rgba(0,0,0,.02) 100%
            );

          z-index: 1;
        }

        .news-hero-content {
          position: absolute;
          z-index: 3;
          left: 0;
          right: 0;
          bottom: 0;

          padding:
            50px 58px 58px;
        }

        .news-hero-category {
          display: inline-flex;
          align-items: center;

          font-family:
            "Barlow Condensed",
            sans-serif;

          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2.8px;
          text-transform: uppercase;

          color: var(--gold);

          margin-bottom: 13px;
        }

        .news-hero-category::before {
          content: "";
          width: 25px;
          height: 2px;
          background: var(--gold);
          margin-right: 10px;
        }

        .news-hero-title {
          max-width: 950px;

          margin: 0 0 15px;

          font-family:
            "Playfair Display",
            Georgia,
            serif;

          font-size:
            clamp(2.1rem, 4vw, 3.9rem);

          font-weight: 700;
          line-height: 1.04;

          letter-spacing: -.5px;

          color: #fff;

          text-shadow:
            0 3px 18px
            rgba(0,0,0,.5);
        }

        .news-hero-description {
          max-width: 750px;

          margin: 0 0 19px;

          font-family:
            Arial,
            sans-serif;

          font-size: 14px;
          line-height: 1.65;

          color:
            rgba(255,255,255,.78);
        }

        .news-hero-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;

          font-family:
            "Barlow Condensed",
            sans-serif;

          font-size: 10px;
          letter-spacing: .7px;

          color:
            rgba(255,255,255,.68);
        }

        /* ======================================================
           HERO ANIMATION
        ====================================================== */

        .news-hero-changing {
          animation:
            newsHeroChange
            .55s
            ease both;
        }

        @keyframes newsHeroChange {
          0% {
            opacity: .1;
            transform:
              translateY(15px)
              scale(.995);
          }

          100% {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }
        }

        /* ======================================================
           HERO DOTS
        ====================================================== */

        .news-hero-dots {
          position: absolute;
          right: 28px;
          bottom: 27px;

          z-index: 8;

          display: flex;
          gap: 7px;
          align-items: center;
        }

        .news-hero-dots button {
          width: 7px;
          height: 7px;

          border: 0;
          padding: 0;

          border-radius: 50%;

          background:
            rgba(255,255,255,.4);

          cursor: pointer;

          transition:
            all .3s ease;
        }

        .news-hero-dots button.active {
          width: 28px;
          border-radius: 8px;
          background: var(--gold);
        }

        .news-hero-dots button:hover {
          background: #fff;
        }

        /* ======================================================
           HERO PROGRESS
        ====================================================== */

        .news-progress {
          position: absolute;
          z-index: 10;

          left: 0;
          right: 0;
          bottom: 0;

          height: 3px;

          background:
            rgba(255,255,255,.15);
        }

        .news-progress-inner {
          height: 100%;
          width: 0;

          background: var(--gold);

          animation:
            newsProgress
            10s
            linear
            forwards;
        }

        @keyframes newsProgress {
          from {
            width: 0;
          }

          to {
            width: 100%;
          }
        }

        /* ======================================================
           HERO SIDE STORIES
        ====================================================== */

        .news-hero-side {
          display: grid;
          grid-template-rows: 1fr 1fr;
          gap: 3px;
          background: #111;
        }

        .news-side-story {
          position: relative;
          min-height: 0;
          overflow: hidden;
          background: #111;
          color: #fff;
          text-decoration: none;
        }

        .news-side-story::after {
          content: "";
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              to top,
              rgba(0,0,0,.93),
              rgba(0,0,0,.15) 75%
            );
        }

        .news-side-image {
          position: absolute;
          inset: 0;

          width: 100%;
          height: 100%;

          object-fit: cover;

          opacity: .78;

          transition:
            transform .7s ease,
            opacity .7s ease;
        }

        .news-side-story:hover
        .news-side-image {
          transform: scale(1.06);
          opacity: .92;
        }

        .news-side-content {
          position: absolute;
          z-index: 2;

          left: 0;
          right: 0;
          bottom: 0;

          padding: 25px 23px;
        }

        .news-side-category {
          font-family:
            "Barlow Condensed",
            sans-serif;

          font-size: 9px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;

          color: var(--gold);

          margin-bottom: 7px;
        }

        .news-side-title {
          font-family:
            "Playfair Display",
            Georgia,
            serif;

          font-size: 1.05rem;
          font-weight: 700;

          line-height: 1.22;

          color: #fff;
        }

        .news-side-time {
          margin-top: 8px;

          font-family:
            "Barlow Condensed",
            sans-serif;

          font-size: 9px;

          color:
            rgba(255,255,255,.5);
        }

        /* ======================================================
           ADVERTISEMENT BELOW HERO
        ====================================================== */

        .news-inline-ad {
          margin:
            0 0 34px;
        }

        /* ======================================================
           SECTION HEADER
        ====================================================== */

        .news-section-heading {
          display: flex;
          align-items: center;
          gap: 15px;

          margin-bottom: 20px;
        }

        .news-section-heading::after {
          content: "";
          flex: 1;

          height: 1px;

          background:
            var(--line);
        }

        .news-section-title {
          position: relative;

          margin: 0;

          font-family:
            "Barlow Condensed",
            sans-serif;

          font-size: 12px;
          font-weight: 800;

          letter-spacing: 2.5px;
          text-transform: uppercase;

          white-space: nowrap;

          color: var(--ink);
        }

        .news-section-title::before {
          content: "";

          display: inline-block;

          width: 24px;
          height: 3px;

          background: var(--red);

          vertical-align: middle;

          margin-right: 9px;
        }

        /* ======================================================
           MAIN LAYOUT
        ====================================================== */

        .news-main-layout {
          display: grid;

          grid-template-columns:
            minmax(0, 1fr) 350px;

          gap: 46px;

          align-items: start;
        }

        /* ======================================================
           LATEST GRID
        ====================================================== */

        .news-story-grid {
          display: grid;

          grid-template-columns:
            repeat(2, minmax(0, 1fr));

          gap: 24px;

          margin-bottom: 42px;
        }

        .news-grid-item {
          min-width: 0;

          background: #fff;

          border:
            1px solid var(--line);

          transition:
            transform .25s ease,
            box-shadow .25s ease;
        }

        .news-grid-item:hover {
          transform:
            translateY(-3px);

          box-shadow:
            0 12px 30px
            rgba(0,0,0,.08);
        }

        /* ======================================================
           CATEGORY COLUMNS
        ====================================================== */

        .news-category-grid {
          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 30px;

          margin-bottom: 38px;
        }

        .news-category-column {
          min-width: 0;

          padding-top: 4px;
        }

        .news-category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          padding-bottom: 10px;

          border-bottom:
            2px solid var(--ink);

          margin-bottom: 16px;
        }

        .news-category-name {
          font-family:
            "Barlow Condensed",
            sans-serif;

          font-size: 14px;
          font-weight: 800;

          letter-spacing: 1.8px;
          text-transform: uppercase;

          color: var(--ink);

          text-decoration: none;
        }

        .news-category-name:hover {
          color: var(--red);
        }

        .news-category-more {
          font-family:
            "Barlow Condensed",
            sans-serif;

          font-size: 9px;
          font-weight: 700;

          letter-spacing: 1.5px;
          text-transform: uppercase;

          color: var(--red);

          text-decoration: none;
        }

        /* ======================================================
           SECOND AD
        ====================================================== */

        .news-second-ad {
          margin:
            10px 0 38px;
        }

        /* ======================================================
           MORE STORIES
        ====================================================== */

        .news-more-stories {
          margin-bottom: 42px;
        }

        .news-hot-story {
          display: grid;

          grid-template-columns:
            190px minmax(0, 1fr);

          gap: 23px;

          padding:
            20px 0;

          border-bottom:
            1px solid var(--line);

          text-decoration: none;

          color: inherit;
        }

        .news-hot-image {
          width: 190px;
          height: 125px;

          object-fit: cover;

          display: block;
        }

        .news-hot-category {
          font-family:
            "Barlow Condensed",
            sans-serif;

          font-size: 9px;
          font-weight: 800;

          letter-spacing: 2px;

          text-transform: uppercase;

          color: var(--red);

          margin-bottom: 7px;
        }

        .news-hot-title {
          font-family:
            "Playfair Display",
            Georgia,
            serif;

          font-size: 1.2rem;

          line-height: 1.25;

          margin-bottom: 7px;
        }

        .news-hot-description {
          margin: 0 0 10px;

          color: #777;

          font-size: 13px;

          line-height: 1.55;

          font-style: italic;
        }

        .news-hot-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;

          font-family:
            "Barlow Condensed",
            sans-serif;

          font-size: 9px;

          color: #aaa;
        }

        .news-hot-story:hover
        .news-hot-title {
          color: var(--red);
        }

        /* ======================================================
           HEALTH / CULTURE
        ====================================================== */

        .news-bottom-categories {
          display: grid;

          grid-template-columns:
            repeat(2, minmax(0, 1fr));

          gap: 30px;

          margin-top: 35px;
        }

        /* ======================================================
           SIDEBAR
        ====================================================== */

        .news-sidebar {
          min-width: 0;
        }

        .news-sidebar-sticky {
          position: sticky;
          top: 75px;
        }

        .news-widget {
          background: #fff;

          border:
            1px solid var(--line);

          margin-bottom: 24px;
        }

        .news-widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          padding:
            15px 18px;

          border-bottom:
            1px solid var(--line);

          position: relative;
        }

        .news-widget-header::before {
          content: "";

          position: absolute;

          left: 0;
          top: 0;
          bottom: 0;

          width: 4px;

          background: var(--red);
        }

        .news-widget-title {
          margin: 0;

          font-family:
            "Barlow Condensed",
            sans-serif;

          font-size: 12px;
          font-weight: 800;

          letter-spacing: 2px;

          text-transform: uppercase;
        }

        .news-widget-body {
          padding: 18px;
        }

        /* ======================================================
           MOST READ
        ====================================================== */

        .most-read-list {
          overflow: hidden;
        }

        .most-read-track {
          display: flex;
          flex-direction: column;
        }

        .most-read-item {
          animation:
            mostReadEnter
            .6s
            ease both;
        }

        @keyframes mostReadEnter {
          from {
            opacity: 0;
            transform:
              translateY(28px);
          }

          to {
            opacity: 1;
            transform:
              translateY(0);
          }
        }

        .most-read-item
        + .most-read-item {
          margin-top: 3px;
        }

        .most-read-counter {
          display: flex;
          justify-content: space-between;

          padding-top: 13px;
          margin-top: 12px;

          border-top:
            1px solid var(--line);

          font-family:
            "Barlow Condensed",
            sans-serif;

          font-size: 9px;

          letter-spacing: 1.2px;

          text-transform: uppercase;

          color: #999;
        }

        /* ======================================================
           ENVIRONMENT
        ====================================================== */

        .news-environment {
          background: #fff;

          border:
            1px solid var(--line);

          padding: 20px;

          margin-bottom: 24px;
        }

        /* ======================================================
           TOPICS
        ====================================================== */

        .news-topics {
          background: #fff;

          border:
            1px solid var(--line);

          padding: 20px;
        }

        .news-topics-title {
          font-family:
            "Barlow Condensed",
            sans-serif;

          font-size: 11px;
          font-weight: 800;

          letter-spacing: 2.2px;

          text-transform: uppercase;

          padding-bottom: 10px;

          border-bottom:
            2px solid var(--ink);

          margin-bottom: 15px;
        }

        /* ======================================================
           LOADING
        ====================================================== */

        .home-loading {
          min-height: 400px;

          display: flex;

          align-items: center;
          justify-content: center;
        }

        /* ======================================================
           TABLET
        ====================================================== */

        @media (max-width: 1100px) {

          .news-container {
            padding:
              25px 18px 60px;
          }

          .news-hero {
            grid-template-columns:
              minmax(0, 1fr) 300px;
          }

          .news-hero-main {
            height: 500px;
          }

          .news-hero-content {
            padding:
              40px 40px 48px;
          }

          .news-main-layout {
            grid-template-columns:
              minmax(0, 1fr) 300px;

            gap: 28px;
          }

          .news-category-grid {
            gap: 20px;
          }

        }

        /* ======================================================
           TABLET PORTRAIT
        ====================================================== */

        @media (max-width: 900px) {

          .news-hero {
            grid-template-columns: 1fr;
          }

          .news-hero-main {
            height: 480px;
          }

          .news-hero-side {
            grid-template-columns:
              1fr 1fr;

            grid-template-rows:
              220px;
          }

          .news-main-layout {
            grid-template-columns: 1fr;
          }

          .news-sidebar-sticky {
            position: static;
          }

        }

        /* ======================================================
           MOBILE
        ====================================================== */

        @media (max-width: 700px) {

          .news-top-ad {
            padding:
              10px 10px 12px;
          }

          .news-top-ad-box {
            height: 82px;
          }

          .news-top-ad-box > div {
            flex-direction:
              column !important;
          }

          .news-top-ad-box a {
            width: 100% !important;
            height: 100% !important;
            flex:
              1 1 100% !important;
          }

          .news-top-ad-box img {
            height: 82px !important;
          }

          .news-container {
            padding:
              15px 12px 45px;
          }

          .news-hero {
            margin-bottom: 20px;
          }

          .news-hero-main {
            height: 420px;
          }

          .news-hero-content {
            padding:
              30px 23px 38px;
          }

          .news-hero-title {
            font-size:
              clamp(
                1.65rem,
                7vw,
                2.35rem
              );

            line-height: 1.08;
          }

          .news-hero-description {
            font-size: 12px;

            line-height: 1.5;

            max-width: 100%;
          }

          .news-hero-meta {
            gap: 10px;
            font-size: 9px;
          }

          .news-hero-dots {
            right: 18px;
            bottom: 20px;
          }

          .news-hero-side {
            grid-template-columns:
              1fr 1fr;

            grid-template-rows:
              180px;
          }

          .news-side-content {
            padding:
              18px 15px;
          }

          .news-side-title {
            font-size: .9rem;
          }

          .news-story-grid {
            grid-template-columns:
              1fr;

            gap: 18px;
          }

          .news-category-grid {
            grid-template-columns:
              1fr;

            gap: 30px;
          }

          .news-bottom-categories {
            grid-template-columns:
              1fr;
          }

          .news-hot-story {
            grid-template-columns:
              120px minmax(0, 1fr);

            gap: 14px;
          }

          .news-hot-image {
            width: 120px;
            height: 105px;
          }

          .news-hot-title {
            font-size:
              1rem;
          }

          .news-hot-description {
            display: none;
          }

        }

        /* ======================================================
           SMALL PHONE
        ====================================================== */

        @media (max-width: 480px) {

          .news-hero-main {
            height: 365px;
          }

          .news-hero-content {
            padding:
              22px 18px 30px;
          }

          .news-hero-category {
            font-size: 9px;
            letter-spacing: 2px;
          }

          .news-hero-title {
            font-size:
              1.45rem;
          }

          .news-hero-description {
            display: none;
          }

          .news-hero-dots {
            bottom: 15px;
            right: 14px;
          }

          .news-hero-side {
            grid-template-columns: 1fr;
            grid-template-rows:
              150px 150px;
          }

          .news-section-heading {
            margin-bottom: 15px;
          }

          .news-section-title {
            font-size: 10px;
            letter-spacing: 2px;
          }

          .news-hot-story {
            grid-template-columns:
              1fr;

            gap: 11px;
          }

          .news-hot-image {
            width: 100%;
            height: 190px;
          }

          .news-hot-title {
            font-size:
              1.05rem;
          }

          .news-hot-meta {
            font-size: 8px;
          }

        }

      `}</style>

      <div className="news-home">

        {/* ========================================================
            TOP ADVERTISEMENT
        ======================================================== */}

        {ads.length > 0 && (
          <div className="news-top-ad">

            <div className="news-top-ad-inner">

              <div className="news-ad-label">
                Advertisement
              </div>

              <div className="news-top-ad-box">

                <AdBanner
                  ads={ads.slice(0, 2)}
                  height={110}
                />

              </div>

            </div>

          </div>
        )}

        <PublicLayout>

          <main className="news-container">

            {/* ==================================================
                HERO
            ================================================== */}

            {featured && (
              <section className="news-hero">

                {/* MAIN HERO */}

                {currentLatest && (
                  <div
                    className={`
                      news-hero-main
                      ${
                        latestAnimating
                          ? 'news-hero-changing'
                          : ''
                      }
                    `}
                  >

                    <Link
                      to={`/story/${storyId(
                        currentLatest
                      )}`}
                      className="news-hero-link"
                    >

                      <img
                        key={storyId(
                          currentLatest
                        )}
                        className="news-hero-image"
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

                      <div className="news-hero-content">

                        <div className="news-hero-category">
                          {currentLatest.category ||
                            'News'}
                        </div>

                        <h1 className="news-hero-title">
                          {currentLatest.title}
                        </h1>

                        <p className="news-hero-description">
                          {cleanText(
                            currentLatest.description
                          ).substring(0, 200)}
                        </p>

                        <div className="news-hero-meta">

                          <span>
                            👤{' '}
                            {currentLatest.author ||
                              'Unknown'}
                          </span>

                          <span>
                            ◷{' '}
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
                      <div className="news-hero-dots">

                        {latestStories.map(
                          (story, index) => (

                            <button
                              key={
                                storyId(story) ||
                                index
                              }
                              type="button"
                              className={
                                index ===
                                latestIndex
                                  ? 'active'
                                  : ''
                              }
                              onClick={() =>
                                changeLatestStory(
                                  index
                                )
                              }
                              aria-label={
                                `Show latest story ${
                                  index + 1
                                }`
                              }
                            />

                          )
                        )}

                      </div>
                    )}

                    {/* PROGRESS */}

                    {latestStories.length > 1 && (
                      <div className="news-progress">

                        <div
                          key={latestIndex}
                          className="news-progress-inner"
                        />

                      </div>
                    )}

                  </div>
                )}

                {/* SIDE STORIES */}

                <div className="news-hero-side">

                  {recent
                    .slice(0, 2)
                    .map(story => (

                      <Link
                        key={storyId(story)}
                        to={`/story/${storyId(
                          story
                        )}`}
                        className="news-side-story"
                      >

                        <img
                          className="news-side-image"
                          src={imgUrl(
                            story.image
                          )}
                          alt=""
                          loading="lazy"
                          onError={event => {
                            event.currentTarget.onerror =
                              null;

                            event.currentTarget.src =
                              '/placeholder.jpg';
                          }}
                        />

                        <div className="news-side-content">

                          <div className="news-side-category">
                            {story.category ||
                              'News'}
                          </div>

                          <div className="news-side-title">
                            {cleanText(
                              story.title
                            ).substring(
                              0,
                              90
                            )}
                          </div>

                          <div className="news-side-time">
                            {timeAgo(
                              story.created_at ||
                              story.createdAt
                            )}
                          </div>

                        </div>

                      </Link>

                    ))}

                </div>

              </section>
            )}

            {/* ==================================================
                AD BELOW HERO
            ================================================== */}

            <div className="news-inline-ad">

              <AdBanner
                ads={ads.slice(0, 3)}
                height={210}
              />

            </div>

            {/* ==================================================
                MAIN LAYOUT
            ================================================== */}

            <div className="news-main-layout">

              {/* =================================================
                  MAIN CONTENT
              ================================================= */}

              <div>

                {/* =================================================
                    LATEST NEWS TITLE
                    REMAINS HERE
                ================================================= */}

                <div className="news-section-heading">

                  <h2 className="news-section-title">
                    Latest News
                  </h2>

                </div>

                {/* =================================================
                    LATEST STORY GRID
                ================================================= */}

                {gridStories.length > 0 && (
                  <div className="news-story-grid">

                    {gridStories.map(
                      story => (

                        <div
                          key={storyId(story)}
                          className="news-grid-item"
                        >

                          <GridCard
                            story={story}
                          />

                        </div>

                      )
                    )}

                  </div>
                )}

                {/* =================================================
                    BUSINESS / SPORT / TECHNOLOGY
                ================================================= */}

                <div className="news-category-grid">

                  {[
                    'Business',
                    'Sport',
                    'Technology'
                  ].map(category => (

                    <section
                      key={category}
                      className="news-category-column"
                    >

                      <div className="news-category-header">

                        <Link
                          to={`/category/${category}`}
                          className="news-category-name"
                        >
                          {category}
                        </Link>

                        <Link
                          to={`/category/${category}`}
                          className="news-category-more"
                        >
                          View all →
                        </Link>

                      </div>

                      {(byCategory[
                        category
                      ] || [])
                        .slice(0, 3)
                        .map(story => (

                          <StoryCard
                            key={storyId(story)}
                            story={story}
                          />

                        ))}

                    </section>

                  ))}

                </div>

                {/* =================================================
                    SECOND AD
                ================================================= */}

                <div className="news-second-ad">

                  <AdBanner
                    ads={ads.slice(3)}
                    height={210}
                  />

                </div>

                {/* =================================================
                    MORE STORIES
                ================================================= */}

                <section className="news-more-stories">

                  <div className="news-section-heading">

                    <h2 className="news-section-title">
                      More Stories
                    </h2>

                  </div>

                  {hotStories.map(
                    story => (

                      <Link
                        key={storyId(story)}
                        to={`/story/${storyId(
                          story
                        )}`}
                        className="news-hot-story"
                      >

                        <img
                          className="news-hot-image"
                          src={imgUrl(
                            story.image
                          )}
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

                          <div className="news-hot-category">
                            {story.category ||
                              'News'}
                          </div>

                          <div className="news-hot-title">
                            {cleanText(
                              story.title
                            ).substring(
                              0,
                              110
                            )}
                          </div>

                          <p className="news-hot-description">
                            {cleanText(
                              story.description
                            ).substring(
                              0,
                              130
                            )}
                          </p>

                          <div className="news-hot-meta">

                            <span>
                              👤{' '}
                              {story.author ||
                                'Unknown'}
                            </span>

                            <span>
                              ◷{' '}
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

                    )
                  )}

                </section>

                {/* =================================================
                    HEALTH / CULTURE
                ================================================= */}

                <div className="news-bottom-categories">

                  {[
                    'Health',
                    'Culture'
                  ].map(category => (

                    <section
                      key={category}
                      className="news-category-column"
                    >

                      <div className="news-category-header">

                        <Link
                          to={`/category/${category}`}
                          className="news-category-name"
                        >
                          {category}
                        </Link>

                        <Link
                          to={`/category/${category}`}
                          className="news-category-more"
                        >
                          View all →
                        </Link>

                      </div>

                      {(byCategory[
                        category
                      ] || [])
                        .slice(0, 3)
                        .map(story => (

                          <StoryCard
                            key={storyId(story)}
                            story={story}
                          />

                        ))}

                    </section>

                  ))}

                </div>

              </div>

              {/* =================================================
                  SIDEBAR
              ================================================= */}

              <aside className="news-sidebar">

                <div className="news-sidebar-sticky">

                  {/* =============================================
                      MOST READ
                  ============================================= */}

                  <div className="news-widget">

                    <div className="news-widget-header">

                      <h3 className="news-widget-title">
                        🔥 Most Read
                      </h3>

                    </div>

                    <div className="news-widget-body">

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
                                    storyId(
                                      story
                                    ) ||
                                    `${mostReadStart}-${originalIndex}`
                                  }
                                  className="most-read-item"
                                >

                                  <PopularItem
                                    story={story}
                                    rank={
                                      originalIndex +
                                      1
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
                                mostReadStart +
                                  1,
                                popular.length
                              )}
                              {' – '}
                              {Math.min(
                                mostReadStart +
                                  5,
                                popular.length
                              )}
                              {' / '}
                              {popular.length}
                            </span>

                          </div>

                        </div>

                      )}

                    </div>

                  </div>

                  {/* =============================================
                      NEWSLETTER
                  ============================================= */}

                  <NewsletterWidget />

                  {/* =============================================
                      ENVIRONMENT
                  ============================================= */}

                  <div className="news-environment">

                    <div className="news-section-heading">

                      <h3 className="news-section-title">
                        Environment
                      </h3>

                    </div>

                    {(byCategory.Environment ||
                      [])
                      .slice(0, 3)
                      .map(story => (

                        <StoryCard
                          key={storyId(story)}
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

                  <div className="news-topics">

                    <div className="news-topics-title">
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

          </main>

        </PublicLayout>

      </div>
    </>
  );
}
