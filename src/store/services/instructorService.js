import api from '../../utils/axiosInstance';

export const instructorService = {
  getDashboardStats: async (params = {}) => {
    const response = await api.get('/dashboard/instructor', { params });
    return response.data.data;
  },
};
