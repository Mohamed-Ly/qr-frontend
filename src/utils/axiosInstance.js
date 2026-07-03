/**
 * axiosInstance.js
 * ─────────────────────────────────────────────────────────────
 * Axios instance with full Refresh Token Rotation support.
 *
 * Flow:
 *  1. Request interceptor → attach Bearer accessToken
 *  2. Response interceptor → on 401 or 403:
 *       a. Try POST /auth/refresh with stored refreshToken
 *       b. On success → save new tokens → retry original request
 *       c. On failure → clear storage → redirect to /login
 *
 * Guards:
 *  - Only one refresh call at a time (queue pattern)
 *  - Never refresh for the /auth/login or /auth/refresh endpoints
 * ─────────────────────────────────────────────────────────────
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ── Internal state ────────────────────────────────────────────
let isRefreshing = false;          // are we currently refreshing?
let failedQueue  = [];             // requests waiting for the new token

/**
 * After refresh resolves/rejects — flush the queue
 */
function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  failedQueue = [];
}

// ── Helper: clear all auth data and go to login ───────────────
function clearAndRedirect() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

// ── Request interceptor: attach access token ──────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 / 403 ───────────────────
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const status          = error.response?.status;

    // Skip refresh logic for auth endpoints themselves
    const isAuthUrl = originalRequest.url?.includes('/auth/login') ||
                      originalRequest.url?.includes('/auth/refresh');

    // Trigger refresh on 401 or 403 (backend returns 403 for expired access token)
    const shouldRefresh = (status === 401 || status === 403) &&
                          !originalRequest._retry &&
                          !isAuthUrl;

    if (!shouldRefresh) {
      // For login failures (401 from /auth/login) just reject normally
      return Promise.reject(error);
    }

    // Mark so we don't retry infinitely
    originalRequest._retry = true;

    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) {
      clearAndRedirect();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Another refresh is in flight — queue this request
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      // Call /auth/refresh directly with axios (not our intercepted instance)
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken: storedRefreshToken,
      });

      // Backend returns: { status:'success', data:{ accessToken, refreshToken } }
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        data.data;

      // Persist new tokens
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      // Flush queued requests with new token
      processQueue(null, newAccessToken);

      // Retry the original request
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);

    } catch (refreshError) {
      // Refresh failed (token revoked / expired) → logout
      processQueue(refreshError, null);
      clearAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
