
import axios from 'axios';

/* =========================================================
   API CONFIGURATION
========================================================= */

const API_URL = 'https://mahokofridaynewsbackend.onrender.com';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
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
  (error) => Promise.reject(error)
);

/* =========================================================
   RESPONSE INTERCEPTOR
========================================================= */

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;

    if (status === 401) {
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
========================================================= */

export const resolveImg = (path) => {
  if (!path || typeof path !== 'string') {
    return '/placeholder.jpg';
  }

  const trimmedPath = path.trim();

  if (!trimmedPath) {
    return '/placeholder.jpg';
  }

  // Cloudinary / external image
  if (
    trimmedPath.startsWith('http://') ||
    trimmedPath.startsWith('https://') ||
    trimmedPath.startsWith('data:')
  ) {
    return trimmedPath;
  }

  // Remove leading slash
  let cleanPath = trimmedPath.replace(/^\/+/, '');

  // Remove uploads/ if backend already included it
  cleanPath = cleanPath.replace(/^uploads\//i, '');

  return `${API_URL}/uploads/${cleanPath}`;
};

export const imgUrl = resolveImg;

/* =========================================================
   STORIES API
========================================================= */

export const storiesAPI = {
  getAll: (params = {}) =>
    api.get('/stories', {
      params,
    }),

  getOne: (id) =>
    api.get(`/stories/${id}`),

  getPopular: (params = {}) =>
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

  getStories: (id, params = {}) =>
    api.get(`/authors/${id}/stories`, {
      params,
    }),

  create: (data) =>
    api.post('/authors', data),

  update: (id, data) =>
    api.put(`/authors/${id}`, data),

  /*
   * NOTE:
   * Backend code you provided does not currently contain
   * DELETE /authors/:id.
   */
};

/* =========================================================
   COMMENTS API
========================================================= */

export const commentsAPI = {
  // ADMIN
  getAll: (params = {}) =>
    api.get('/comments', {
      params,
    }),

  // PUBLIC
  getByStory: (id) =>
    api.get(`/comments/story/${id}`),

  // PUBLIC
  create: (data) =>
    api.post('/comments', data),

  // ADMIN / EDITOR
  approve: (id) =>
    api.put(`/comments/${id}/approve`),

  // ADMIN / EDITOR
  spam: (id) =>
    api.put(`/comments/${id}/spam`),

  // ADMIN
  delete: (id) =>
    api.delete(`/comments/${id}`),
};

/* =========================================================
   VIDEOS API
========================================================= */

export const videosAPI = {
  getAll: (params = {}) =>
    api.get('/videos', {
      params,
    }),

  create: (data) =>
    api.post('/videos', data),

  update: (id, data) =>
    api.put(`/videos/${id}`, data),

  delete: (id) =>
    api.delete(`/videos/${id}`),
};

/* =========================================================
   ADS API
========================================================= */

export const adsAPI = {
  // PUBLIC
  getAll: (params = {}) =>
    api.get('/ads', {
      params,
    }),

  // ADMIN
  getAllAdmin: () =>
    api.get('/ads/all'),

  // ADMIN
  create: (data) =>
    api.post('/ads', data),

  // NOTE:
  // Backend route /ads/:id/toggle is not present
  // in the backend code you provided.
  toggle: (id) =>
    api.put(`/ads/${id}/toggle`),

  // ADMIN
  update: (id, data) =>
    api.put(`/ads/${id}`, data),

  // ADMIN
  delete: (id) =>
    api.delete(`/ads/${id}`),
};

/* =========================================================
   SUBSCRIBE API
========================================================= */

export const subscribeAPI = {
  // PUBLIC
  subscribe: (data) =>
    api.post('/subscribe', data),

  // ADMIN / EDITOR
  getAll: () =>
    api.get('/subscribers'),

  // ADMIN
  delete: (id) =>
    api.delete(`/subscribers/${id}`),
};

/* =========================================================
   ANALYTICS API
========================================================= */

export const analyticsAPI = {
  getOverview: () =>
    api.get('/analytics/overview'),

  /*
   * NOTE:
   * Your backend code references /audit-logs in frontend,
   * but the backend file you provided does not define
   * GET /audit-logs.
   */
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
   NEWSLETTER API
========================================================= */

export const newsletterAPI = {
  send: (data) =>
    api.post('/newsletter/send', data),
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
   MATCHES BACKEND:
   GET /api/sports/fixtures
   GET /api/sports/standings
   GET /api/sports/topscorers
========================================================= */

export const sportsAPI = {

  /* -------------------------------------------------------
     FIXTURES

     Backend:
     GET /api/sports/fixtures

     Example:
     sportsAPI.getFixtures({
       league: 140,
       season: 2026,
       from: '2026-08-26',
       to: '2026-09-07'
     });
  ------------------------------------------------------- */

  getFixtures: (params = {}) => {
    return api.get('/sports/fixtures', {
      params,
    });
  },

  /* -------------------------------------------------------
     STANDINGS

     Backend:
     GET /api/sports/standings

     Example:
     sportsAPI.getStandings({
       league: 140,
       season: 2026
     });
  ------------------------------------------------------- */

  getStandings: (params = {}) => {
    return api.get('/sports/standings', {
      params,
    });
  },

  /* -------------------------------------------------------
     TOP SCORERS

     Backend:
     GET /api/sports/topscorers

     Example:
     sportsAPI.getTopScorers({
       league: 140,
       season: 2026
     });
  ------------------------------------------------------- */

  getTopScorers: (params = {}) => {
    return api.get('/sports/topscorers', {
      params,
    });
  },
};

/* =========================================================
   HELPER: SPORTS ERROR MESSAGE
========================================================= */

export const getApiErrorMessage = (error) => {
  if (!error) {
    return 'Unknown error';
  }

  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.message) {
    return error.message;
  }

  return 'Request failed';
};

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default api;

