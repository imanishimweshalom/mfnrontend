import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import PublicLayout from '../../components/layout/PublicLayout';

import {
  GridCard,
  PopularItem,
  AdBanner,
  SectionLabel,
  NewsletterWidget,
  WhatsAppCTA,
  Spinner,
  EmptyState,
  Pagination,
  imgUrl
} from '../../components/ui';

import {
  storiesAPI,
  adsAPI
} from '../../utils/api';

/* =========================================================
   CATEGORY COLORS
========================================================= */

const CAT_COLORS = {
  Sport: '#0d3b6e',
  Business: '#0a6847',
  Technology: '#0c4a6e',
  Health: '#b91c1c',
  Culture: '#7c2d12',
  Environment: '#065f46',
  'Le Phare': '#92400e',
  Music: '#be185d',
  Transport: '#374151'
};

/* =========================================================
   SPORTS LEAGUES
========================================================= */

const SPORTS_LEAGUES = [
  {
    key: 'EPL',
    name: 'ENGLISH PREMIER LEAGUE',
    short: 'Premier League',
    id: 39
  },
  {
    key: 'LA_LIGA',
    name: 'LA LIGA',
    short: 'La Liga',
    id: 140
  },
  {
    key: 'SERIE_A',
    name: 'SERIE A',
    short: 'Serie A',
    id: 135
  },
  {
    key: 'BUNDESLIGA',
    name: 'BUNDESLIGA',
    short: 'Bundesliga',
    id: 78
  },
  {
    key: 'LIGUE_1',
    name: 'LIGUE 1',
    short: 'Ligue 1',
    id: 61
  },
  {
    key: 'RWANDA',
    name: 'RWANDA PREMIER LEAGUE',
    short: 'BK PRO LEAGUE',
    id: 567
  }
];

/* =========================================================
   LOCAL STORAGE CONFIG
========================================================= */

const SPORTS_STORAGE_KEY =
  'mfn_sports_updates_v1';

const SPORTS_STORAGE_TIME_KEY =
  'mfn_sports_updates_timestamp_v1';

const SPORTS_CACHE_DURATION =
  24 * 60 * 60 * 1000;

/* =========================================================
   HELPERS
========================================================= */

const getToday = () => {
  return new Date()
    .toISOString()
    .split('T')[0];
};

const getYesterday = () => {
  const date = new Date();

  date.setDate(
    date.getDate() - 1
  );

  return date
    .toISOString()
    .split('T')[0];
};

/* =========================================================
   FORMAT TIME
========================================================= */

const formatMatchTime = (date) => {

  if (!date) {
    return '';
  }

  try {

    return new Date(date).toLocaleTimeString(
      [],
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    );

  } catch {
    return '';
  }
};

/* =========================================================
   MATCH STATUS
========================================================= */

const getMatchStatus = (fixture) => {

  const status =
    fixture?.fixture?.status;

  if (!status) {
    return '';
  }

  if (
    status.short === 'FT' ||
    status.short === 'AET' ||
    status.short === 'PEN'
  ) {
    return 'FULL TIME';
  }

  if (
    status.short === 'LIVE' ||
    status.short === '1H' ||
    status.short === '2H' ||
    status.short === 'ET'
  ) {
    return 'LIVE';
  }

  if (
    status.short === 'NS' ||
    status.short === 'TBD'
  ) {
    return 'UPCOMING';
  }

  return status.long || '';
};

/* =========================================================
   SPORTS API
========================================================= */

const fetchSportsFixtures = async (
  leagueId,
  date
) => {

  const url =
    `/api/sports/fixtures?league=${leagueId}&season=${new Date().getFullYear()}&date=${date}`;

  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      'Sports API request failed'
    );
  }

  const data =
    await response.json();

  return data.response || [];
};

/* =========================================================
   SPORTS CARD
========================================================= */

function SportMatchCard({
  fixture,
  league
}) {

  const home =
    fixture?.teams?.home;

  const away =
    fixture?.teams?.away;

  const goals =
    fixture?.goals;

  const status =
    getMatchStatus(fixture);

  const isLive =
    status === 'LIVE';

  const isFinished =
    status === 'FULL TIME';

  return (
    <div
      className="sports-match-card"
    >

      <div className="sports-match-top">

        <div className="sports-league-name">
          {league.short}
        </div>

        <div
          className={
            isLive
              ? 'sports-status live'
              : 'sports-status'
          }
        >
          {status}
        </div>

      </div>

      <div className="sports-teams">

        <div className="sports-team">

          {home?.logo && (
            <img
              src={home.logo}
              alt=""
            />
          )}

          <span>
            {home?.name || 'Home'}
          </span>

        </div>

        <div className="sports-score">

          {isFinished || isLive ? (
            <>
              <strong>
                {goals?.home ?? 0}
              </strong>

              <span>:</span>

              <strong>
                {goals?.away ?? 0}
              </strong>
            </>
          ) : (
            <span className="sports-vs">
              {formatMatchTime(
                fixture?.fixture?.date
              )}
            </span>
          )}

        </div>

        <div className="sports-team">

          {away?.logo && (
            <img
              src={away.logo}
              alt=""
            />
          )}

          <span>
            {away?.name || 'Away'}
          </span>

        </div>

      </div>

      <div className="sports-match-footer">

        <span>
          {fixture?.fixture?.venue?.name ||
            'Football'}
        </span>

        <span>
          {fixture?.fixture?.date
            ? new Date(
                fixture.fixture.date
              ).toLocaleDateString()
            : ''}
        </span>

      </div>

    </div>
  );
}

/* =========================================================
   SPORTS UPDATE SECTION
========================================================= */

function SportsUpdates() {

  const [sports, setSports] =
    useState([]);

  const [sportsLoading, setSportsLoading] =
    useState(true);

  const [sportsError, setSportsError] =
    useState('');

  const [activeLeague, setActiveLeague] =
    useState('ALL');

  /* =======================================================
     LOAD FROM LOCAL STORAGE
  ======================================================= */

  useEffect(() => {

    const loadSports = async () => {

      try {

        const stored =
          localStorage.getItem(
            SPORTS_STORAGE_KEY
          );

        const storedTime =
          localStorage.getItem(
            SPORTS_STORAGE_TIME_KEY
          );

        const now =
          Date.now();

        const cacheValid =
          stored &&
          storedTime &&
          now -
            Number(storedTime) <
            SPORTS_CACHE_DURATION;

        /* -------------------------------------------------
           USE CACHE
        ------------------------------------------------- */

        if (cacheValid) {

          const parsed =
            JSON.parse(stored);

          setSports(parsed);

          setSportsLoading(false);

          return;
        }

        /* -------------------------------------------------
           CACHE EXPIRED
        ------------------------------------------------- */

        localStorage.removeItem(
          SPORTS_STORAGE_KEY
        );

        localStorage.removeItem(
          SPORTS_STORAGE_TIME_KEY
        );

        /* -------------------------------------------------
           FETCH TODAY + YESTERDAY
        ------------------------------------------------- */

        const dates = [
          getToday(),
          getYesterday()
        ];

        const allFixtures = [];

        for (
          const league of SPORTS_LEAGUES
        ) {

          for (
            const date of dates
          ) {

            try {

              const fixtures =
                await fetchSportsFixtures(
                  league.id,
                  date
                );

              fixtures.forEach(
                fixture => {

                  allFixtures.push({

                    ...fixture,

                    mfnLeagueKey:
                      league.key,

                    mfnLeagueName:
                      league.name,

                    mfnLeagueShort:
                      league.short

                  });

                }
              );

            } catch (error) {

              console.error(
                `Failed loading ${league.name}`,
                error
              );

            }

          }

        }

        /* -------------------------------------------------
           SORT BY DATE
        ------------------------------------------------- */

        allFixtures.sort(
          (a, b) => {

            return (
              new Date(
                b?.fixture?.date || 0
              ) -
              new Date(
                a?.fixture?.date || 0
              )
            );

          }
        );

        /* -------------------------------------------------
           SAVE LOCAL STORAGE
        ------------------------------------------------- */

        localStorage.setItem(
          SPORTS_STORAGE_KEY,
          JSON.stringify(
            allFixtures
          )
        );

        localStorage.setItem(
          SPORTS_STORAGE_TIME_KEY,
          String(Date.now())
        );

        setSports(
          allFixtures
        );

      } catch (error) {

        console.error(
          'Sports updates error:',
          error
        );

        setSportsError(
          'Unable to load sports updates.'
        );

      } finally {

        setSportsLoading(false);

      }

    };

    loadSports();

  }, []);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredSports =
    activeLeague === 'ALL'
      ? sports
      : sports.filter(
          item =>
            item.mfnLeagueKey ===
            activeLeague
        );

  /* =======================================================
     LOADING
  ======================================================= */

  if (sportsLoading) {

    return (
      <section className="sports-section">

        <div className="sports-heading">

          <div>
            <span className="sports-kicker">
              SPORT UPDATE
            </span>

            <h2>
              Latest Football
            </h2>
          </div>

          <div className="sports-live-dot">
            UPDATING
          </div>

        </div>

        <div className="sports-loading">
          <Spinner />
        </div>

      </section>
    );

  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (
    sportsError &&
    sports.length === 0
  ) {

    return (
      <section className="sports-section">

        <div className="sports-heading">

          <div>
            <span className="sports-kicker">
              SPORT UPDATE
            </span>

            <h2>
              Latest Football
            </h2>
          </div>

        </div>

        <div className="sports-empty">
          {sportsError}
        </div>

      </section>
    );

  }

  return (
    <section className="sports-section">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="sports-heading">

        <div>

          <span className="sports-kicker">
            ⚽ SPORT UPDATE
          </span>

          <h2>
            Latest Football
          </h2>

          <p>
            Scores and match updates from
            Europe's biggest leagues and
            Rwanda's BK Pro League.
          </p>

        </div>

        <div className="sports-live-badge">
          <span />
          LIVE DATA
        </div>

      </div>

      {/* ===================================================
          LEAGUE NAVIGATION
      =================================================== */}

      <div className="sports-leagues">

        <button
          className={
            activeLeague === 'ALL'
              ? 'active'
              : ''
          }
          onClick={() =>
            setActiveLeague('ALL')
          }
        >
          ALL
        </button>

        {SPORTS_LEAGUES.map(
          league => (

            <button
              key={league.key}
              className={
                activeLeague ===
                league.key
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setActiveLeague(
                  league.key
                )
              }
            >
              {league.short}
            </button>

          )
        )}

      </div>

      {/* ===================================================
          MATCHES
      =================================================== */}

      {filteredSports.length === 0 ? (

        <div className="sports-empty">

          <div className="sports-empty-icon">
            ⚽
          </div>

          <strong>
            No recent matches
          </strong>

          <span>
            New football updates will
            appear automatically.
          </span>

        </div>

      ) : (

        <div className="sports-grid">

          {filteredSports
            .slice(0, 18)
            .map(
              (fixture, index) => (

                <SportMatchCard
                  key={
                    fixture?.fixture?.id ||
                    index
                  }
                  fixture={fixture}
                  league={{
                    short:
                      fixture.mfnLeagueShort
                  }}
                />

              )
            )}

        </div>

      )}

      {/* ===================================================
          CACHE NOTICE
      =================================================== */}

      <div className="sports-cache-info">

        <span>
          ●
        </span>

        Updates refresh automatically
        every 24 hours.

      </div>

    </section>
  );
}

/* =========================================================
   MAIN CATEGORY PAGE
========================================================= */

export default function CategoryPage() {

  const { category } =
    useParams();

  const [
    stories,
    setStories
  ] = useState([]);

  const [
    popular,
    setPopular
  ] = useState([]);

  const [
    ads,
    setAds
  ] = useState([]);

  const [
    page,
    setPage
  ] = useState(1);

  const [
    totalPages,
    setTotalPages
  ] = useState(1);

  const [
    total,
    setTotal
  ] = useState(0);

  const [
    loading,
    setLoading
  ] = useState(true);

  const accent =
    CAT_COLORS[category] ||
    '#c0392b';

  /* =======================================================
     RESET PAGE
  ======================================================= */

  useEffect(() => {

    setPage(1);

  }, [category]);

  /* =======================================================
     LOAD CATEGORY DATA
  ======================================================= */

  useEffect(() => {

    const load = async () => {

      setLoading(true);

      try {

        const [
          sRes,
          pRes,
          aRes
        ] = await Promise.all([

          storiesAPI.getAll({
            category,
            page,
            limit: 12,
            status: 'published'
          }),

          storiesAPI.getPopular({
            category,
            limit: 5
          }),

          adsAPI.getAll()

        ]);

        setStories(
          sRes.data.stories || []
        );

        setTotalPages(
          sRes.data.pages || 1
        );

        setTotal(
          sRes.data.total || 0
        );

        setPopular(
          pRes.data || []
        );

        setAds(
          aRes.data || []
        );

      } catch (e) {

        console.error(
          e
        );

      } finally {

        setLoading(false);

      }

    };

    load();

  }, [category, page]);

  return (

    <PublicLayout>

      {/* ===================================================
          PAGE CSS
      =================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .cat-header-wrap {
          background:
            linear-gradient(
              135deg,
              ${accent},
              #071827
            );

          padding:
            22px 0 0;

          position:
            relative;

          overflow:
            hidden;

          box-shadow:
            0 8px 30px
            rgba(0,0,0,.12);
        }

        .cat-header-wrap::after {
          content: '';

          position:
            absolute;

          width:
            420px;

          height:
            420px;

          right:
            -180px;

          top:
            -260px;

          border-radius:
            50%;

          border:
            1px solid
            rgba(255,255,255,.12);
        }

        .cat-watermark {
          position:
            absolute;

          right:
            -20px;

          top:
            -20px;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size:
            140px;

          font-weight:
            900;

          color:
            rgba(255,255,255,.04);

          letter-spacing:
            -6px;

          line-height:
            1;

          pointer-events:
            none;

          text-transform:
            uppercase;

          user-select:
            none;
        }

        .cat-content-wrap {
          max-width:
            1260px;

          margin:
            0 auto;

          padding:
            32px 20px 60px;
        }

        .cat-main-grid {
          display:
            grid;

          grid-template-columns:
            minmax(0,1fr) 340px;

          gap:
            32px;

          align-items:
            start;
        }

        .cat-featured-story {
          display:
            block;

          position:
            relative;

          overflow:
            hidden;

          background:
            #000;

          height:
            390px;

          margin-bottom:
            28px;

          text-decoration:
            none;

          border-radius:
            4px;

          box-shadow:
            0 18px 45px
            rgba(0,0,0,.12);

          transform:
            translateZ(0);
        }

        .cat-featured-story img {
          transition:
            transform .6s ease,
            opacity .6s ease;
        }

        .cat-featured-story:hover img {
          transform:
            scale(1.04);

          opacity:
            .62 !important;
        }

        .cat-card-grid {
          display:
            grid;

          grid-template-columns:
            repeat(
              auto-fill,
              minmax(230px,1fr)
            );

          gap:
            20px;

          margin-bottom:
            28px;
        }

        .cat-sidebar-sticky {
          position:
            sticky;

          top:
            72px;
        }

        /* =================================================
           SPORTS SECTION
        ================================================= */

        .sports-section {

          margin:
            34px 0 38px;

          padding:
            26px;

          background:
            #f7f8fa;

          border:
            1px solid #e6e9ed;

          border-top:
            4px solid #0d3b6e;

          position:
            relative;

          overflow:
            hidden;

        }

        .sports-section::before {

          content:
            'SPORT';

          position:
            absolute;

          right:
            -15px;

          top:
            -35px;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size:
            110px;

          font-weight:
            900;

          color:
            rgba(13,59,110,.035);

          pointer-events:
            none;

        }

        .sports-heading {

          display:
            flex;

          align-items:
            flex-start;

          justify-content:
            space-between;

          gap:
            20px;

          margin-bottom:
            22px;

          position:
            relative;

          z-index:
            1;

        }

        .sports-kicker {

          display:
            block;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size:
            11px;

          font-weight:
            800;

          letter-spacing:
            2px;

          color:
            #0d3b6e;

          margin-bottom:
            5px;

        }

        .sports-heading h2 {

          margin:
            0;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size:
            clamp(
              1.8rem,
              4vw,
              2.5rem
            );

          font-weight:
            900;

          text-transform:
            uppercase;

          color:
            #101820;

          letter-spacing:
            -.5px;

        }

        .sports-heading p {

          margin:
            5px 0 0;

          color:
            #69727d;

          font-size:
            13px;

          max-width:
            600px;

          line-height:
            1.5;

        }

        .sports-live-badge {

          display:
            flex;

          align-items:
            center;

          gap:
            7px;

          background:
            #101820;

          color:
            #fff;

          padding:
            7px 11px;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size:
            10px;

          font-weight:
            800;

          letter-spacing:
            1px;

          white-space:
            nowrap;

        }

        .sports-live-badge span {

          width:
            7px;

          height:
            7px;

          background:
            #e53935;

          border-radius:
            50%;

          animation:
            sportsPulse 1.5s infinite;

        }

        @keyframes sportsPulse {

          0% {
            transform:
              scale(1);

            opacity:
              1;
          }

          50% {
            transform:
              scale(1.5);

            opacity:
              .45;
          }

          100% {
            transform:
              scale(1);

            opacity:
              1;
          }

        }

        .sports-leagues {

          display:
            flex;

          gap:
            7px;

          overflow-x:
            auto;

          padding-bottom:
            12px;

          margin-bottom:
            17px;

          scrollbar-width:
            thin;

        }

        .sports-leagues button {

          border:
            1px solid #d8dde3;

          background:
            #fff;

          color:
            #48515a;

          padding:
            8px 12px;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size:
            10px;

          font-weight:
            800;

          letter-spacing:
            .8px;

          white-space:
            nowrap;

          cursor:
            pointer;

          transition:
            all .2s ease;

        }

        .sports-leagues button:hover {

          border-color:
            #0d3b6e;

          color:
            #0d3b6e;

        }

        .sports-leagues button.active {

          background:
            #0d3b6e;

          border-color:
            #0d3b6e;

          color:
            #fff;

        }

        .sports-grid {

          display:
            grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0,1fr)
            );

          gap:
            13px;

        }

        .sports-match-card {

          background:
            #fff;

          border:
            1px solid #e2e6ea;

          padding:
            14px;

          transition:
            transform .25s ease,
            box-shadow .25s ease;

        }

        .sports-match-card:hover {

          transform:
            translateY(-3px);

          box-shadow:
            0 10px 25px
            rgba(0,0,0,.08);

        }

        .sports-match-top {

          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            8px;

          margin-bottom:
            13px;

        }

        .sports-league-name {

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size:
            9px;

          font-weight:
            800;

          color:
            #777;

          text-transform:
            uppercase;

          letter-spacing:
            .7px;

        }

        .sports-status {

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size:
            9px;

          font-weight:
            800;

          color:
            #78818b;

        }

        .sports-status.live {

          color:
            #d32f2f;

          animation:
            sportsTextPulse 1.5s infinite;

        }

        @keyframes sportsTextPulse {

          50% {
            opacity:
              .45;
          }

        }

        .sports-teams {

          display:
            grid;

          grid-template-columns:
            1fr 55px 1fr;

          align-items:
            center;

          gap:
            8px;

        }

        .sports-team {

          display:
            flex;

          flex-direction:
            column;

          align-items:
            center;

          text-align:
            center;

          gap:
            6px;

          min-width:
            0;

        }

        .sports-team img {

          width:
            30px;

          height:
            30px;

          object-fit:
            contain;

        }

        .sports-team span {

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size:
            12px;

          font-weight:
            700;

          color:
            #20262c;

          line-height:
            1.15;

        }

        .sports-score {

          display:
            flex;

          justify-content:
            center;

          align-items:
            center;

          gap:
            5px;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size:
            20px;

          color:
            #101820;

        }

        .sports-vs {

          font-size:
            11px;

          font-weight:
            800;

          color:
            #0d3b6e;

        }

        .sports-match-footer {

          border-top:
            1px solid #edf0f2;

          margin-top:
            13px;

          padding-top:
            9px;

          display:
            flex;

          justify-content:
            space-between;

          gap:
            10px;

          color:
            #9299a1;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size:
            9px;

        }

        .sports-cache-info {

          margin-top:
            16px;

          color:
            #8a929b;

          font-size:
            10px;

          font-family:
            'Barlow Condensed',
            sans-serif;

          letter-spacing:
            .6px;

        }

        .sports-cache-info span {

          color:
            #2e7d32;

          margin-right:
            5px;

        }

        .sports-empty {

          min-height:
            130px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          flex-direction:
            column;

          gap:
            6px;

          color:
            #89919a;

          text-align:
            center;

          font-size:
            13px;

        }

        .sports-empty-icon {

          font-size:
            30px;

          margin-bottom:
            3px;

        }

        .sports-loading {

          padding:
            20px 0;

        }

        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (max-width: 1100px) {

          .cat-main-grid {
            grid-template-columns:
              1fr;
          }

          .cat-sidebar-sticky {
            position:
              static;
          }

          .sports-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(0,1fr)
              );
          }

        }

        @media (max-width: 768px) {

          .cat-content-wrap {
            padding:
              24px 16px 40px;
          }

          .cat-featured-story {
            height:
              300px;
          }

          .cat-watermark {
            font-size:
              90px;

            right:
              -10px;

            top:
              -10px;
          }

          .cat-header-wrap {
            padding:
              18px 0 0;
          }

          .sports-section {
            padding:
              20px 15px;
          }

          .sports-heading {
            flex-direction:
              column;
          }

          .sports-grid {
            grid-template-columns:
              1fr;
          }

          .sports-live-badge {
            align-self:
              flex-start;
          }

        }

        @media (max-width: 560px) {

          .cat-featured-story {
            height:
              230px;
          }

          .cat-featured-overlay {
            padding:
              30px 16px 16px !important;
          }

          .cat-featured-title {
            font-size:
              1.2rem !important;

            line-height:
              1.2 !important;
          }

          .cat-card-grid {
            grid-template-columns:
              1fr !important;

            gap:
              16px !important;
          }

          .sports-section {
            margin:
              25px -2px 30px;
          }

          .sports-heading h2 {
            font-size:
              1.7rem;
          }

        }

      `}</style>

      {/* ===================================================
          CATEGORY HEADER
      =================================================== */}

      <div className="cat-header-wrap">

        <div className="cat-watermark">
          {(category || '')
            .substring(0, 8)}
        </div>

        <div
          style={{
            maxWidth: 1260,
            margin: '0 auto',
            padding: '0 20px'
          }}
        >

          <div
            style={{
              fontFamily:
                "'Barlow Condensed',sans-serif",
              fontSize: 11,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color:
                'rgba(255,255,255,.5)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 14
            }}
          >

            <Link
              to="/"
              style={{
                color:
                  'rgba(255,255,255,.5)',
                textDecoration:
                  'none'
              }}
            >
              Home
            </Link>

            <span>›</span>

            <span
              style={{
                color:
                  'rgba(255,255,255,.8)'
              }}
            >
              {category}
            </span>

          </div>

          <h1
            style={{
              fontFamily:
                "'Barlow Condensed',sans-serif",
              fontWeight: 900,
              fontSize:
                'clamp(1.6rem,4vw,3rem)',
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#fff',
              marginBottom: 16
            }}
          >

            {category}

            <span
              style={{
                fontSize: '1rem',
                fontWeight: 400,
                opacity: .5,
                marginLeft: 10
              }}
            >
              ({total} stories)
            </span>

          </h1>

          <div
            style={{
              display: 'flex',
              gap: 0,
              flexWrap: 'wrap',
              borderTop:
                '1px solid rgba(255,255,255,.1)',
              marginTop: 8
            }}
          >

            <span
              style={{
                fontFamily:
                  "'Barlow Condensed',sans-serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                color: '#fff',
                padding: '12px 18px',
                borderRight:
                  '1px solid rgba(255,255,255,.06)',
                background:
                  'rgba(255,255,255,.1)'
              }}
            >
              {category}
            </span>

            <span
              style={{
                fontFamily:
                  "'Barlow Condensed',sans-serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                color:
                  'rgba(255,255,255,.55)',
                padding: '12px 18px'
              }}
            >
              All Stories
            </span>

          </div>

        </div>

      </div>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div className="cat-content-wrap">

        {/* ADVERTISEMENT */}

        <AdBanner
          ads={ads}
          height={110}
        />

        {/* =================================================
            SPORT ONLY
        ================================================= */}

        {category === 'Sport' && (
          <SportsUpdates />
        )}

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="cat-main-grid">

          <div>

            {loading ? (

              <Spinner />

            ) : stories.length === 0 ? (

              <EmptyState
                icon="📰"
                title={`No ${category} stories yet`}
                message="Check back soon for the latest updates."
              />

            ) : (

              <>

                {/* FEATURED */}

                <Link
                  to={`/story/${
                    stories[0]._id ||
                    stories[0].id
                  }`}
                  className="cat-featured-story"
                >

                  <img
                    src={imgUrl(
                      stories[0].image
                    )}
                    alt=""
                    loading="eager"
                    onError={e => {

                      e.target.onerror =
                        null;

                      e.target.src =
                        '/placeholder.jpg';

                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: .75
                    }}
                  />

                  <div
                    className="cat-featured-overlay"
                    style={{
                      position:
                        'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background:
                        'linear-gradient(transparent,rgba(0,0,0,.95))',
                      padding:
                        '50px 24px 24px'
                    }}
                  >

                    <div
                      style={{
                        background:
                          accent,
                        display:
                          'inline-block',
                        padding:
                          '3px 10px',
                        fontFamily:
                          "'Barlow Condensed',sans-serif",
                        fontWeight: 800,
                        fontSize: 10,
                        letterSpacing: 2,
                        color: '#fff',
                        marginBottom: 10
                      }}
                    >
                      {stories[0].category}
                    </div>

                    <h2
                      className="cat-featured-title"
                      style={{
                        fontFamily:
                          "'Playfair Display',serif",
                        fontSize:
                          'clamp(1.3rem,2.5vw,2rem)',
                        fontWeight: 900,
                        color: '#fff',
                        lineHeight: 1.15,
                        margin: 0
                      }}
                    >
                      {stories[0].title}
                    </h2>

                  </div>

                </Link>

                {/* STORY GRID */}

                <div className="cat-card-grid">

                  {stories
                    .slice(1)
                    .map(
                      story => (

                        <GridCard
                          key={
                            story._id ||
                            story.id
                          }
                          story={story}
                        />

                      )
                    )}

                </div>

                {/* PAGINATION */}

                <Pagination
                  page={page}
                  totalPages={
                    totalPages
                  }
                  onChange={
                    setPage
                  }
                />

              </>

            )}

          </div>

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside>

            <div
              className=
                "cat-sidebar-sticky"
            >

              <div
                style={{
                  background:
                    '#fff',
                  border:
                    '1px solid #e8e4d8',
                  padding: 20,
                  marginBottom: 22,
                  borderTop:
                    `3px solid ${accent}`
                }}
              >

                <SectionLabel>
                  🔥 Most Read
                </SectionLabel>

                {popular.map(
                  (p, i) => (

                    <PopularItem
                      key={
                        p._id ||
                        p.id
                      }
                      story={p}
                      rank={i + 1}
                    />

                  )
                )}

                {popular.length === 0 && (

                  <p
                    style={{
                      color:
                        '#bbb',
                      fontStyle:
                        'italic',
                      fontSize: 13
                    }}
                  >
                    No popular
                    stories yet.
                  </p>

                )}

              </div>

              <NewsletterWidget />

              <WhatsAppCTA />

            </div>

          </aside>

        </div>

      </div>

    </PublicLayout>
  );
}
