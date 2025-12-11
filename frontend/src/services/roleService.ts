import api from './api';
import { Role, GenericResponse } from '../types';

export const roleService = {
  getAll: async () => {
    const response = await api.get<GenericResponse<Role[]>>('/role/');
    return response.data.data;
  },

  create: async (data: Partial<Role>) => await api.post('/role/', data),
  update: async (id: number, data: Partial<Role>) => await api.put(`/role/${id}`, data),
  delete: async (id: number) => await api.delete(`/role/${id}`),
};
