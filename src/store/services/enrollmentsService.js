import api from '../../utils/axiosInstance';

/**
 * Enrollments Service — /api/enrollments
 * ADMIN: enroll / unenroll / list course students / list student courses
 */
export const enrollmentsService = {
  enroll:           (studentId, courseId) => api.post('/enrollments/enroll', { studentId, courseId }),
  unenroll:         (studentId, courseId) => api.delete(`/enrollments/courses/${courseId}/students/${studentId}`),
  getCourseStudents: async (courseId, params={}) => {
    const response = await api.get(`/enrollments/courses/${courseId}/students`, { params });
    return response.data.data;
  },
  getStudentCourses: async (studentId, params={}) => {
    const response = await api.get(`/enrollments/students/${studentId}/courses`, { params });
    return response.data.data;
  },
};
