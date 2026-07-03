import api from '../../utils/axiosInstance';

export const adminService = {
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data.data;
  },
  
  getGeneralReports: async () => {
    const response = await api.get('/reports/general-stats');
    return response.data.data;
  },
  
  getTopAbsentStudents: async () => {
    const response = await api.get('/reports/top-absent-students');
    return response.data.data;
  }
};
