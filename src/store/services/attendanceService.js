import api from '../../utils/axiosInstance';

/**
 * Attendance Service — /api/attendance
 */
export const attendanceService = {
  getAll:            async (params={}) => {
    const response = await api.get('/attendance', { params });
    return response.data.data;
  },
  getById:           async (id)        => {
    const response = await api.get(`/attendance/${id}`);
    return response.data.data;
  },
  update:            async (id, data)  => {
    const response = await api.patch(`/attendance/${id}`, data);
    return response.data.data;
  },
  delete:            async (id)        => api.delete(`/attendance/${id}`),
  getStudentSummary: async (studentId, params={}) => {
    const response = await api.get(`/attendance/summary/students/${studentId}`, { params });
    return response.data.data;
  },
  getCourseSummary:  async (courseId,  params={}) => {
    const response = await api.get(`/attendance/summary/courses/${courseId}`,  { params });
    return response.data.data;
  },
};
