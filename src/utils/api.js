
import axios from 'axios';

/* =========================================================
   API CONFIGURATION
========================================================= */

const API_URL = 'https://mahokofridaynewsbackend.onrender.com';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
});

/* =========================================================
   REQUEST INTERCEPTOR
========================================================= */

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mfn_token');

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* =========================================================
   RESPONSE INTERCEPTOR
========================================================= */

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mfn_token');

      if (
        window.location.pathname.startsWith('/admin') &&
        window.location.pathname !== '/admin/login'
      ) {
        window.location.href = '/admin/login';
      }
    }

    return Promise.reject(error);
  }
);

/* =========================================================
   IMAGE URL
   FIX IMAGE URL
   Aliases for resolveImg and imgUrl
========================================================= */

export const resolveImg = (path) => {
  if (!path) {
    return '/placeholder.jpg';
  }

  if (typeof path !== 'string') {
    return '/placeholder.jpg';
  }

  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:')
  ) {
    return path;
  }

  const cleanPath = path.replace(/^\/?uploads\//, '');

  const formattedPath = cleanPath.startsWith('/')
    ? cleanPath
    : `/${cleanPath}`;

  return `${API_URL}/uploads${formattedPath}`;
};

export const imgUrl = resolveImg;

/* =========================================================
   STORIES API
========================================================= */

export const storiesAPI = {
  getAll: (params) =>
    api.get('/stories', {
      params,
    }),

  getOne: (id) =>
    api.get(`/stories/${id}`),

  getPopular: (params) =>
    api.get('/stories/stats/popular', {
      params,
    }),

  create: (data) =>
    api.post('/stories', data),

  update: (id, data) =>
    api.put(`/stories/${id}`, data),

  delete: (id) =>
    api.delete(`/stories/${id}`),

  react: (id, type) =>
    api.post(`/stories/${id}/react`, {
      type,
    }),
};

/* =========================================================
   AUTHORS API
========================================================= */

export const authorsAPI = {
  getAll: () =>
    api.get('/authors'),

  getOne: (id) =>
    api.get(`/authors/${id}`),

  getStories: (id, params) =>
    api.get(`/authors/${id}/stories`, {
      params,
    }),

  create: (data) =>
    api.post('/authors', data),

  update: (id, data) =>
    api.put(`/authors/${id}`, data),

  delete: (id) =>
    api.delete(`/authors/${id}`),
};

/* =========================================================
   COMMENTS API
========================================================= */

export const commentsAPI = {
  getAll: (params) =>
    api.get('/comments', {
      params,
    }),

  getByStory: (id) =>
    api.get(`/comments/story/${id}`),

  create: (data) =>
    api.post('/comments', data),

  approve: (id) =>
    api.put(`/comments/${id}/approve`),

  spam: (id) =>
    api.put(`/comments/${id}/spam`),

  delete: (id) =>
    api.delete(`/comments/${id}`),
};

/* =========================================================
   VIDEOS API
========================================================= */

export const videosAPI = {
  getAll: (params) =>
    api.get('/videos', {
      params,
    }),

  create: (data) =>
    api.post('/videos', data),

  delete: (id) =>
    api.delete(`/videos/${id}`),
};

/* =========================================================
   ADS API
========================================================= */

export const adsAPI = {
  getAll: (params) =>
    api.get('/ads', {
      params,
    }),

  getAllAdmin: () =>
    api.get('/ads/all'),

  create: (data) =>
    api.post('/ads', data),

  toggle: (id) =>
    api.put(`/ads/${id}/toggle`),

  delete: (id) =>
    api.delete(`/ads/${id}`),
};

/* =========================================================
   SUBSCRIBE API
========================================================= */

export const subscribeAPI = {
  subscribe: (data) =>
    api.post('/subscribe', data),

  getAll: () =>
    api.get('/subscribers'),
};

/* =========================================================
   ANALYTICS API
========================================================= */

export const analyticsAPI = {
  getOverview: () =>
    api.get('/analytics/overview'),

  getAuditLogs: () =>
    api.get('/audit-logs'),
};

/* =========================================================
   BREAKING NEWS API
========================================================= */

export const breakingAPI = {
  get: () =>
    api.get('/breaking'),
};

/* =========================================================
   AUTH API
========================================================= */

export const authAPI = {
  login: (data) =>
    api.post('/auth/login', data),

  me: () =>
    api.get('/auth/me'),

  changePassword: (data) =>
    api.put('/auth/change-password', data),

  getUsers: () =>
    api.get('/auth/users'),

  createUser: (data) =>
    api.post('/auth/users', data),
};

/* =========================================================
   SPORTS API
========================================================= */

export const sportsAPI = {
  /* -------------------------------------------------------
     GET FIXTURES
     Example:
     sportsAPI.getFixtures({
       league: 39,
       season: 2025,
       from: '2025-08-01',
       to: '2025-08-31'
     })
  ------------------------------------------------------- */

  getFixtures: (params) =>
    api.get('/sports/fixtures', {
      params,
    }),

  /* -------------------------------------------------------
     GET STANDINGS
     Example:
     sportsAPI.getStandings({
       league: 39,
       season: 2025
     })
  ------------------------------------------------------- */

  getStandings: (params) =>
    api.get('/sports/standings', {
      params,
    }),

  /* -------------------------------------------------------
     GET TOP SCORERS
     Example:
     sportsAPI.getTopScorers({
       league: 39,
       season: 2025
     })
  ------------------------------------------------------- */

  getTopScorers: (params) =>
    api.get('/sports/topscorers', {
      params,
    }),
};

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default api;

