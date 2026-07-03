import api from '../../utils/axiosInstance';

/**
 * Reports Service — /api/reports
 * ADMIN: all report endpoints
 */
export const reportsService = {
  getGeneralStats:         async (params={}) => { const res = await api.get('/reports/general-stats', { params }); return res.data.data; },
  getTopAbsentStudents:    async (params={}) => { const res = await api.get('/reports/top-absent-students', { params }); return res.data.data; },
  getMostCommittedCourses: async (params={}) => { const res = await api.get('/reports/most-committed-courses', { params }); return res.data.data; },
  getInstructorPerformance:async (id, params={}) => { const res = await api.get(`/reports/instructors/${id}/performance`, { params }); return res.data.data; },
  getDepartmentStats:      async (id, params={}) => { const res = await api.get(`/reports/departments/${id}/stats`, { params }); return res.data.data; },
  getDetailedReport:       async (params={}) => { const res = await api.get('/reports/detailed', { params }); return res.data.data; },
  getDetailedReportFile:   async (params={}) => api.get('/reports/detailed', { params, responseType: 'blob' }),
};
