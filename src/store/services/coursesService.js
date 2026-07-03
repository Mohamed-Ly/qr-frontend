import api from '../../utils/axiosInstance';

export const coursesService = {
  getCourses: async (params = {}) => {
    const response = await api.get('/courses', { params });
    return response.data.data; // Backend returns { courses: [], pagination: {} }
  },
  
  createCourse: async (courseData) => {
    const response = await api.post('/courses', courseData);
    return response.data?.data?.course ?? response.data?.data;
  },
  
  updateCourse: async (id, courseData) => {
    const response = await api.patch(`/courses/${id}`, courseData);
    return response.data?.data?.course ?? response.data?.data;
  },
  
  deleteCourse: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data?.data;
  },

  enrollStudent: async (courseId, studentId) => {
    const response = await api.post('/enrollments/enroll', { courseId, studentId });
    return response.data?.data;
  },

  unenrollStudent: async (courseId, studentId) => {
    const response = await api.delete(`/enrollments/courses/${courseId}/students/${studentId}`);
    return response.data?.data;
  },

  getCourseStudents: async (courseId) => {
    const response = await api.get(`/enrollments/courses/${courseId}/students`);
    return response.data?.data?.students ?? response.data?.data ?? [];
  }
};
