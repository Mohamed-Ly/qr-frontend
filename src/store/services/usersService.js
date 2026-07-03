import api from '../../utils/axiosInstance';

export const usersService = {
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data.data; // Backend returns { users: [], pagination: {} }
  },
  
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data.data.user; // Backend returns { message, user }
  },
  
  updateUser: async (id, userData) => {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data.data.user;
  },
  
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data.data;
  },

  toggleUserStatus: async (id, newStatus) => {
    const response = await api.patch(`/users/${id}/status`, { status: newStatus });
    return response.data.data.user;
  }
};
