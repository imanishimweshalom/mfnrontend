
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

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
  adsAPI,
  sportsAPI
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
    short: 'BK Pro League',
    id: 567
  }
];

/* =========================================================
   SPORTS CONFIG
========================================================= */

const SPORTS_STORAGE_KEY = 'mfn_sports_dashboard_v5';
const SPORTS_STORAGE_TIME_KEY = 'mfn_sports_dashboard_timestamp_v5';

/*
 * Frontend refresh:
 * Every 5 minutes.
 */
const SPORTS_REFRESH_INTERVAL = 5 * 60 * 1000;

/*
 * Cache is considered usable for 5 minutes.
 * Cached data is still displayed immediately while
 * fresh data is requested in the background.
 */
const SPORTS_CACHE_DURATION = 5 * 60 * 1000;

/*
 * How many days around today to request.
 */
const FIXTURE_DAYS_BEFORE = 2;
const FIXTURE_DAYS_AFTER = 10;

/* =========================================================
   HELPERS
========================================================= */

const getDateString = (date = new Date()) => {
  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return '';
  }

  return d.toISOString().split('T')[0];
};

const getDateOffset = (days) => {
  const d = new Date();

  d.setDate(d.getDate() + days);

  return getDateString(d);
};

/* =========================================================
   TIMEZONE-SAFE DATE FORMAT
========================================================= */

const formatMatchTime = (date) => {
  if (!date) {
    return '';
  }

  try {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
};

const formatShortDate = (date) => {
  if (!date) {
    return '';
  }

  try {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toLocaleDateString([], {
      day: '2-digit',
      month: 'short'
    });
  } catch {
    return '';
  }
};

/* =========================================================
   CURRENT SEASON
========================================================= */

const getSeason = () => {
  const now = new Date();
  const month = now.getMonth() + 1;

  /*
   * August -> new football season.
   *
   * Example:
   * August 2026 => 2026
   * July 2026   => 2025
   */
  return month >= 8
    ? now.getFullYear()
    : now.getFullYear() - 1;
};

/* =========================================================
   MATCH STATUS
========================================================= */

const getMatchStatus = (fixture) => {
  const status = fixture?.fixture?.status;

  if (!status) {
    return '';
  }

  const short = String(
    status.short || ''
  ).toUpperCase();

  if (
    ['FT', 'AET', 'PEN'].includes(short)
  ) {
    return 'FULL TIME';
  }

  if (
    [
      'LIVE',
      '1H',
      '2H',
      'ET',
      'BT',
      'P',
      'HT',
      'INT'
    ].includes(short)
  ) {
    return 'LIVE';
  }

  if (
    ['NS', 'TBD'].includes(short)
  ) {
    return 'UPCOMING';
  }

  return status.long || status.short || '';
};

/* =========================================================
   ARRAY EXTRACTION
========================================================= */

const extractArray = (data, keys = []) => {
  if (Array.isArray(data)) {
    return data;
  }

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  return [];
};

/* =========================================================
   SPORTS RESPONSE HELPERS
========================================================= */

const normalizeFixtures = (response) => {
  const data = response?.data;

  const raw =
    data?.response ??
    data;

  return extractArray(
    raw,
    [
      'fixtures',
      'matches',
      'data'
    ]
  );
};

const normalizeStandings = (response) => {
  const data = response?.data;

  const raw =
    data?.response ??
    data;

  if (Array.isArray(raw)) {
    return raw;
  }

  if (
    Array.isArray(
      raw?.league?.standings?.[0]
    )
  ) {
    return raw.league.standings[0];
  }

  if (
    Array.isArray(
      raw?.standings?.[0]
    )
  ) {
    return raw.standings[0];
  }

  return extractArray(
    raw,
    [
      'standings',
      'table',
      'data'
    ]
  );
};

const normalizeTopScorers = (response) => {
  const data = response?.data;

  const raw =
    data?.response ??
    data;

  if (Array.isArray(raw)) {
    return raw;
  }

  return extractArray(
    raw,
    [
      'topScorers',
      'topscorers',
      'scorers',
      'players',
      'data'
    ]
  );
};

/* =========================================================
   IMAGE ERROR
========================================================= */

const handleImageError = (event) => {
  if (!event?.currentTarget) {
    return;
  }

  event.currentTarget.onerror = null;

  event.currentTarget.src =
    '/placeholder.jpg';
};

/* =========================================================
   SPORTS FETCH
========================================================= */

const fetchLeagueSports = async (league) => {
  const params = {
    league: league.id,
    season: getSeason()
  };

  const fixtureParams = {
    ...params,
    from: getDateOffset(
      -FIXTURE_DAYS_BEFORE
    ),
    to: getDateOffset(
      FIXTURE_DAYS_AFTER
    )
  };

  /*
   * We deliberately use Promise.allSettled here.
   *
   * If standings fail, fixtures can still load.
   * If top scorers fail, fixtures can still load.
   */
  const [
    fixturesResult,
    standingsResult,
    scorersResult
  ] = await Promise.allSettled([
    sportsAPI.getFixtures(
      fixtureParams
    ),

    sportsAPI.getStandings(
      params
    ),

    sportsAPI.getTopScorers(
      params
    )
  ]);

  const fixtures =
    fixturesResult.status === 'fulfilled'
      ? normalizeFixtures(
          fixturesResult.value
        )
      : [];

  const standings =
    standingsResult.status === 'fulfilled'
      ? normalizeStandings(
          standingsResult.value
        )
      : [];

  const scorers =
    scorersResult.status === 'fulfilled'
      ? normalizeTopScorers(
          scorersResult.value
        )
      : [];

  return {
    league,
    fixtures,
    standings,
    scorers,

    errors: {
      fixtures:
        fixturesResult.status ===
        'rejected'
          ? fixturesResult.reason
          : null,

      standings:
        standingsResult.status ===
        'rejected'
          ? standingsResult.reason
          : null,

      scorers:
        scorersResult.status ===
        'rejected'
          ? scorersResult.reason
          : null
    }
  };
};

/* =========================================================
   SPORTS MATCH CARD
========================================================= */

function SportMatchCard({
  fixture,
  league
}) {
  const home =
    fixture?.teams?.home || {};

  const away =
    fixture?.teams?.away || {};

  const goals =
    fixture?.goals || {};

  const status =
    getMatchStatus(fixture);

  const isLive =
    status === 'LIVE';

  const isFinished =
    status === 'FULL TIME';

  const homeScore =
    goals?.home;

  const awayScore =
    goals?.away;

  return (
    <article
      className={
        `sports-match-card ${
          isLive
            ? 'sports-match-live'
            : ''
        }`
      }
    >

      <div className="sports-match-top">

        <div className="sports-league-name">
          {league?.short ||
            'Football'}
        </div>

        <div
          className={
            isLive
              ? 'sports-status live'
              : 'sports-status'
          }
        >
          {status ||
            'UPCOMING'}
        </div>

      </div>

      <div className="sports-teams">

        <div className="sports-team">

          {home?.logo ? (
            <img
              src={home.logo}
              alt={
                home?.name ||
                'Home team'
              }
              loading="lazy"
              onError={
                handleImageError
              }
            />
          ) : (
            <div className="sports-team-placeholder">
              ⚽
            </div>
          )}

          <span>
            {home?.name ||
              'Home'}
          </span>

        </div>

        <div className="sports-score">

          {isFinished ||
          isLive ? (
            <>
              <strong>
                {homeScore ??
                  0}
              </strong>

              <span>:</span>

              <strong>
                {awayScore ??
                  0}
              </strong>
            </>
          ) : (
            <div>
              <span className="sports-vs">
                {formatMatchTime(
                  fixture
                    ?.fixture
                    ?.date
                )}
              </span>

              <small>
                {formatShortDate(
                  fixture
                    ?.fixture
                    ?.date
                )}
              </small>
            </div>
          )}

        </div>

        <div className="sports-team">

          {away?.logo ? (
            <img
              src={away.logo}
              alt={
                away?.name ||
                'Away team'
              }
              loading="lazy"
              onError={
                handleImageError
              }
            />
          ) : (
            <div className="sports-team-placeholder">
              ⚽
            </div>
          )}

          <span>
            {away?.name ||
              'Away'}
          </span>

        </div>

      </div>

      <div className="sports-match-footer">

        <span>
          {fixture
            ?.fixture
            ?.venue
            ?.name ||
            'Football'}
        </span>

        <span>
          {formatShortDate(
            fixture
              ?.fixture
              ?.date
          )}
        </span>

      </div>

    </article>
  );
}

/* =========================================================
   STANDINGS
========================================================= */

function SportsStandings({
  rows,
  league
}) {
  if (
    !Array.isArray(rows) ||
    rows.length === 0
  ) {
    return (
      <div className="sports-empty">

        <div className="sports-empty-icon">
          📊
        </div>

        <strong>
          Standings unavailable
        </strong>

        <span>
          No table data is available
          for{' '}
          {league?.short ||
            'this league'}.
        </span>

      </div>
    );
  }

  return (
    <div className="sports-panel">

      <div className="sports-panel-title">

        <div>

          <span>
            📊 LEAGUE TABLE
          </span>

          <h3>
            {league?.name ||
              'Standings'}
          </h3>

        </div>

      </div>

      <div className="sports-table-wrap">

        <table className="sports-table">

          <thead>

            <tr>
              <th>#</th>
              <th>Team</th>
              <th>P</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GD</th>
              <th>PTS</th>
            </tr>

          </thead>

          <tbody>

            {rows
              .slice(0, 20)
              .map(
                (
                  row,
                  index
                ) => {

                  const team =
                    row?.team ||
                    {};

                  const rank =
                    row?.rank ??
                    row?.position ??
                    index + 1;

                  const played =
                    row?.all
                      ?.played ??
                    row?.played ??
                    0;

                  const wins =
                    row?.all
                      ?.win ??
                    row?.wins ??
                    0;

                  const draws =
                    row?.all
                      ?.draw ??
                    row?.draws ??
                    0;

                  const losses =
                    row?.all
                      ?.lose ??
                    row?.losses ??
                    0;

                  const goalsFor =
                    Number(
                      row?.all
                        ?.goals
                        ?.for ??
                      row?.goals
                        ?.for ??
                      0
                    );

                  const goalsAgainst =
                    Number(
                      row?.all
                        ?.goals
                        ?.against ??
                      row?.goals
                        ?.against ??
                      0
                    );

                  const goalDifference =
                    row?.goalsDiff ??
                    row?.goalDifference ??
                    goalsFor -
                      goalsAgainst;

                  const points =
                    row?.points ??
                    row?.pts ??
                    0;

                  return (
                    <tr
                      key={
                        team?.id ||
                        `${league?.key}-${index}`
                      }
                    >

                      <td>
                        {rank}
                      </td>

                      <td>

                        <div className="sports-table-team">

                          {team?.logo ? (
                            <img
                              src={
                                team.logo
                              }
                              alt={
                                team?.name ||
                                'Team'
                              }
                              loading="lazy"
                              onError={
                                handleImageError
                              }
                            />
                          ) : (
                            <span>
                              ⚽
                            </span>
                          )}

                          <strong>
                            {team?.name ||
                              'Unknown team'}
                          </strong>

                        </div>

                      </td>

                      <td>
                        {played}
                      </td>

                      <td>
                        {wins}
                      </td>

                      <td>
                        {draws}
                      </td>

                      <td>
                        {losses}
                      </td>

                      <td>
                        {goalDifference}
                      </td>

                      <td>
                        <strong>
                          {points}
                        </strong>
                      </td>

                    </tr>
                  );
                }
              )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

/* =========================================================
   TOP SCORERS
========================================================= */

function SportsTopScorers({
  players,
  league
}) {
  if (
    !Array.isArray(players) ||
    players.length === 0
  ) {
    return (
      <div className="sports-empty">

        <div className="sports-empty-icon">
          🏆
        </div>

        <strong>
          Top scorers unavailable
        </strong>

        <span>
          No scorer data is available
          for{' '}
          {league?.short ||
            'this league'}.
        </span>

      </div>
    );
  }

  return (
    <div className="sports-panel">

      <div className="sports-panel-title">

        <div>

          <span>
            🏆 TOP SCORERS
          </span>

          <h3>
            {league?.name ||
              'Top Scorers'}
          </h3>

        </div>

      </div>

      <div className="sports-scorers-grid">

        {players
          .slice(0, 10)
          .map(
            (
              item,
              index
            ) => {

              const player =
                item?.player ||
                {};

              const statistics =
                Array.isArray(
                  item?.statistics
                )
                  ? item
                      .statistics[0] ||
                    {}
                  : item?.statistics ||
                    {};

              const team =
                statistics
                  ?.team ||
                item?.team ||
                {};

              const goals =
                statistics
                  ?.goals
                  ?.total ??
                item?.goals ??
                0;

              const assists =
                statistics
                  ?.goals
                  ?.assists ??
                item?.assists ??
                0;

              return (
                <div
                  className="sports-scorer-card"
                  key={
                    player?.id ||
                    `${league?.key}-${index}`
                  }
                >

                  <div className="sports-scorer-rank">
                    {index + 1}
                  </div>

                  {player?.photo ? (
                    <img
                      src={
                        player.photo
                      }
                      alt={
                        player?.name ||
                        'Player'
                      }
                      loading="lazy"
                      onError={
                        handleImageError
                      }
                    />
                  ) : (
                    <div className="sports-scorer-placeholder">
                      👤
                    </div>
                  )}

                  <div className="sports-scorer-info">

                    <strong>
                      {player?.name ||
                        'Unknown player'}
                    </strong>

                    <span>
                      {team?.name ||
                        'Unknown team'}
                    </span>

                  </div>

                  <div className="sports-scorer-stats">

                    <strong>
                      {goals}
                    </strong>

                    <span>
                      GOALS
                    </span>

                    <small>
                      {assists}{' '}
                      assists
                    </small>

                  </div>

                </div>
              );
            }
          )}

      </div>

    </div>
  );
}

/* =========================================================
   SPORTS UPDATES
========================================================= */

function SportsUpdates() {

  const [sports, setSports] =
    useState([]);

  const [standings, setStandings] =
    useState({});

  const [topScorers, setTopScorers] =
    useState({});

  const [sportsLoading, setSportsLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [sportsError, setSportsError] =
    useState('');

  const [lastUpdated, setLastUpdated] =
    useState(null);

  const [activeLeague, setActiveLeague] =
    useState('ALL');

  const [activeTab, setActiveTab] =
    useState('matches');

  /*
   * Prevents overlapping refresh requests.
   */
  const refreshingRef =
    useRef(false);

  /* =======================================================
     LOAD SPORTS
  ======================================================= */

  const loadSports = async (
    background = false
  ) => {

    if (
      refreshingRef.current
    ) {
      return;
    }

    refreshingRef.current = true;

    if (background) {
      setRefreshing(true);
    } else {
      setSportsLoading(true);
    }

    setSportsError('');

    try {

      /*
       * -----------------------------------------------------
       * First read cache.
       *
       * Only on initial loading.
       * -----------------------------------------------------
       */

      if (!background) {

        try {

          const stored =
            localStorage.getItem(
              SPORTS_STORAGE_KEY
            );

          const storedTime =
            localStorage.getItem(
              SPORTS_STORAGE_TIME_KEY
            );

          if (
            stored &&
            storedTime
          ) {

            const parsed =
              JSON.parse(stored);

            const cacheAge =
              Date.now() -
              Number(
                storedTime
              );

            /*
             * Display cache immediately.
             */
            if (
              parsed &&
              cacheAge <
                SPORTS_CACHE_DURATION
            ) {

              setSports(
                Array.isArray(
                  parsed.sports
                )
                  ? parsed.sports
                  : []
              );

              setStandings(
                parsed.standings ||
                {}
              );

              setTopScorers(
                parsed.topScorers ||
                {}
              );

              setLastUpdated(
                Number(
                  storedTime
                )
              );

              /*
               * Do NOT return here.
               *
               * We continue and fetch fresh
               * data in the background.
               */
            }

          }

        } catch (cacheError) {

          console.warn(
            'Sports cache read error:',
            cacheError
          );

        }

      }

      /* =====================================================
         FETCH ALL LEAGUES
      ===================================================== */

      const results =
        await Promise.allSettled(

          SPORTS_LEAGUES.map(
            league =>
              fetchLeagueSports(
                league
              )
          )

        );

      const allFixtures = [];
      const nextStandings = {};
      const nextTopScorers = {};

      let successfulLeagues = 0;

      /* =====================================================
         PROCESS RESULTS
      ===================================================== */

      results.forEach(
        result => {

          if (
            result.status !==
            'fulfilled'
          ) {
            return;
          }

          successfulLeagues++;

          const {
            league,
            fixtures,
            standings: table,
            scorers
          } =
            result.value;

          /* -------------------------------------------------
             FIXTURES
          ------------------------------------------------- */

          if (
            Array.isArray(
              fixtures
            )
          ) {

            fixtures.forEach(
              fixture => {

                allFixtures.push({

                  ...fixture,

                  mfnLeagueKey:
                    league.key,

                  mfnLeagueId:
                    league.id,

                  mfnLeagueName:
                    league.name,

                  mfnLeagueShort:
                    league.short

                });

              }
            );

          }

          /* -------------------------------------------------
             STANDINGS
          ------------------------------------------------- */

          nextStandings[
            league.key
          ] =
            Array.isArray(
              table
            )
              ? table
              : [];

          /* -------------------------------------------------
             TOP SCORERS
          ------------------------------------------------- */

          nextTopScorers[
            league.key
          ] =
            Array.isArray(
              scorers
            )
              ? scorers
              : [];

        }
      );

      /* =====================================================
         REMOVE DUPLICATES
      ===================================================== */

      const uniqueFixtures =
        Array.from(
          new Map(

            allFixtures.map(
              fixture => {

                const fixtureId =
                  fixture
                    ?.fixture
                    ?.id ||
                  `${fixture?.mfnLeagueKey}-${fixture?.fixture?.date}-${fixture?.teams?.home?.id}-${fixture?.teams?.away?.id}`;

                return [
                  fixtureId,
                  fixture
                ];

              }
            )

          ).values()
        );

      /* =====================================================
         SORT FIXTURES
      ===================================================== */

      uniqueFixtures.sort(
        (a, b) => {

          const aDate =
            new Date(
              a?.fixture?.date ||
              0
            ).getTime();

          const bDate =
            new Date(
              b?.fixture?.date ||
              0
            ).getTime();

          return (
            aDate - bDate
          );

        }
      );

      /* =====================================================
         CACHE
      ===================================================== */

      const payload = {

        sports:
          uniqueFixtures,

        standings:
          nextStandings,

        topScorers:
          nextTopScorers

      };

      const updatedAt =
        Date.now();

      try {

        localStorage.setItem(
          SPORTS_STORAGE_KEY,
          JSON.stringify(
            payload
          )
        );

        localStorage.setItem(
          SPORTS_STORAGE_TIME_KEY,
          String(
            updatedAt
          )
        );

      } catch (storageError) {

        console.warn(
          'Sports cache save failed:',
          storageError
        );

      }

      /* =====================================================
         UPDATE STATE
      ===================================================== */

      setSports(
        uniqueFixtures
      );

      setStandings(
        nextStandings
      );

      setTopScorers(
        nextTopScorers
      );

      setLastUpdated(
        updatedAt
      );

      /*
       * We only display an error when every league
       * failed or absolutely no sports data exists.
       */
      if (
        successfulLeagues === 0 ||
        (
          uniqueFixtures.length === 0 &&
          Object.keys(
            nextStandings
          ).length === 0
        )
      ) {

        setSportsError(
          'Sports data is currently unavailable. The system will try again automatically.'
        );

      } else {

        setSportsError('');

      }

    } catch (error) {

      console.error(
        'Sports dashboard error:',
        error
      );

      setSportsError(
        'Unable to refresh sports data. Retrying automatically...'
      );

    } finally {

      refreshingRef.current =
        false;

      setSportsLoading(false);
      setRefreshing(false);

    }

  };

  /* =======================================================
     INITIAL LOAD + AUTOMATIC REFRESH
  ======================================================= */

  useEffect(() => {

    let cancelled = false;

    const initialLoad =
      async () => {

        if (cancelled) {
          return;
        }

        await loadSports(
          false
        );

      };

    initialLoad();

    /*
     * -------------------------------------------------------
     * AUTOMATIC REFRESH EVERY 5 MINUTES
     * -------------------------------------------------------
     */

    const interval =
      window.setInterval(
        () => {

          if (!cancelled) {

            loadSports(
              true
            );

          }

        },
        SPORTS_REFRESH_INTERVAL
      );

    /*
     * -------------------------------------------------------
     * REFRESH WHEN USER RETURNS TO TAB
     *
     * This is useful because browsers may pause intervals
     * while the tab is in the background.
     * -------------------------------------------------------
     */

    const handleVisibility =
      () => {

        if (
          document.visibilityState ===
          'visible'
        ) {

          loadSports(
            true
          );

        }

      };

    document.addEventListener(
      'visibilitychange',
      handleVisibility
    );

    /*
     * -------------------------------------------------------
     * REFRESH WHEN INTERNET RETURNS
     * -------------------------------------------------------
     */

    const handleOnline =
      () => {

        loadSports(
          true
        );

      };

    window.addEventListener(
      'online',
      handleOnline
    );

    return () => {

      cancelled = true;

      window.clearInterval(
        interval
      );

      document.removeEventListener(
        'visibilitychange',
        handleVisibility
      );

      window.removeEventListener(
        'online',
        handleOnline
      );

    };

  }, []);

  /* =======================================================
     MANUAL REFRESH
  ======================================================= */

  const handleManualRefresh =
    () => {

      loadSports(
        true
      );

    };

  /* =======================================================
     SELECTED LEAGUE
  ======================================================= */

  const selectedLeague =
    SPORTS_LEAGUES.find(
      league =>
        league.key ===
        activeLeague
    );

  /* =======================================================
     FILTER MATCHES
  ======================================================= */

  const filteredSports =
    activeLeague === 'ALL'
      ? sports
      : sports.filter(
          item =>
            item?.mfnLeagueKey ===
            activeLeague
        );

  /* =======================================================
     SELECTED DATA
  ======================================================= */

  const displayedStandings =
    activeLeague === 'ALL'
      ? []
      : standings?.[
          activeLeague
        ] || [];

  const displayedScorers =
    activeLeague === 'ALL'
      ? []
      : topScorers?.[
          activeLeague
        ] || [];

  /* =======================================================
     COUNTS
  ======================================================= */

  const liveMatches =
    filteredSports.filter(
      fixture =>
        getMatchStatus(
          fixture
        ) === 'LIVE'
    );

  const upcomingMatches =
    filteredSports.filter(
      fixture =>
        getMatchStatus(
          fixture
        ) === 'UPCOMING'
    );

  const finishedMatches =
    filteredSports.filter(
      fixture =>
        getMatchStatus(
          fixture
        ) === 'FULL TIME'
    );

  /* =======================================================
     LAST UPDATED LABEL
  ======================================================= */

  const lastUpdatedLabel =
    lastUpdated
      ? new Date(
          lastUpdated
        ).toLocaleTimeString(
          [],
          {
            hour: '2-digit',
            minute: '2-digit'
          }
        )
      : '--:--';

  /* =======================================================
     LOADING
  ======================================================= */

  if (sportsLoading) {

    return (
      <section className="sports-section">

        <div className="sports-heading">

          <div>

            <span className="sports-kicker">
              ⚽ SPORT UPDATE
            </span>

            <h2>
              Football Centre
            </h2>

            <p>
              Loading fixtures,
              standings and top
              scorers...
            </p>

          </div>

          <div className="sports-live-badge">
            <span />
            LOADING
          </div>

        </div>

        <div className="sports-loading">

          <Spinner />

        </div>

      </section>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className="sports-section">

      {/* =================================================
          HEADING
      ================================================= */}

      <div className="sports-heading">

        <div>

          <span className="sports-kicker">
            ⚽ SPORT UPDATE
          </span>

          <h2>
            Football Centre
          </h2>

          <p>
            Live scores, fixtures,
            standings and top
            scorers from major
            football leagues and
            Rwanda's football league.
          </p>

        </div>

        <div className="sports-heading-actions">

          <div className="sports-live-badge">
            <span />
            {liveMatches.length > 0
              ? `${liveMatches.length} LIVE`
              : 'LIVE DATA'}
          </div>

          <button
            type="button"
            className="sports-refresh-button"
            onClick={
              handleManualRefresh
            }
            disabled={refreshing}
            title="Refresh sports data"
          >
            <span
              className={
                refreshing
                  ? 'sports-refresh-icon spinning'
                  : 'sports-refresh-icon'
              }
            >
              ↻
            </span>

            {refreshing
              ? 'Updating...'
              : 'Refresh'}
          </button>

        </div>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {sportsError && (

        <div className="sports-error">

          <strong>
            ⚠️ {sportsError}
          </strong>

          <span>
            The sports centre will
            automatically try again.
          </span>

        </div>

      )}

      {/* =================================================
          LEAGUES
      ================================================= */}

      <div className="sports-leagues">

        <button
          type="button"
          className={
            activeLeague === 'ALL'
              ? 'active'
              : ''
          }
          onClick={() => {

            setActiveLeague(
              'ALL'
            );

            setActiveTab(
              'matches'
            );

          }}
        >
          ALL
        </button>

        {SPORTS_LEAGUES.map(
          league => (

            <button
              type="button"
              key={
                league.key
              }
              className={
                activeLeague ===
                league.key
                  ? 'active'
                  : ''
              }
              onClick={() => {

                setActiveLeague(
                  league.key
                );

                setActiveTab(
                  'matches'
                );

              }}
            >
              {league.short}
            </button>

          )
        )}

      </div>

      {/* =================================================
          TABS
      ================================================= */}

      <div className="sports-tabs">

        <button
          type="button"
          className={
            activeTab ===
            'matches'
              ? 'active'
              : ''
          }
          onClick={() =>
            setActiveTab(
              'matches'
            )
          }
        >
          ⚽ Matches
        </button>

        <button
          type="button"
          className={
            activeTab ===
            'standings'
              ? 'active'
              : ''
          }
          onClick={() =>
            setActiveTab(
              'standings'
            )
          }
          disabled={
            activeLeague ===
            'ALL'
          }
        >
          📊 Standings
        </button>

        <button
          type="button"
          className={
            activeTab ===
            'scorers'
              ? 'active'
              : ''
          }
          onClick={() =>
            setActiveTab(
              'scorers'
            )
          }
          disabled={
            activeLeague ===
            'ALL'
          }
        >
          🏆 Top Scorers
        </button>

      </div>

      {/* =================================================
          MATCHES
      ================================================= */}

      {activeTab ===
        'matches' && (

        <>

          <div className="sports-summary-grid">

            <div>

              <strong>
                {liveMatches.length}
              </strong>

              <span>
                LIVE
              </span>

            </div>

            <div>

              <strong>
                {upcomingMatches.length}
              </strong>

              <span>
                UPCOMING
              </span>

            </div>

            <div>

              <strong>
                {finishedMatches.length}
              </strong>

              <span>
                FINISHED
              </span>

            </div>

            <div>

              <strong>
                {filteredSports.length}
              </strong>

              <span>
                TOTAL
              </span>

            </div>

          </div>

          {filteredSports.length ===
          0 ? (

            <div className="sports-empty">

              <div className="sports-empty-icon">
                ⚽
              </div>

              <strong>
                No matches found
              </strong>

              <span>
                No fixtures are
                currently available
                for the selected
                league and dates.
              </span>

            </div>

          ) : (

            <div className="sports-grid">

              {filteredSports
                .slice(0, 30)
                .map(
                  (
                    fixture,
                    index
                  ) => (

                    <SportMatchCard
                      key={
                        fixture
                          ?.fixture
                          ?.id ||
                        `${fixture?.mfnLeagueKey}-${index}`
                      }
                      fixture={
                        fixture
                      }
                      league={{
                        short:
                          fixture
                            ?.mfnLeagueShort ||
                          'Football'
                      }}
                    />

                  )
                )}

            </div>

          )}

        </>

      )}

      {/* =================================================
          STANDINGS
      ================================================= */}

      {activeTab ===
        'standings' &&
        selectedLeague && (

          <SportsStandings
            rows={
              displayedStandings
            }
            league={
              selectedLeague
            }
          />

        )}

      {/* =================================================
          TOP SCORERS
      ================================================= */}

      {activeTab ===
        'scorers' &&
        selectedLeague && (

          <SportsTopScorers
            players={
              displayedScorers
            }
            league={
              selectedLeague
            }
          />

        )}

      {/* =================================================
          CACHE / UPDATE INFO
      ================================================= */}

      <div className="sports-cache-info">

        <span
          className={
            refreshing
              ? 'updating'
              : ''
          }
        >
          ●
        </span>

        {refreshing
          ? ' Updating sports data...'
          : ` Updated ${lastUpdatedLabel} · Auto-refresh every 5 minutes.`}

      </div>

    </section>
  );
}

/* =========================================================
   MAIN CATEGORY PAGE
========================================================= */

export default function CategoryPage() {

  const {
    category
  } = useParams();

  /* =======================================================
     DECODE CATEGORY
  ======================================================= */

  const decodedCategory =
    useMemo(() => {

      try {

        return decodeURIComponent(
          category || ''
        ).trim();

      } catch {

        return String(
          category || ''
        ).trim();

      }

    }, [category]);

  /* =======================================================
     CATEGORY KEY
  ======================================================= */

  const categoryKey =
    decodedCategory
      .toLowerCase()
      .replace(
        /[-_]+/g,
        ' '
      )
      .replace(
        /\s+/g,
        ' '
      )
      .trim();

  const isSport =
    categoryKey === 'sport' ||
    categoryKey === 'sports';

  const normalizedCategory =
    isSport
      ? 'Sport'
      : decodedCategory;

  /* =======================================================
     STATE
  ======================================================= */

  const [stories, setStories] =
    useState([]);

  const [popular, setPopular] =
    useState([]);

  const [ads, setAds] =
    useState([]);

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  /* =======================================================
     COLOR
  ======================================================= */

  const accent =
    CAT_COLORS[
      normalizedCategory
    ] ||
    CAT_COLORS[
      decodedCategory
    ] ||
    '#c0392b';

  /* =======================================================
     RESET PAGE
  ======================================================= */

  useEffect(() => {

    setPage(1);

  }, [
    normalizedCategory
  ]);

  /* =======================================================
     LOAD CATEGORY DATA
  ======================================================= */

  useEffect(() => {

    let cancelled =
      false;

    const load =
      async () => {

        setLoading(true);
        setError('');

        try {

          const [
            storiesResult,
            popularResult,
            adsResult
          ] =
            await Promise.allSettled([

              storiesAPI.getAll({
                category:
                  normalizedCategory,
                page,
                limit: 12,
                status:
                  'published'
              }),

              storiesAPI.getPopular({
                category:
                  normalizedCategory,
                limit: 5
              }),

              adsAPI.getAll()

            ]);

          if (cancelled) {
            return;
          }

          /* ===============================================
             STORIES
          =============================================== */

          if (
            storiesResult.status ===
            'fulfilled'
          ) {

            const storiesData =
              storiesResult
                .value
                ?.data;

            const storiesList =
              Array.isArray(
                storiesData?.stories
              )
                ? storiesData.stories
                : Array.isArray(
                    storiesData?.data
                  )
                  ? storiesData.data
                  : Array.isArray(
                      storiesData
                    )
                    ? storiesData
                    : [];

            setStories(
              storiesList
            );

            setTotalPages(
              Number(
                storiesData?.pages ??
                storiesData?.totalPages
              ) || 1
            );

            setTotal(
              Number(
                storiesData?.total ??
                storiesData?.count
              ) ||
              storiesList.length ||
              0
            );

          } else {

            console.error(
              'Stories API error:',
              storiesResult.reason
            );

            setStories([]);
            setTotal(0);
            setTotalPages(1);

            setError(
              'Unable to load category stories.'
            );

          }

          /* ===============================================
             POPULAR
          =============================================== */

          if (
            popularResult.status ===
            'fulfilled'
          ) {

            const popularData =
              popularResult
                .value
                ?.data;

            const popularList =
              Array.isArray(
                popularData
              )
                ? popularData
                : Array.isArray(
                    popularData?.stories
                  )
                  ? popularData.stories
                  : Array.isArray(
                      popularData?.data
                    )
                    ? popularData.data
                    : [];

            setPopular(
              popularList
            );

          } else {

            console.warn(
              'Popular stories unavailable:',
              popularResult.reason
            );

            setPopular([]);

          }

          /* ===============================================
             ADS
          =============================================== */

          if (
            adsResult.status ===
            'fulfilled'
          ) {

            const adsData =
              adsResult
                .value
                ?.data;

            const adsList =
              Array.isArray(
                adsData
              )
                ? adsData
                : Array.isArray(
                    adsData?.ads
                  )
                  ? adsData.ads
                  : Array.isArray(
                      adsData?.data
                    )
                    ? adsData.data
                    : [];

            setAds(
              adsList
            );

          } else {

            console.warn(
              'Ads unavailable:',
              adsResult.reason
            );

            setAds([]);

          }

        } catch (err) {

          console.error(
            'Category loading error:',
            err
          );

          if (!cancelled) {

            setStories([]);
            setPopular([]);
            setAds([]);
            setTotal(0);
            setTotalPages(1);

            setError(
              'Unable to load this category right now.'
            );

          }

        } finally {

          if (!cancelled) {
            setLoading(false);
          }

        }

      };

    load();

    return () => {
      cancelled = true;
    };

  }, [
    normalizedCategory,
    page
  ]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <PublicLayout>

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

          padding: 22px 0 0;
          position: relative;
          overflow: hidden;

          box-shadow:
            0 8px 30px
            rgba(0,0,0,.12);
        }

        .cat-header-wrap::after {
          content: '';

          position: absolute;

          width: 420px;
          height: 420px;

          right: -180px;
          top: -260px;

          border-radius: 50%;

          border:
            1px solid
            rgba(255,255,255,.12);

          pointer-events: none;
        }

        .cat-watermark {
          position: absolute;

          right: -20px;
          top: -20px;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size: 140px;
          font-weight: 900;

          color:
            rgba(255,255,255,.04);

          letter-spacing: -6px;
          line-height: 1;

          pointer-events: none;
          text-transform: uppercase;
          user-select: none;
        }

        .cat-content-wrap {
          max-width: 1260px;

          margin: 0 auto;

          padding:
            32px 20px 60px;
        }

        .cat-main-grid {
          display: grid;

          grid-template-columns:
            minmax(0,1fr)
            340px;

          gap: 32px;

          align-items: start;
        }

        .cat-featured-story {
          display: block;

          position: relative;
          overflow: hidden;

          background: #000;

          height: 390px;

          margin-bottom: 28px;

          text-decoration: none;

          border-radius: 4px;

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
          display: grid;

          grid-template-columns:
            repeat(
              auto-fill,
              minmax(
                230px,
                1fr
              )
            );

          gap: 20px;

          margin-bottom: 28px;
        }

        .cat-sidebar-sticky {
          position: sticky;
          top: 72px;
        }

        /* =================================================
           SPORTS
        ================================================= */

        .sports-section {
          margin: 34px 0 38px;

          padding: 26px;

          background:
            #f7f8fa;

          border:
            1px solid #e6e9ed;

          border-top:
            4px solid #0d3b6e;

          position: relative;

          overflow: hidden;
        }

        .sports-section::before {
          content: 'SPORT';

          position: absolute;

          right: -15px;
          top: -35px;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size: 110px;
          font-weight: 900;

          color:
            rgba(
              13,
              59,
              110,
              .035
            );

          pointer-events: none;
        }

        .sports-heading {
          display: flex;

          align-items:
            flex-start;

          justify-content:
            space-between;

          gap: 20px;

          margin-bottom: 22px;

          position: relative;
          z-index: 1;
        }

        .sports-heading-actions {
          display: flex;

          align-items: center;

          gap: 8px;

          flex-wrap: wrap;

          justify-content:
            flex-end;
        }

        .sports-kicker {
          display: block;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size: 11px;
          font-weight: 800;

          letter-spacing: 2px;

          color:
            #0d3b6e;

          margin-bottom: 5px;
        }

        .sports-heading h2 {
          margin: 0;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size:
            clamp(
              1.8rem,
              4vw,
              2.5rem
            );

          font-weight: 900;

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

          font-size: 13px;

          max-width:
            600px;

          line-height:
            1.5;
        }

        .sports-live-badge {
          display: flex;

          align-items:
            center;

          gap: 7px;

          background:
            #101820;

          color:
            #fff;

          padding:
            7px 11px;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 1px;

          white-space:
            nowrap;
        }

        .sports-live-badge span {
          width: 7px;
          height: 7px;

          background:
            #e53935;

          border-radius:
            50%;

          animation:
            sportsPulse
            1.5s infinite;
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

        .sports-refresh-button {
          display: flex;

          align-items:
            center;

          gap: 6px;

          border:
            1px solid #d5dbe1;

          background:
            #fff;

          color:
            #3e4852;

          padding:
            7px 10px;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size:
            10px;

          font-weight:
            800;

          letter-spacing:
            .5px;

          cursor:
            pointer;

          transition:
            all .2s ease;
        }

        .sports-refresh-button:hover {
          border-color:
            #0d3b6e;

          color:
            #0d3b6e;
        }

        .sports-refresh-button:disabled {
          opacity:
            .6;

          cursor:
            not-allowed;
        }

        .sports-refresh-icon {
          font-size:
            16px;

          line-height:
            1;

          display:
            inline-block;
        }

        .sports-refresh-icon.spinning {
          animation:
            sportsRotate
            .8s linear infinite;
        }

        @keyframes sportsRotate {

          from {
            transform:
              rotate(0deg);
          }

          to {
            transform:
              rotate(360deg);
          }

        }

        .sports-leagues {
          display: flex;

          gap: 7px;

          overflow-x:
            auto;

          padding-bottom:
            12px;

          margin-bottom:
            17px;

          scrollbar-width:
            thin;

          position: relative;
          z-index: 2;
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

        .sports-tabs {
          display: flex;

          gap: 8px;

          margin-bottom:
            18px;

          position: relative;
          z-index: 2;

          border-bottom:
            1px solid #e1e5e9;
        }

        .sports-tabs button {
          border:
            0;

          background:
            transparent;

          color:
            #69727d;

          padding:
            10px 14px;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size:
            11px;

          font-weight:
            800;

          cursor:
            pointer;

          transition:
            all .2s ease;
        }

        .sports-tabs button:hover {
          color:
            #0d3b6e;
        }

        .sports-tabs button.active {
          color:
            #0d3b6e;

          border-bottom:
            3px solid #0d3b6e;
        }

        .sports-tabs button:disabled {
          opacity:
            .35;

          cursor:
            not-allowed;
        }

        .sports-summary-grid {
          display: grid;

          grid-template-columns:
            repeat(
              4,
              1fr
            );

          gap:
            10px;

          margin-bottom:
            18px;
        }

        .sports-summary-grid > div {
          background:
            #fff;

          border:
            1px solid #e2e6ea;

          padding:
            14px;

          display: flex;

          flex-direction:
            column;

          align-items:
            center;

          justify-content:
            center;

          gap:
            3px;
        }

        .sports-summary-grid strong {
          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size:
            25px;

          font-weight:
            900;

          color:
            #101820;
        }

        .sports-summary-grid span {
          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size:
            9px;

          font-weight:
            800;

          letter-spacing:
            1px;

          color:
            #7c858e;
        }

        .sports-grid {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(
                0,
                1fr
              )
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

          position:
            relative;
        }

        .sports-match-card:hover {
          transform:
            translateY(-3px);

          box-shadow:
            0 10px 25px
            rgba(
              0,
              0,
              0,
              .08
            );
        }

        .sports-match-live {
          border-color:
            rgba(
              211,
              47,
              47,
              .35
            );
        }

        .sports-match-live::before {
          content: '';

          position:
            absolute;

          top: 0;
          left: 0;

          width: 100%;
          height: 3px;

          background:
            #d32f2f;
        }

        .sports-match-top {
          display: flex;

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
            sportsTextPulse
            1.5s infinite;
        }

        @keyframes sportsTextPulse {

          50% {
            opacity:
              .45;
          }

        }

        .sports-teams {
          display: grid;

          grid-template-columns:
            1fr 55px 1fr;

          align-items:
            center;

          gap:
            8px;
        }

        .sports-team {
          display: flex;

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

        .sports-team img,
        .sports-team-placeholder {
          width:
            30px;

          height:
            30px;

          object-fit:
            contain;
        }

        .sports-team-placeholder {
          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          font-size:
            22px;
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

          overflow:
            hidden;

          text-overflow:
            ellipsis;

          display:
            -webkit-box;

          -webkit-line-clamp:
            2;

          -webkit-box-orient:
            vertical;
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
          display:
            block;

          font-size:
            11px;

          font-weight:
            800;

          color:
            #0d3b6e;

          text-align:
            center;
        }

        .sports-score small {
          display:
            block;

          margin-top:
            2px;

          font-size:
            8px;

          color:
            #9299a1;

          text-align:
            center;
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

        .sports-panel {
          background:
            #fff;

          border:
            1px solid #e2e6ea;

          position:
            relative;

          z-index:
            2;
        }

        .sports-panel-title {
          padding:
            18px;

          border-bottom:
            1px solid #edf0f2;
        }

        .sports-panel-title span {
          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size:
            9px;

          font-weight:
            800;

          color:
            #0d3b6e;

          letter-spacing:
            1.5px;
        }

        .sports-panel-title h3 {
          margin:
            4px 0 0;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size:
            21px;

          font-weight:
            900;

          color:
            #101820;
        }

        .sports-table-wrap {
          width:
            100%;

          overflow-x:
            auto;
        }

        .sports-table {
          width:
            100%;

          border-collapse:
            collapse;

          min-width:
            650px;
        }

        .sports-table th {
          background:
            #f5f7f8;

          color:
            #727b84;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size:
            10px;

          font-weight:
            800;

          letter-spacing:
            .7px;

          padding:
            11px 10px;

          text-align:
            center;
        }

        .sports-table td {
          padding:
            11px 10px;

          border-top:
            1px solid #edf0f2;

          color:
            #333b42;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size:
            12px;

          text-align:
            center;
        }

        .sports-table td:nth-child(2) {
          text-align:
            left;
        }

        .sports-table-team {
          display:
            flex;

          align-items:
            center;

          gap:
            9px;
        }

        .sports-table-team img {
          width:
            25px;

          height:
            25px;

          object-fit:
            contain;
        }

        .sports-table-team span {
          font-size:
            20px;
        }

        .sports-scorers-grid {
          display:
            grid;

          grid-template-columns:
            repeat(
              2,
              minmax(
                0,
                1fr
              )
            );

          gap:
            10px;

          padding:
            16px;
        }

        .sports-scorer-card {
          display:
            grid;

          grid-template-columns:
            28px
            48px
            minmax(
              0,
              1fr
            )
            60px;

          align-items:
            center;

          gap:
            10px;

          background:
            #f8f9fa;

          border:
            1px solid #e9ecef;

          padding:
            10px;
        }

        .sports-scorer-rank {
          width:
            28px;

          height:
            28px;

          border-radius:
            50%;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          background:
            #0d3b6e;

          color:
            #fff;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size:
            11px;

          font-weight:
            900;
        }

        .sports-scorer-card img,
        .sports-scorer-placeholder {
          width:
            48px;

          height:
            48px;

          border-radius:
            50%;

          object-fit:
            cover;
        }

        .sports-scorer-placeholder {
          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          background:
            #e9edf1;

          font-size:
            23px;
        }

        .sports-scorer-info {
          min-width:
            0;

          display:
            flex;

          flex-direction:
            column;

          gap:
            3px;
        }

        .sports-scorer-info strong {
          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size:
            14px;

          color:
            #182027;

          overflow:
            hidden;

          text-overflow:
            ellipsis;

          white-space:
            nowrap;
        }

        .sports-scorer-info span {
          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size:
            10px;

          color:
            #858e97;

          overflow:
            hidden;

          text-overflow:
            ellipsis;

          white-space:
            nowrap;
        }

        .sports-scorer-stats {
          text-align:
            right;

          display:
            flex;

          flex-direction:
            column;
        }

        .sports-scorer-stats strong {
          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size:
            22px;

          font-weight:
            900;

          color:
            #0d3b6e;
        }

        .sports-scorer-stats span {
          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size:
            8px;

          font-weight:
            800;

          color:
            #737d86;
        }

        .sports-scorer-stats small {
          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size:
            8px;

          color:
            #999;
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

          padding:
            25px;
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

          display:
            flex;

          align-items:
            center;
        }

        .sports-cache-info span {
          color:
            #2e7d32;

          margin-right:
            5px;
        }

        .sports-cache-info span.updating {
          color:
            #d97706;

          animation:
            sportsTextPulse
            1s infinite;
        }

        .sports-error {
          display:
            flex;

          flex-direction:
            column;

          gap:
            4px;

          margin-bottom:
            15px;

          padding:
            12px 14px;

          background:
            #fff7ed;

          border:
            1px solid #fed7aa;

          color:
            #9a3412;

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size:
            12px;
        }

        .category-error {
          padding:
            25px;

          background:
            #fff5f5;

          border:
            1px solid #f1d1d1;

          color:
            #9b2c2c;

          margin-bottom:
            25px;
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
                minmax(
                  0,
                  1fr
                )
              );
          }

        }

        @media (max-width: 768px) {

          .cat-content-wrap {
            padding:
              24px
              16px
              40px;
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

          .sports-section {
            padding:
              20px 15px;
          }

          .sports-heading {
            flex-direction:
              column;
          }

          .sports-heading-actions {
            width:
              100%;

            justify-content:
              flex-start;
          }

          .sports-live-badge {
            align-self:
              flex-start;
          }

          .sports-grid {
            grid-template-columns:
              1fr;
          }

          .sports-summary-grid {
            grid-template-columns:
              repeat(
                2,
                1fr
              );
          }

          .sports-scorers-grid {
            grid-template-columns:
              1fr;
          }

        }

        @media (max-width: 560px) {

          .cat-featured-story {
            height:
              230px;
          }

          .cat-featured-overlay {
            padding:
              30px
              16px
              16px !important;
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

          .sports-tabs {
            overflow-x:
              auto;
          }

          .sports-tabs button {
            white-space:
              nowrap;
          }

          .sports-summary-grid strong {
            font-size:
              21px;
          }

          .sports-scorer-card {
            grid-template-columns:
              25px
              42px
              minmax(
                0,
                1fr
              )
              50px;

            gap:
              7px;
          }

          .sports-scorer-card img,
          .sports-scorer-placeholder {
            width:
              42px;

            height:
              42px;
          }

          .sports-refresh-button {
            padding:
              7px 9px;
          }

        }

      `}</style>

      {/* ===================================================
          CATEGORY HEADER
      =================================================== */}

      <div className="cat-header-wrap">

        <div className="cat-watermark">

          {normalizedCategory.substring(
            0,
            8
          )}

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
              textTransform:
                'uppercase',
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

            <span>
              ›
            </span>

            <span
              style={{
                color:
                  'rgba(255,255,255,.8)'
              }}
            >
              {normalizedCategory}
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
              textTransform:
                'uppercase',
              color:
                '#fff',
              marginBottom:
                16
            }}
          >

            {normalizedCategory}

            <span
              style={{
                fontSize:
                  '1rem',
                fontWeight:
                  400,
                opacity:
                  .5,
                marginLeft:
                  10
              }}
            >
              ({total} stories)
            </span>

          </h1>

          <div
            style={{
              display:
                'flex',
              gap:
                0,
              flexWrap:
                'wrap',
              borderTop:
                '1px solid rgba(255,255,255,.1)',
              marginTop:
                8
            }}
          >

            <span
              style={{
                fontFamily:
                  "'Barlow Condensed',sans-serif",
                fontSize:
                  11,
                fontWeight:
                  700,
                letterSpacing:
                  1.5,
                textTransform:
                  'uppercase',
                color:
                  '#fff',
                padding:
                  '12px 18px',
                borderRight:
                  '1px solid rgba(255,255,255,.06)',
                background:
                  'rgba(255,255,255,.1)'
              }}
            >
              {normalizedCategory}
            </span>

            <Link
              to="/"
              style={{
                fontFamily:
                  "'Barlow Condensed',sans-serif",
                fontSize:
                  11,
                fontWeight:
                  700,
                letterSpacing:
                  1.5,
                textTransform:
                  'uppercase',
                color:
                  'rgba(255,255,255,.55)',
                padding:
                  '12px 18px',
                textDecoration:
                  'none'
              }}
            >
              All Stories
            </Link>

          </div>

        </div>

      </div>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div className="cat-content-wrap">

        <AdBanner
          ads={ads}
          height={110}
        />

        {/* =================================================
            SPORT
        ================================================= */}

        {isSport && (
          <SportsUpdates />
        )}

        {error && (

          <div className="category-error">
            {error}
          </div>

        )}

        <div className="cat-main-grid">

          {/* =================================================
              STORIES
          ================================================= */}

          <div>

            {loading ? (

              <Spinner />

            ) : stories.length ===
              0 ? (

              <EmptyState
                icon="📰"
                title={
                  `No ${normalizedCategory} stories yet`
                }
                message={
                  'Check back soon for the latest updates.'
                }
              />

            ) : (

              <>

                <Link
                  to={`/story/${
                    stories[0]?._id ||
                    stories[0]?.id
                  }`}
                  className="cat-featured-story"
                >

                  <img
                    src={imgUrl(
                      stories[0]?.image
                    )}
                    alt={
                      stories[0]?.title ||
                      'Featured story'
                    }
                    loading="eager"
                    onError={
                      handleImageError
                    }
                    style={{
                      width:
                        '100%',
                      height:
                        '100%',
                      objectFit:
                        'cover',
                      opacity:
                        .75
                    }}
                  />

                  <div
                    className="cat-featured-overlay"
                    style={{
                      position:
                        'absolute',
                      bottom:
                        0,
                      left:
                        0,
                      right:
                        0,
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
                        fontWeight:
                          800,
                        fontSize:
                          10,
                        letterSpacing:
                          2,
                        color:
                          '#fff',
                        marginBottom:
                          10
                      }}
                    >
                      {stories[0]
                        ?.category ||
                        normalizedCategory}
                    </div>

                    <h2
                      className="cat-featured-title"
                      style={{
                        fontFamily:
                          "'Playfair Display',serif",
                        fontSize:
                          'clamp(1.3rem,2.5vw,2rem)',
                        fontWeight:
                          900,
                        color:
                          '#fff',
                        lineHeight:
                          1.15,
                        margin:
                          0
                      }}
                    >
                      {
                        stories[0]
                          ?.title
                      }
                    </h2>

                  </div>

                </Link>

                <div className="cat-card-grid">

                  {stories
                    .slice(1)
                    .map(
                      story => (

                        <GridCard
                          key={
                            story?._id ||
                            story?.id
                          }
                          story={
                            story
                          }
                        />

                      )
                    )}

                </div>

                <Pagination
                  page={
                    page
                  }
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

            <div className="cat-sidebar-sticky">

              <div
                style={{
                  background:
                    '#fff',
                  border:
                    '1px solid #e8e4d8',
                  padding:
                    20,
                  marginBottom:
                    22,
                  borderTop:
                    `3px solid ${accent}`
                }}
              >

                <SectionLabel>
                  🔥 Most Read
                </SectionLabel>

                {popular.map(
                  (
                    p,
                    i
                  ) => (

                    <PopularItem
                      key={
                        p?._id ||
                        p?.id ||
                        i
                      }
                      story={
                        p
                      }
                      rank={
                        i + 1
                      }
                    />

                  )
                )}

                {popular.length ===
                  0 && (

                  <p
                    style={{
                      color:
                        '#bbb',
                      fontStyle:
                        'italic',
                      fontSize:
                        13
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

