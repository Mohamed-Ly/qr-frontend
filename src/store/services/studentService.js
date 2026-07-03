import api from '../../utils/axiosInstance';

export const studentService = {
  getDashboardStats: async (params = {}) => {
    const response = await api.get('/dashboard/student', { params });
    return response.data.data;
  }
};
