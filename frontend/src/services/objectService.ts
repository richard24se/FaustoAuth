import api from './api';
import { AuthObject, GenericResponse } from '../types';

export const objectService = {
  getAll: async () => {
    const response = await api.get<GenericResponse<AuthObject[]>>('/object/');
    return response.data.data;
  },

  create: async (data: Partial<AuthObject>) => await api.post('/object/', data),
  update: async (id: number, data: Partial<AuthObject>) => await api.put(`/object/${id}`, data),
  delete: async (id: number) => await api.delete(`/object/${id}`),
};
