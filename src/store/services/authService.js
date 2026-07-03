import api from '../../utils/axiosInstance';

/**
 * Auth Service — يتعامل مع /api/auth
 * POST /api/auth/login  → { identifier, password }
 * POST /api/auth/logout-all  → يلغي جميع tokens
 */

export const authService = {
  /**
   * تسجيل الدخول
   * @param {string} identifier - البريد الإلكتروني أو رقم الهاتف
   * @param {string} password
   * @returns {{ user, accessToken, refreshToken }}
   */
  login: async (identifier, password) => {
    const response = await api.post('/auth/login', { identifier, password });
    return response.data.data; // { user, accessToken, refreshToken }
  },

  /**
   * تسجيل الخروج من جميع الأجهزة
   */
  logoutAll: async () => {
    await api.post('/auth/logout-all');
  },
};
