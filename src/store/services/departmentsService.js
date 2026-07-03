import api from '../../utils/axiosInstance';

export const departmentsService = {
  getDepartments: async (params = {}) => {
    const response = await api.get('/departments', { params });
    return response.data.data; // Backend returns { departments: [], pagination: {} }
  },
  
  createDepartment: async (deptData) => {
    const response = await api.post('/departments', deptData);
    return response.data?.data?.department ?? response.data?.data;
  },
  
  updateDepartment: async (id, deptData) => {
    const response = await api.patch(`/departments/${id}`, deptData);
    return response.data?.data?.department ?? response.data?.data;
  },
  
  deleteDepartment: async (id) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data?.data;
  }
};
