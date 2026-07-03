import api from '../../utils/axiosInstance';

export const qrService = {
  // Generate QR code for a lecture
  generateQr: async (lectureId, expiresInMinutes = 15) => {
    const response = await api.post(`/qr/lectures/${lectureId}/generate`, { expiresInMinutes });
    return response.data.data;
  },

  // Verify QR code and mark attendance (Student)
  verifyQr: async (token, lectureId) => {
    const response = await api.post(`/qr/verify`, { token, lectureId });
    return response.data.data;
  },

  // Get all QR tokens for a lecture
  getLectureQrTokens: async (lectureId, params = {}) => {
    const response = await api.get(`/qr/lectures/${lectureId}/tokens`, { params });
    return response.data.data;
  },

  // Revoke QR code
  revokeQr: async (token) => {
    const response = await api.post(`/qr/revoke`, { token });
    return response.data.data;
  }
};
