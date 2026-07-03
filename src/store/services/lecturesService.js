import api from '../../utils/axiosInstance';

/**
 * Lectures Service — /api/lectures
 * ADMIN: full CRUD + list all
 * INSTRUCTOR: create / update / close their own lectures
 */
export const lecturesService = {
  getAll: (params = {}) => api.get('/lectures', { params }),
  getById: (id)         => api.get(`/lectures/${id}`),
  create: (data)        => api.post('/lectures', data),
  update: (id, data)    => api.patch(`/lectures/${id}`, data),
  delete: (id)          => api.delete(`/lectures/${id}`),
  close:  (id)          => api.patch(`/lectures/${id}/close`),
};
