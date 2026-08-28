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

import api, {
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
    short: 'BK Pro League',
    id: 567
  }
];

/* =========================================================
   SPORTS CACHE
========================================================= */

const SPORTS_STORAGE_KEY =
  'mfn_sports_dashboard_v3';

const SPORTS_STORAGE_TIME_KEY =
  'mfn_sports_dashboard_timestamp_v3';

const SPORTS_CACHE_DURATION =
  30 * 60 * 1000;

/* =========================================================
   DATE HELPERS
========================================================= */

const getDateString = (date = new Date()) => {
  const d = new Date(date);

  return d
    .toISOString()
    .split('T')[0];
};

const getDateOffset = days => {
  const d = new Date();

  d.setDate(
    d.getDate() + days
  );

  return getDateString(d);
};

const formatMatchTime = date => {
  if (!date) return '';

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

const formatShortDate = date => {
  if (!date) return '';

  try {
    return new Date(date).toLocaleDateString(
      [],
      {
        day: '2-digit',
        month: 'short'
      }
    );
  } catch {
    return '';
  }
};

const getMatchStatus = fixture => {
  const status =
    fixture?.fixture?.status;

  if (!status) return '';

  if (
    ['FT', 'AET', 'PEN'].includes(
      status.short
    )
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
      'HT'
    ].includes(status.short)
  ) {
    return 'LIVE';
  }

  if (
    ['NS', 'TBD'].includes(
      status.short
    )
  ) {
    return 'UPCOMING';
  }

  return (
    status.long ||
    status.short ||
    ''
  );
};

const getSeason = () => {
  const now = new Date();

  /*
    Football seasons generally cross calendar years.
    August-December => current year
    January-July => previous year
  */

  const month =
    now.getMonth() + 1;

  return month >= 8
    ? now.getFullYear()
    : now.getFullYear() - 1;
};

/* =========================================================
   API HELPERS
========================================================= */

const fetchSportsFixtures =
  async leagueId => {
    const response =
      await api.get(
        '/sports/fixtures',
        {
          params: {
            league: leagueId,
            season: getSeason(),
            from: getDateOffset(-2),
            to: getDateOffset(10)
          }
        }
      );

    return (
      response?.data?.response ||
      []
    );
  };

const fetchSportsStandings =
  async leagueId => {
    const response =
      await api.get(
        '/sports/standings',
        {
          params: {
            league: leagueId,
            season: getSeason()
          }
        }
      );

    const raw =
      response?.data?.response;

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

    if (
      Array.isArray(
        response?.data?.standings
      )
    ) {
      return response.data.standings;
    }

    return [];
  };

const fetchSportsTopScorers =
  async leagueId => {
    const response =
      await api.get(
        '/sports/topscorers',
        {
          params: {
            league: leagueId,
            season: getSeason()
          }
        }
      );

    const raw =
      response?.data?.response;

    if (Array.isArray(raw)) {
      return raw;
    }

    if (
      Array.isArray(
        response?.data?.topScorers
      )
    ) {
      return response.data.topScorers;
    }

    if (
      Array.isArray(
        response?.data?.scorers
      )
    ) {
      return response.data.scorers;
    }

    return [];
  };

/* =========================================================
   MATCH CARD
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
    <div className="sports-match-card">

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
          {status}
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
              onError={e => {
                e.currentTarget.style.display =
                  'none';
              }}
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
                {goals?.home ?? 0}
              </strong>

              <span>:</span>

              <strong>
                {goals?.away ?? 0}
              </strong>
            </>
          ) : (
            <div>

              <span className="sports-vs">
                {formatMatchTime(
                  fixture?.fixture?.date
                )}
              </span>

              <small>
                {formatShortDate(
                  fixture?.fixture?.date
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
              onError={e => {
                e.currentTarget.style.display =
                  'none';
              }}
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
          {fixture?.fixture?.venue?.name ||
            'Football'}
        </span>

        <span>
          {fixture?.fixture?.date
            ? formatShortDate(
                fixture.fixture.date
              )
            : ''}
        </span>

      </div>

    </div>
  );
}

/* =========================================================
   STANDINGS
========================================================= */

function SportsStandings({
  rows,
  league
}) {
  if (!rows?.length) {
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
                (row, index) => {
                  const team =
                    row?.team || {};

                  const rank =
                    row?.rank ??
                    row?.position ??
                    index + 1;

                  const played =
                    row?.all?.played ??
                    row?.played ??
                    0;

                  const wins =
                    row?.all?.win ??
                    row?.wins ??
                    0;

                  const draws =
                    row?.all?.draw ??
                    row?.draws ??
                    0;

                  const losses =
                    row?.all?.lose ??
                    row?.losses ??
                    0;

                  /*
                    FIX:
                    Do not mix nullable values
                    with arithmetic directly.
                  */

                  const goalsFor =
                    row?.goals?.for ??
                    0;

                  const goalsAgainst =
                    row?.goals?.against ??
                    0;

                  const goalDifference =
                    row?.goalsDiff ??
                    row?.goalDifference ??
                    (
                      goalsFor -
                      goalsAgainst
                    );

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
                              src={team.logo}
                              alt={
                                team.name ||
                                'Team'
                              }
                              loading="lazy"
                              onError={e => {
                                e.currentTarget.style.display =
                                  'none';
                              }}
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
  if (!players?.length) {
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
            (item, index) => {
              const player =
                item?.player || {};

              const stats =
                item?.statistics?.[0] ||
                {};

              const team =
                stats?.team ||
                item?.team ||
                {};

              const goals =
                stats?.goals?.total ??
                item?.goals ??
                0;

              const assists =
                stats?.goals?.assists ??
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
                      src={player.photo}
                      alt={
                        player?.name ||
                        'Player'
                      }
                      loading="lazy"
                      onError={e => {
                        e.currentTarget.style.display =
                          'none';
                      }}
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
                      {assists} assists
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

  const [sportsError, setSportsError] =
    useState('');

  const [activeLeague, setActiveLeague] =
    useState('ALL');

  const [activeTab, setActiveTab] =
    useState('matches');

  /* =======================================================
     LOAD SPORTS
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadSports = async () => {
      setSportsLoading(true);
      setSportsError('');

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

        /* ---------------------------------------------------
           CACHE
        --------------------------------------------------- */

        if (
          stored &&
          storedTime &&
          now -
            Number(storedTime) <
            SPORTS_CACHE_DURATION
        ) {
          try {
            const parsed =
              JSON.parse(stored);

            if (
              parsed &&
              !cancelled
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

              setSportsLoading(
                false
              );

              return;
            }
          } catch (cacheError) {
            console.warn(
              'Invalid sports cache:',
              cacheError
            );

            localStorage.removeItem(
              SPORTS_STORAGE_KEY
            );

            localStorage.removeItem(
              SPORTS_STORAGE_TIME_KEY
            );
          }
        }

        /* ---------------------------------------------------
           FETCH ALL LEAGUES
        --------------------------------------------------- */

        const allFixtures = [];
        const nextStandings = {};
        const nextTopScorers = {};

        await Promise.all(
          SPORTS_LEAGUES.map(
            async league => {
              try {
                const [
                  fixtures,
                  table,
                  scorers
                ] =
                  await Promise.all([
                    fetchSportsFixtures(
                      league.id
                    ),

                    fetchSportsStandings(
                      league.id
                    ),

                    fetchSportsTopScorers(
                      league.id
                    )
                  ]);

                /* FIXTURES */

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

                        mfnLeagueName:
                          league.name,

                        mfnLeagueShort:
                          league.short
                      });
                    }
                  );
                }

                /* STANDINGS */

                nextStandings[
                  league.key
                ] =
                  Array.isArray(table)
                    ? table
                    : [];

                /* SCORERS */

                nextTopScorers[
                  league.key
                ] =
                  Array.isArray(
                    scorers
                  )
                    ? scorers
                    : [];
              } catch (error) {
                console.error(
                  `Sports data failed for ${league.name}:`,
                  error
                );

                nextStandings[
                  league.key
                ] = [];

                nextTopScorers[
                  league.key
                ] = [];
              }
            }
          )
        );

        /* ---------------------------------------------------
           REMOVE DUPLICATES
        --------------------------------------------------- */

        const uniqueFixtures =
          Array.from(
            new Map(
              allFixtures.map(
                fixture => [
                  fixture?.fixture?.id ||
                    `${fixture?.mfnLeagueKey}-${fixture?.fixture?.date}-${fixture?.teams?.home?.id}-${fixture?.teams?.away?.id}`,
                  fixture
                ]
              )
            ).values()
          );

        /* ---------------------------------------------------
           SORT
        --------------------------------------------------- */

        uniqueFixtures.sort(
          (a, b) =>
            new Date(
              a?.fixture?.date || 0
            ) -
            new Date(
              b?.fixture?.date || 0
            )
        );

        /* ---------------------------------------------------
           SAVE CACHE
        --------------------------------------------------- */

        const payload = {
          sports:
            uniqueFixtures,

          standings:
            nextStandings,

          topScorers:
            nextTopScorers
        };

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
              Date.now()
            )
          );
        } catch (storageError) {
          console.warn(
            'Unable to save sports cache:',
            storageError
          );
        }

        if (!cancelled) {
          setSports(
            uniqueFixtures
          );

          setStandings(
            nextStandings
          );

          setTopScorers(
            nextTopScorers
          );
        }
      } catch (error) {
        console.error(
          'Sports dashboard error:',
          error
        );

        if (!cancelled) {
          setSportsError(
            'Unable to load sports data from the server.'
          );
        }
      } finally {
        if (!cancelled) {
          setSportsLoading(
            false
          );
        }
      }
    };

    loadSports();

    return () => {
      cancelled = true;
    };
  }, []);

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
     FILTER FIXTURES
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
     STANDINGS
  ======================================================= */

  const displayedStandings =
    activeLeague === 'ALL'
      ? []
      : standings[
          activeLeague
        ] || [];

  /* =======================================================
     TOP SCORERS
  ======================================================= */

  const displayedScorers =
    activeLeague === 'ALL'
      ? []
      : topScorers[
          activeLeague
        ] || [];

  /* =======================================================
     MATCH STATUS
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
     RENDER
  ======================================================= */

  return (
    <section className="sports-section">

      {/* HEADER */}

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
            scorers from the
            biggest leagues and
            Rwanda's football
            league.
          </p>

        </div>

        <div className="sports-live-badge">
          <span />
          LIVE DATA
        </div>

      </div>

      {/* ERROR */}

      {sportsError && (
        <div className="sports-empty">

          <div className="sports-empty-icon">
            ⚠️
          </div>

          <strong>
            {sportsError}
          </strong>

          <span>
            Check that the sports
            routes are enabled on
            the backend.
          </span>

        </div>
      )}

      {/* LEAGUES */}

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
              key={league.key}
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

      {/* TABS */}

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
            activeLeague === 'ALL'
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
            activeLeague === 'ALL'
          }
        >
          🏆 Top Scorers
        </button>

      </div>

      {/* MATCHES */}

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
                There are no fixtures
                in the selected
                period.
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
                        fixture?.fixture?.id ||
                        `${fixture?.mfnLeagueKey}-${index}`
                      }
                      fixture={
                        fixture
                      }
                      league={{
                        short:
                          fixture?.mfnLeagueShort
                      }}
                    />
                  )
                )}

            </div>
          )}

        </>
      )}

      {/* STANDINGS */}

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

      {/* TOP SCORERS */}

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

      {/* CACHE */}

      <div className="sports-cache-info">

        <span>
          ●
        </span>

        Sports data refreshes
        automatically every 30
        minutes.

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

  /* =======================================================
     NORMALIZE CATEGORY
  ======================================================= */

  const decodedCategory =
    (() => {
      try {
        return decodeURIComponent(
          category || ''
        );
      } catch {
        return category || '';
      }
    })();

  /* =======================================================
     STATE
  ======================================================= */

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

  const [
    error,
    setError
  ] = useState('');

  /* =======================================================
     COLOR
  ======================================================= */

  const accent =
    CAT_COLORS[
      decodedCategory
    ] || '#c0392b';

  /* =======================================================
     SPORT CHECK
  ======================================================= */

  const isSport =
    decodedCategory
      .toLowerCase()
      .trim() === 'sport';

  /* =======================================================
     RESET PAGE
  ======================================================= */

  useEffect(() => {
    setPage(1);
  }, [
    decodedCategory
  ]);

  /* =======================================================
     LOAD CATEGORY
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const [
          sRes,
          pRes,
          aRes
        ] =
          await Promise.all([
            storiesAPI.getAll({
              category:
                decodedCategory,

              page,

              limit: 12,

              status:
                'published'
            }),

            storiesAPI.getPopular({
              category:
                decodedCategory,

              limit: 5
            }),

            adsAPI.getAll()
          ]);

        if (cancelled) {
          return;
        }

        /* =================================================
           STORIES
        ================================================= */

        const storiesData =
          sRes?.data;

        const storiesList =
          Array.isArray(
            storiesData?.stories
          )
            ? storiesData.stories
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
            storiesData?.pages
          ) || 1
        );

        setTotal(
          Number(
            storiesData?.total
          ) ||
            storiesList.length ||
            0
        );

        /* =================================================
           POPULAR
        ================================================= */

        const popularData =
          pRes?.data;

        setPopular(
          Array.isArray(
            popularData
          )
            ? popularData
            : Array.isArray(
                popularData?.stories
              )
              ? popularData.stories
              : []
        );

        /* =================================================
           ADS
        ================================================= */

        const adsData =
          aRes?.data;

        setAds(
          Array.isArray(
            adsData
          )
            ? adsData
            : Array.isArray(
                adsData?.ads
              )
              ? adsData.ads
              : []
        );
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
    decodedCategory,
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

        /* =================================================
           CATEGORY HEADER
        ================================================= */

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

          pointer-events:
            none;
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

        /* =================================================
           MAIN GRID
        ================================================= */

        .cat-main-grid {
          display:
            grid;

          grid-template-columns:
            minmax(0,1fr)
            340px;

          gap:
            32px;

          align-items:
            start;
        }

        /* =================================================
           FEATURED STORY
        ================================================= */

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

        /* =================================================
           STORY GRID
        ================================================= */

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

        /* =================================================
           SIDEBAR
        ================================================= */

        .cat-sidebar-sticky {
          position:
            sticky;

          top:
            72px;
        }

        /* =================================================
           SPORTS
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

        /* =================================================
           LEAGUE NAV
        ================================================= */

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

          position:
            relative;

          z-index:
            2;
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

        /* =================================================
           SPORTS TABS
        ================================================= */

        .sports-tabs {
          display:
            flex;

          gap:
            8px;

          margin-bottom:
            18px;

          position:
            relative;

          z-index:
            2;

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

        /* =================================================
           SUMMARY
        ================================================= */

        .sports-summary-grid {
          display:
            grid;

          grid-template-columns:
            repeat(4,1fr);

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

          display:
            flex;

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

        /* =================================================
           SPORTS GRID
        ================================================= */

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

        /* =================================================
           MATCH CARD
        ================================================= */

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
            sportsTextPulse
            1.5s infinite;
        }

        @keyframes sportsTextPulse {

          50% {
            opacity:
              .45;
          }

        }

        /* =================================================
           TEAMS
        ================================================= */

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

        /* =================================================
           SCORE
        ================================================= */

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

        /* =================================================
           MATCH FOOTER
        ================================================= */

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

        /* =================================================
           SPORTS PANEL
        ================================================= */

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

        /* =================================================
           STANDINGS TABLE
        ================================================= */

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

        /* =================================================
           TOP SCORERS
        ================================================= */

        .sports-scorers-grid {
          display:
            grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0,1fr)
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
            28px 48px minmax(0,1fr) 60px;

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

        /* =================================================
           EMPTY
        ================================================= */

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

        /* =================================================
           CACHE
        ================================================= */

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

        /* =================================================
           ERROR
        ================================================= */

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

          .sports-section {
            padding:
              20px 15px;
          }

          .sports-heading {
            flex-direction:
              column;
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
              repeat(2,1fr);
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
              25px 42px minmax(0,1fr) 50px;

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

        }

      `}</style>

      {/* ===================================================
          CATEGORY HEADER
      =================================================== */}

      <div className="cat-header-wrap">

        <div className="cat-watermark">
          {decodedCategory.substring(
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

          {/* BREADCRUMB */}

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
              alignItems:
                'center',
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
              {decodedCategory}
            </span>

          </div>

          {/* TITLE */}

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
              color: '#fff',
              marginBottom: 16
            }}
          >

            {decodedCategory}

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

          {/* CATEGORY NAV */}

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
                textTransform:
                  'uppercase',
                color: '#fff',
                padding:
                  '12px 18px',
                borderRight:
                  '1px solid rgba(255,255,255,.06)',
                background:
                  'rgba(255,255,255,.1)'
              }}
            >
              {decodedCategory}
            </span>

            <Link
              to="/"
              style={{
                fontFamily:
                  "'Barlow Condensed',sans-serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.5,
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

        {/* AD */}

        <AdBanner
          ads={ads}
          height={110}
        />

        {/* =================================================
            SPORTS ONLY
        ================================================= */}

        {isSport && (
          <SportsUpdates />
        )}

        {/* =================================================
            CATEGORY ERROR
        ================================================= */}

        {error && (
          <div className="category-error">
            {error}
          </div>
        )}

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

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
                  `No ${decodedCategory} stories yet`
                }
                message={
                  'Check back soon for the latest updates.'
                }
              />
            ) : (
              <>

                {/* FEATURED */}

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
                    onError={e => {
                      e.currentTarget.onerror =
                        null;

                      e.currentTarget.src =
                        '/placeholder.jpg';
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit:
                        'cover',
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
                        marginBottom:
                          10
                      }}
                    >
                      {stories[0]?.category ||
                        decodedCategory}
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
                        lineHeight:
                          1.15,
                        margin: 0
                      }}
                    >
                      {stories[0]?.title}
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

            <div className="cat-sidebar-sticky">

              {/* MOST READ */}

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
                        p?._id ||
                        p?.id ||
                        i
                      }
                      story={p}
                      rank={i + 1}
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

              {/* NEWSLETTER */}

              <NewsletterWidget />

              {/* WHATSAPP */}

              <WhatsAppCTA />

            </div>

          </aside>

        </div>

      </div>

    </PublicLayout>
  );
}
