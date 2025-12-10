import api from './api';
import { Permission, GenericResponse } from '../types';

export const permissionService = {
  getAll: async () => {
    const response = await api.get<GenericResponse<Permission[]>>('/permission/');
    return response.data.data;
  },
  
  create: async (data: Partial<Permission>) => await api.post('/permission/', data),
  update: async (id: number, data: Partial<Permission>) => await api.put(`/permission/${id}`, data),
  delete: async (id: number) => await api.delete(`/permission/${id}`),
};
